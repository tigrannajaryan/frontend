import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { AppointmentsHistoryApi } from '~/core/api/appointments-history.api';
import { AppointmentsHistoryDataStore } from '~/core/api/appointments-history.data';

import { AuthService } from '~/core/api/auth-service';
import { AuthServiceMock } from '~/core/api/auth-service.mock';

import { ProfileService } from '~/core/api/profile-service';
import { ProfileDataStore } from '~/profile/profile.data';

import { ServicesService } from '~/core/api/services-service';
import { ServicesServiceMock } from '~/core/api/services-service.mock';

import { StylistsService } from '~/core/api/stylists-service';
import { StylistsServiceMock } from '~/core/api/stylists-service.mock';

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
    AppointmentsHistoryApi,
    AuthService,
    ProfileService,
    StylistsService,
    ServicesService,

    // services mocks
    AuthServiceMock,
    StylistsServiceMock,
    ServicesServiceMock
  ]
})
export class DataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DataModule,
      // Add ApiDataStore singletons in the 'providers' array here
      providers: [
        AppointmentsHistoryDataStore,
        ProfileDataStore
      ]
    };
  }
}
