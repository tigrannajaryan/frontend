import { ModuleWithProviders, NgModule } from '@angular/core';

import { IonicModule } from 'ionic-angular';
import { AppointmentsApi } from './appointments.api';
import { AppointmentsDataStore } from './appointments.datastore';
import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';

/**
 * Common data module that includes ApiDataStore singletons for the entire app.
 */

@NgModule({
  imports: [
    IonicModule
  ],
  // Add API service providers in the 'providers' array here
  providers: [
    AppointmentsApi,
    AppointmentsApiMock
  ]
})
export class DataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DataModule,
      // Add ApiDataStore singletons in the 'providers' array here
      providers: [AppointmentsDataStore]
    };
  }
}
