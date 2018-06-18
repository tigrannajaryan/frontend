import { LoadingController } from 'ionic-angular';
import { Loading } from 'ionic-angular/components/loading/loading';
import { AppModule } from '~/app.module';

type AsyncFunction = (...args: any[]) => Promise<any>;
type LoadingDescriptor = TypedPropertyDescriptor<AsyncFunction>;

/**
 * This function is used as a component’s async method decorator.
 * It will show loader when attached. E.g.:
 * ```
 *   @loading
 *   async loadData(): Promise<void> {
 * ```
 */
export function loading(target: any, name: string, descriptor: LoadingDescriptor): LoadingDescriptor {
  const original = descriptor.value;

  // Some of tslint rules are disabled because a context should be bound when the function is called.
  // tslint:disable:only-arrow-functions, no-invalid-this
  descriptor.value = async function(...args): Promise<any> {
    const loadingCtrl = AppModule.injector.get(LoadingController);
    const loader: Loading = loadingCtrl.create();
    loader.present();
    try {
      return await original.call(this, ...args);
    } finally {
      loader.dismiss();
    }
  };

  return descriptor;
}

/**
 * This function is used as some async function decorator.
 * It will show loader when attached.
 * ```
 * withLoader(() => {…})
 * ```
 */
export function withLoader(original: AsyncFunction): AsyncFunction {
  // tslint:disable:only-arrow-functions
  return async function(...args): Promise<any> {
    const loadingCtrl = AppModule.injector.get(LoadingController);
    const loader: Loading = loadingCtrl.create();
    loader.present();
    try {
      return await original(...args);
    } finally {
      loader.dismiss();
    }
  };
}
