import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { BaseApiService } from '~/shared/base-api-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import { InputNumberDirective } from '~/core/directives/input-number.directive';

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
export class CoreModule {}
