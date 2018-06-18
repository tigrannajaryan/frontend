import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { selectServerStatusState, ServerStatusState } from './server-status.reducer';

/**
 * A server status indicator component that visualizes the global state
 * stored in Store<ServerStatusState>.
 */
@Component({
  selector: 'server-status',
  templateUrl: 'server-status.component.html'
})
export class ServerStatusComponent implements OnInit, OnDestroy {

  @Input()
  errorText: string;

  subscription: Subscription;

  constructor(
    private store: Store<ServerStatusState>) {}

  ngOnInit(): void {
    this.subscription = this.store.select(selectServerStatusState).subscribe(
      state => {
        if (!state.isServerReachable) {
          this.errorText = 'Service is currently unavailable.';
        } else if (!state.isOnline) {
          this.errorText = 'No network. Check your connection.';
        } else if (state.isServerError) {
          this.errorText = state.serverErrorText;
        } else {
          // This will hide the error banner
          this.errorText = undefined;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
