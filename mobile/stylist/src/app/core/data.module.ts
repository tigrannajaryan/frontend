import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { ClientsApi } from '~/core/api/clients-api';
import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { DataStore } from '~/shared/storage/data-store';

import { AllClientsDataStore } from '~/clients/all-clients/all-clients.data';
import { MyClientsDataStore } from '~/clients/my-clients/my-clients.data';
import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { ProfileDataStore } from '~/core/profile.data';
import { AppModule } from '~/app.module';
import { AppointmentsDataStore } from '~/home-slots/appointments.data';
import { RegistrationForm } from '~/onboarding/registration.form';

export enum DataCacheKey {
  allClients = 'allClients',
  myClients = 'myClients',
  profile = 'profile',
  profileStatus = 'profileStatus',
  stylistServices = 'stylistServices',
  appointments = 'appointments'
}

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
    ClientsApi,
    StylistProfileApi,
    StylistServiceProvider
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
        AllClientsDataStore,
        AppointmentsDataStore,
        MyClientsDataStore,
        ProfileDataStore,
        RegistrationForm,
        StylistServicesDataStore
      ]
    };
  }
}

/**
 * Clear cached content of all data stores. Normally used by Logout or Login actions
 * to make sure we don't have stale data (e.g. if we need to login using a different user).
 * Note that this uses DataStore.reinit() method which clears cache and invalidates
 * all subscribed observers. If you have an observer that you want to continue receiving
 * updates to the data changes you must subscribe to the corresponding DataStore observable
 * again after calling this function.
 */
export async function clearAllDataStores(): Promise<void> {
  // Get all data store classes:
  const dataStores = DataModule.forRoot().providers;
  // Require one by one and clear it’s data:
  for (const storeClass of dataStores) {
    const store = AppModule.injector.get(storeClass);
    if (store instanceof DataStore) {
      await store.reinit();
    } else {
      // Search for DataStore as a prop and call DataStore.prototype.clear on it:
      for (const propName of Object.getOwnPropertyNames(store)) {
        const prop = store[propName];
        if (prop instanceof DataStore) {
          await prop.reinit();
        }
      }
    }
  }
}
