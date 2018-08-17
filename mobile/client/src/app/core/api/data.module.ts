import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { ENV } from '~/../environments/environment.default';

import { BaseService } from '~/core/api/base-service';
import { BaseApiService } from '~/shared/base-api-service';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';

import { AuthService } from '~/core/api/auth-service';
import { AuthServiceMock } from '~/core/api/auth-service.mock';

import { BookingApi } from '~/core/api/booking.api';
import { BookingApiMock } from '~/core/api/booking.api.mock';
import { BookingData } from '~/core/api/booking.data';

import { ServicesService } from '~/core/api/services-service';
import { ServicesServiceMock } from '~/core/api/services-service.mock';

import { StylistsService } from '~/core/api/stylists-service';
import { StylistsServiceMock } from '~/core/api/stylists-service.mock';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { ProfileService } from '~/core/api/profile-service';
import { ProfileServiceMock } from '~/core/api/profile-service.mock';
import { ProfileDataStore } from '~/profile/profile.data';

const offlineServices = [
  { provide: AuthService, useClass: AuthServiceMock },
  { provide: AppointmentsApi, useClass: AppointmentsApiMock },
  { provide: BookingApi, useClass: BookingApiMock },
  { provide: ProfileService, useClass: ProfileServiceMock },
  { provide: ServicesService, useClass: ServicesServiceMock },
  { provide: StylistsService, useClass: StylistsServiceMock }
];

const onlineServices = [
  AppointmentsApi,
  AuthService,
  BookingApi,
  ProfileService,
  ServicesService,
  StylistsService
];

/**
 * Common data module that includes singletons for the entire app.
 */

@NgModule({
  imports: [
    IonicModule
  ],
  // Add API service providers in the 'providers' array here
  providers: [
    BaseService,
    BaseApiService,
    ...(ENV.offline ? offlineServices : onlineServices),
    // TODO: remove mocks before release
    AppointmentsApiMock,
    BookingApiMock
  ]
})
export class DataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DataModule,
      // Add singletons in the 'providers' array here. Note: do not add these providers anywhere else in
      // 'providers' property of any other module, otherwise you will have duplicate objects instead
      // of singletons.
      providers: [
        AppointmentsDataStore,
        PreferredStylistsData,
        ProfileDataStore,
        BookingData
      ]
    };
  }
}
