import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

const RESEND_CODE_TIMEOUT_SECONDS = 120; // 2min

/**
 * Singleton that stores authentication process state.
 * For now it is just the code re-request countdown, but the intent
 * is to get rid of ngrx based state, reducers and effects and move it here.
 */
@Injectable()
export class AuthProcessState {
  private rerequestCodeTimeout = new BehaviorSubject<number>(0);

  constructor(private ngZone: NgZone) {
    // We must run this repetitive action outside Angular Zone otherwise
    // Protractor thinks that Angular is always busy, which results in Protractor
    // waiting infinitely for Angular and tests timing out.
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.ngZone.run(() => {
          if (this.rerequestCodeTimeout.value > 0) {
            this.rerequestCodeTimeout.next(this.rerequestCodeTimeout.value - 1);
          }
        });
      }, 1000);
    });
  }

  beginRerequestCountdown(): void {
    this.rerequestCodeTimeout.next(RESEND_CODE_TIMEOUT_SECONDS);
  }

  rerequestCodeTimeoutAsObservable(): Observable<number> {
    return this.rerequestCodeTimeout.asObservable();
  }
}
