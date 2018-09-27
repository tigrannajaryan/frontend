import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthProcessStateMock {
  beginRerequestCountdown(): void {
    // do nothing
  }

  rerequestCodeTimeoutAsObservable(): Observable<number> {
    // temp disable countdown
    return Observable.of(0);
  }
}
