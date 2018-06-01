import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { CoreModule } from '~/core/core.module';
import { serverStatusReducer } from '~/shared/server-status/server-status.reducer';

/**
 * Function to prepare the TestBed and make sure shared modules, components
 * stores are available during test execution.
 */
export const prepareSharedObjectsForTests = () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        StoreModule.forRoot({
          serverStatus: serverStatusReducer
        })
      ]
    });
  });
};
