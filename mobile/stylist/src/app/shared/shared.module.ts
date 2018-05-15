import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { BaseApiService } from './base-api-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from './logger';
import { ServerStatusTracker } from './server-status-tracker';

@NgModule({
  imports: [
    IonicModule,
    ComponentsModule
  ],
  exports: [
    ComponentsModule
  ],
  providers: [
    BaseApiService,
    Logger,
    ServerStatusTracker
  ]
})
export class SharedModule {}
