// tslint:disable:only-arrow-functions

import { Observable, ReplaySubject } from 'rxjs';

/**
 * Use .takeUntil(componentUnloaded(this))
 * (based on https://www.npmjs.com/package/ng2-rx-componentdestroyed).
 */
export function componentUnloaded(component): Observable<true> {
  if (component.__unloaded$) {
    return component.__unloaded$;
  }

  // save original method
  const ionViewWillUnload = component.ionViewWillUnload;

  const stop$ = new ReplaySubject<true>();

  component.ionViewWillUnload = function(): void {
    ionViewWillUnload && ionViewWillUnload.apply(component);
    component.__unloaded$.source.next(true);
    component.__unloaded$.source.complete();
  };

  // if called earlier than in ionViewWillLoad
  return component.__unloaded$ = stop$.asObservable();
}
