import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { CoreModule } from '~/core/core.module';
import { DataModule } from '~/core/data.module';
import { SharedSingletonsModule } from '~/shared/shared-singletons.module';

/**
 * Function to prepare the TestBed and make sure shared modules, components
 * stores are available during test execution.
 */
export const prepareSharedObjectsForTests = () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        DataModule.forRoot(),
        SharedSingletonsModule,
        StoreModule.forRoot({})
      ]
    });
  });
};
