import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/distinctUntilChanged';
import { Store } from './store-model';

/**
 * StoreService its app store for saving data from server
 * here we keeps the latest data from the server
 */
@Injectable()
export class StoreService {
  _store = new BehaviorSubject<Store>({});
  changes = this._store.asObservable()
    .distinctUntilChanged();

  setState(state: Store): void {
    this._store.next(state);
  }

  getState(): any { // any = fast fix of "expected call-signature: 'getState' to have a typedef"
    return this._store.value;
  }

  purge(): void {
    this._store.next({});
  }
}
