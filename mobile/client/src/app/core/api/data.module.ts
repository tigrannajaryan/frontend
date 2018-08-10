import { ModuleWithProviders, NgModule } from '@angular/core';

import { IonicModule } from 'ionic-angular';
import { AppointmentsHistoryApi } from './appointments-history.api';
import { AppointmentsHistoryDataStore } from './appointments-history.data';

/**
 * Common data module that includes ApiDataStore singletons for the entire app.
 */

@NgModule({
  imports: [
    IonicModule
  ],
  // Add API service providers in the 'providers' array here
  providers: [
    AppointmentsHistoryApi
  ]
})
export class DataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DataModule,
      // Add ApiDataStore singletons in the 'providers' array here
      providers: [AppointmentsHistoryDataStore]
    };
  }
}
