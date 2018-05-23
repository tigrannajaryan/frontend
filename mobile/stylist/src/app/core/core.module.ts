import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { BaseApiService } from '~/shared/base-api-service';
import { ComponentsModule } from './components/components.module';
import { ClickOutsideDirective } from '~/core/directives/click-outside.directive';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { InputNumberDirective } from '~/core/directives/input-number.directive';

@NgModule({
  declarations: [
    InputNumberDirective,
    ClickOutsideDirective
  ],
  imports: [
    IonicModule,
    ComponentsModule
  ],
  exports: [
    ComponentsModule,
    InputNumberDirective,
    ClickOutsideDirective
  ],
  providers: [
    BaseApiService,
    Logger,
    ServerStatusTracker
  ]
})
export class CoreModule {}
