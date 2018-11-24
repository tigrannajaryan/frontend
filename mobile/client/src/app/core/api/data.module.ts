import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { AuthProcessState } from '~/shared/storage/auth-process-state';
import { AuthService } from '~/shared/api/auth.api';
import { BookingData } from '~/core/api/booking.data';
import { BookingApi } from '~/core/api/booking.api';
import { BookingApiMock } from '~/core/api/booking.api.mock';
import { ServicesService } from '~/core/api/services.service';
import { StylistsService } from '~/core/api/stylists.service';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { ProfileApi } from '~/core/api/profile-api';
import { ProfileDataStore } from '~/profile/profile.data';
import { FollowersApi } from '~/core/api/followers.api';
import { NotificationsApi } from '~/shared/push/notifications.api';
import { AppModule } from '~/app.module';
import { DataStore } from '~/shared/storage/data-store';

/**
 * Common data module that includes singletons for the entire app.
 */

@NgModule({
  imports: [
    IonicModule
  ],
  // Add API service providers in the 'providers' array here
  providers: [
    // services
    AppointmentsApi,
    AuthService,
    BookingApi,
    BookingApiMock,
    ProfileApi,
    StylistsService,
    FollowersApi,
    ServicesService,
    NotificationsApi
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
        AuthProcessState,
        PreferredStylistsData,
        ProfileDataStore,
        BookingData
      ]
    };
  }
}

export async function clearAllDataStores(): Promise<void> {
  // Get all data store classes:
  const dataStores = DataModule.forRoot().providers;
  // Require one by one and clear it’s data:
  for (const storeClass of dataStores) {
    const store = AppModule.injector.get(storeClass);
    if (store instanceof DataStore) {
      // Just calling DataStore.prototype.clear:
      await store.clear();
    } else {
      // Search for DataStore as a prop and call DataStore.prototype.clear on it:
      for (const propName of Object.getOwnPropertyNames(store)) {
        const prop = store[propName];
        if (prop instanceof DataStore) {
          await prop.clear();
        }
      }
    }
  }
}
