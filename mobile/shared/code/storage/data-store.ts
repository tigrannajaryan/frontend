import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/first';

import { ApiResponse } from '~/shared/api/base.models';
import { ApiRequestOptions } from '~/shared/api-errors';
import { AppModule } from '~/app.module';

/**
 * An async data source, either a Promise or Observable
 */
type AsyncDataSource<T> = Promise<T> | Observable<T>;

/**
 * Takes an AsyncDataSource and converts to a Promise.
 */
function dataSourceToPromise<T>(dataSource: AsyncDataSource<T>): Promise<T> {
  if (dataSource instanceof Observable) {
    dataSource = dataSource.first().toPromise();
  }
  return dataSource;
}

interface DataStorePersistent<T> {
  response: T;
  lastUpdated: Date;
}

export interface GetOptions {
  refresh?: boolean;
  requestOptions?: ApiRequestOptions;
}

interface DataStoreOptions {
  cacheTtlMilliseconds?: number;
}

/**
 * DataStore is a simple local storage of API responses that we
 * can use on many Client App screens to easily support the following:
 *
 * - Centralized stored of a data that is used by many different screens
 *   (e.g. User Profile data)
 *
 * - Caching of the data and manual refreshing of cache.
 *   The data is persistently cached, so it survives application restarts.
 *
 * - Initiating preloading of the data from any other view to make views
 *   that use the data appear faster.
 *
 * - Supports direct setting of data in the local storage to support
 *   scenarios where the data can be modified by the user locally
 *   (e.g. User Profile editing).
 *
 * The source of the data is any function that returns an async ApiResponse<T>,
 * which is the typical signature of all our API services, so it can be used
 * with any API service.
 *
 * This class supports both pull and push models of operation: you can
 * pull and ask for data using get() function or you can observe the changes
 * in the data which is exposed as an Observable and will be pushed to you
 * when the changes happen.
 *
 * The typical usage pattern is to create a singleton that contains a DataStore
 * and is Injectable in views which need to works with this data. For example let's
 * assume we have ClientProfileApi class which implements getProfile() function
 * which returns ClientProfileResponse data. We can declare MyDataStore like this:
 *
 *   @Injectable()
 *   export class MyDataStore {
 *     readonly profile: DataStore<ClientProfileResponse>;
 *     constructor(api: MyApiClass) {
 *       this.profile = new DataStore('clientProfile', api.getProfile);
 *     }
 *   }
 *
 * then we can use it from ClientProfileView TS like this:
 *
 *   constructor(private dataStore: MyDataStore) {
 *     this.profileData = this.dataStore.profile.asObservable();
 *   }
 *   ionViewWillEnter(): void {
 *     this.dataStore.profile.get();
 *   }
 *
 * and in the HTML do this:
 *
 *   <div *ngIf="(profileData | async)?.response as profile">{{ profile.first_name }}</div>
 *
 * Alternatively we can use subscribe() function to work with data in the code, e.g.:
 *
 *   ionViewWillEnter(): void {
 *     this.subscription = dataStore.subscribe('clientProfile', data => { this.profile = data; });
 *   }
 *   ionViewWillLeave(): void {
 *     this.subscription.unsubscribe();
 *   }
 *
 * and in the HTML do this:
 *
 *   <div *ngIf="profile>{{ profile.first_name }}</div>
 *
 * You can also set the data directly if it is modified in a view, e.g.
 *   submit(): void {
 *      const profileData = { first_name: ... };
 *      this.dataStore.profile.set(profileData);
 *   }
 *
 * To perform preloading of data from any other view just inject MyDataStore
 * into that view and call the get() method, e.g.:
 *
 *   constructor(private dataStore: MyDataStore) {}
 *   ionViewDidEnter(): void {
 *     this.dataStore.profile.get({ refresh: true });
 *   }
 *
 * Note: how we use ionViewDidEnter() instead of ionViewWillEnter to avoid delaying
 * the loading of this view due to processing time spent on preloading operation.
 *
 */
export class DataStore<T> {

  // Last value of API response
  private subject: BehaviorSubject<ApiResponse<T>>;

  // Currently ongoing get or set operation
  private promise: Promise<ApiResponse<T>>;

  // The key for Ionic Storage
  private storageKey: string;

  /**
   * The cached data is persisted in Ionic Storage with a storeName that must be unique across the app.
   * You can use a descriptive key name for easier debugging or use any unique
   * id that remains the same when App restarts.
   *
   * Link to an API endpoint and make it the source of the data for a specified
   * property of data model T.
   *
   * The cached data is associated with storeName that must be unique across the app.
   * You can use a descriptive key name for easier debugging or use any uniquely
   * generated id.
   *
   * The initial observed value if no get() or set() operation is performed is equal to { response: undefined }
   *
   * @param storeName globally unique store name string
   * @param apiEndpoint a function that returns any async data source that returns an ApiResponse<T>
   */
  constructor(
    storeName: string,
    private apiEndpoint: (options?: ApiRequestOptions) => AsyncDataSource<ApiResponse<T>>,
    private options: DataStoreOptions = {}
  ) {
    this.storageKey = `DataStore.${storeName}`;
    this.init();
  }

  /**
   * Method to init/restore the store’s initial state.
   */
  init(): void {
    this.promise = Promise.resolve(undefined);

    const initialValue: ApiResponse<T> = { response: undefined };
    this.subject = new BehaviorSubject<ApiResponse<T>>(initialValue);
  }

  /**
   * Method to clear the store’s state (e.g. on logout).
   */
  clear(): Promise<void> {
    const storage = AppModule.injector.get(Storage);
    return storage.remove(this.storageKey).then(() => {
      this.init();
    });
  }

  /**
   * Get data. Loads it from the original data source if needed.
   *
   * The data is cached in a persistent storage. The result is cached under the specified
   * cacheKey which must be unique globally accross the entire app.
   *
   * If loading succeeds the result is saved in the cache. The return value will have 'response' field
   * of ApiResponse populated and 'errors' will be undefined.
   *
   * If loading fails with an error returns previously cached successful response (if any) in the
   * 'response' field of ApiResponse and the 'errors' field will contain the current errors.
   *
   * We ensure that get() operations are not executed concurrently. If get() is
   * called while the previous async get() request is not yet completed the new
   * call is queued and will be executed after the previous get() is completed.
   *
   * if options.refresh is true will refresh the data from original data source otherwise
   * will return cached value if available.
   */
  get(options?: GetOptions): Promise<ApiResponse<T>> {
    // Chain executions. We create a queue of promises to avoid concurrent get() or set() operations.
    // This prevents concurrent calls to API or concurrent calls to get() or set() functions.
    // Why we need it? It is needed for preloader scenarios.
    // How is preloading usually implemented? The first view calls get(true) to begin preloading data.
    // The API call starts executing. Now imagine I quickly click Next button and go to second view
    // which expects its data to be usually preloaded but cannot rely on it, so to be safe my second
    // view will call get(false), because it does not want to refresh the data but it still wants to
    // make sure the data exists. So this pattern of calls: get(true), get(false) is very common.
    // If I didn't have a mechanism to prevent concurrent execution of get() operations then the second
    // get(false) would try to execute a new API call because the first one is not completed. It would
    // be unnecessary second API call and not what you expect.
    // Instead because we have this mechanism the second get(false) call will wait until the first one
    // is completed and will return the same value from the cache.
    this.promise = this.promise.then(() => {
      return this.performGet(options);
    });

    return this.promise;
  }

  /**
   * Shorthand for get({ refresh: true })
   */
  refresh(): Promise<ApiResponse<T>> {
    return this.get({ refresh: true });
  }

  /**
   * Exposes this data store as an Observable. Useful if you want to observe
   * changes to the data.
   */
  asObservable(): Observable<ApiResponse<T>> {
    return this.subject.asObservable();
  }

  /**
   * Subscribe to all changes to the data. The `next` callback is called anytime the data
   * is changed (e.g. new data is received from the API).
   */
  subscribe(next?: (value: ApiResponse<T>) => void): Subscription {
    return this.subject.subscribe(next);
  }

  /**
   * Return currently stored value of the data.
   */
  value(): ApiResponse<T> {
    return this.subject.value;
  }

  /**
   * Set the stored data directly. Will notify observers.
   */
  set(data: T): Promise<ApiResponse<T>> {
    // Chain executions. We create a queue of promises to avoid concurrent get() or set() operations.
    this.promise = this.promise.then(() => {
      const value: ApiResponse<T> = { response: data };

      // Publish the result to observers
      this.subject.next(value);

      // And save in storage
      const storage = AppModule.injector.get(Storage);
      const cachedData: DataStorePersistent<T> = {
        response: data,
        lastUpdated: new Date()
      };
      storage.set(this.storageKey, cachedData);

      return value;
    });
    return this.promise;
  }

  private async performGet(options: GetOptions): Promise<ApiResponse<T>> {
    const storage = AppModule.injector.get(Storage);

    let retVal: ApiResponse<T>;

    // Get last cached value
    let cachedData: DataStorePersistent<T> = await storage.get(this.storageKey);
    if (cachedData && (!options || !options.refresh)) {
      // Check if cache is expired
      const notExpired =
        this.options.cacheTtlMilliseconds === undefined ||
        new Date(cachedData.lastUpdated).valueOf() + this.options.cacheTtlMilliseconds > new Date().valueOf();

      if (notExpired) {
        // We have a cached value and no refreshing is required, so just return it
        retVal = { response: cachedData.response };
        if (!this.subject.value || cachedData.response !== this.subject.value.response) {
          this.subject.next(retVal);
        }
        return retVal;
      }
    }

    // We don't have a cached value or we need to refresh it, so load it from the api endpoint
    retVal = await dataSourceToPromise(this.apiEndpoint(options ? options.requestOptions : undefined));
    if (retVal.error) {
      // Data loading failed. Return previously cached successful response and current errors.
      retVal.response = cachedData ? cachedData.response : undefined;
    } else {
      // Publish the result to observers
      this.subject.next(retVal);
      // The call was successfull, save the response in the cache
      cachedData = {
        response: retVal.response,
        lastUpdated: new Date()
      };
      storage.set(this.storageKey, cachedData);
    }

    return retVal;
  }
}
