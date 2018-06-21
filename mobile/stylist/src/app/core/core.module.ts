import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { BaseApiService } from '~/shared/base-api-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from '~/shared/logger';
import { UserContext } from '~/shared/user-context';
import { GAWrapper } from '~/shared/google-analytics';
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
    ServerStatusTracker,
    GoogleAnalytics,
    GAWrapper,
    UserContext
  ]
})
export class CoreModule {}
