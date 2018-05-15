import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from './shared.module';
import { serverStatusReducer } from './components/server-status/server-status.reducer';

/**
 * Function to prepare the TestBed and make sure shared modules, components
 * stores are available during test execution.
 */
export const prepareSharedObjectsForTests = () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        StoreModule.forRoot({
          serverStatus: serverStatusReducer
        })
      ]
    });
  });
};
