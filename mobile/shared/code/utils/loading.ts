import { Observable } from 'rxjs/Observable';

enum RefresherState {
  refreshing = 'refreshing'
}

interface RefresherLike {
  complete: Function;
  state: string;
}

/**
 * An object that has a loading indicator and optional refresher
 */
interface LoadingComponent {
  isLoading: boolean;
  refresher?: RefresherLike;
}

/**
 * An async data source, either a Promise or Observable
 */
type AsyncDataSource<T> = Promise<T> | Observable<T>;

/**
 * Takes an AsyncDataSource and converts to a Promise.
 */
function dataSourceToPromise<T>(dataSource: AsyncDataSource<T>): Promise<T> {
  if (dataSource instanceof Observable) {
    dataSource = dataSource.toPromise();
  }
  return dataSource;
}

/**
 * Perform async data loading and indicate the loading process in the `isLoading`
 * property of given LoadingComponent.
 * If the component has a `refresher` property then we will also call complete()
 * of refresher at the end (which is the expected behavior for Ionic Refresher component).
 * Note: complete() is only called if refresher.state === 'refreshing' in the beginning.
 * @param comp on which to indicate the loading, must have public isLoading field
 * @param dataSource the source of the data
 */
export async function loading<T>(
  comp: LoadingComponent, dataSource: AsyncDataSource<T>): Promise<T> {

  const isRefresherActive = comp.refresher && comp.refresher.state === RefresherState.refreshing;

  // Start indicating loading if the data does not come in 500ms
  const timer = setTimeout(() => { comp.isLoading = true; }, 500);
  try {
    return await dataSourceToPromise(dataSource);
  } finally {
    clearTimeout(timer);
    comp.isLoading = false;
    if (comp.refresher && isRefresherActive) {
      comp.refresher.complete();
    }
  }
}
