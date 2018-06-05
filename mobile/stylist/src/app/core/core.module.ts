import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { BaseApiService } from '~/shared/base-api-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { DirectivesModule } from '~/core/directives/directive.module';

@NgModule({
  imports: [
    IonicModule,
    ComponentsModule,
    DirectivesModule
  ],
  exports: [
    IonicModule,
    ComponentsModule,
    DirectivesModule
  ],
  providers: [
    BaseApiService,
    Logger,
    ServerStatusTracker
  ]
})
export class CoreModule {}
