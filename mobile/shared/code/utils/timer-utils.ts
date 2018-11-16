import { NgZone } from '@angular/core';

/**
 * We must run repetitive actions outside Angular Zone otherwise
 * Protractor thinks that Angular is always busy, which results in Protractor
 * waiting infinitely for Angular and tests timing out. Use this function
 * instead of setInterval() to create timers which run your callback outside
 * Angular Zone.
 * @returns timer id which can be stopped using clearInteval()
 */
export async function setIntervalOutsideNgZone(ngZone: NgZone, callback: Function, interval: number): Promise<any> {
  return new Promise((resolve, reject) => {
    ngZone.runOutsideAngular(() => {
      const timerId = setInterval(() => {
        ngZone.run(() => {
          callback();
        });
      }, interval);
      resolve(timerId);
    });
  });
}
