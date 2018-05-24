import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { BaseApiService } from './base-api-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from './logger';
import { ServerStatusTracker } from './server-status-tracker';
import { InputNumberDirective } from '~/shared/directives/input-number.directive';

@NgModule({
  declarations: [
    InputNumberDirective
  ],
  imports: [
    IonicModule,
    ComponentsModule
  ],
  exports: [
    ComponentsModule,
    InputNumberDirective
  ],
  providers: [
    BaseApiService,
    Logger,
    ServerStatusTracker
  ]
})
export class SharedModule {}
