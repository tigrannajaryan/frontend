import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { ServerStatusTracker } from './server-status-tracker';

/**
 * Common shared module that includes singletons for the entire app.
 */

@NgModule({
  imports: [
    IonicModule
  ],
  // Add singleton providers in the 'providers' array here
  providers: [
    ServerStatusTracker
  ]
})
export class SharedSingletonsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedSingletonsModule,
      // Add singletons in the 'providers' array here
      providers: [ServerStatusTracker]
    };
  }
}
