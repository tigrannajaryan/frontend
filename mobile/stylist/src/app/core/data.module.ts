import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { ClientsApi } from '~/shared/stylist-api/clients-api';
import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';

import { AllClientsDataStore } from '~/clients/all-clients/all-clients.data';
import { MyClientsDataStore } from '~/clients/my-clients/my-clients.data';
import { StylistServicesDataStore } from '~/services/services-list/services.data';

export enum DataCacheKey {
  allClients = 'allClients',
  myClients = 'myClients',
  stylistServices = 'stylistServices'
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
        MyClientsDataStore,
        StylistServicesDataStore
      ]
    };
  }
}
