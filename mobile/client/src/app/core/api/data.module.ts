import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';

import { AuthService } from '~/core/api/auth-service';
import { ProfileService } from '~/core/api/profile-service';
import { ServicesService } from '~/core/api/services-service';
import { StylistsService } from '~/core/api/stylists-service';

import { ProfileDataStore } from '~/profile/profile.data';

/**
 * Common data module that includes ApiDataStore singletons for the entire app.
 */

@NgModule({
  imports: [
    IonicModule
  ],
  // Add API service providers in the 'providers' array here
  providers: [
    // services
    AppointmentsApi,
    AppointmentsApiMock, // TODO: remove
    AuthService,
    ProfileService,
    StylistsService,
    ServicesService
  ]
})
export class DataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DataModule,
      // Add ApiDataStore singletons in the 'providers' array here
      providers: [
        AppointmentsDataStore,
        ProfileDataStore
      ]
    };
  }
}
