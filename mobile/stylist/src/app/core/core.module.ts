import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { IonicStorageModule } from '@ionic/storage';
import { InlineSVGModule } from 'ng-inline-svg';

import { BaseApiService } from '~/shared/base-api-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from '~/shared/logger';
import { UserContext } from '~/shared/user-context';
import { GAWrapper } from '~/shared/google-analytics';
import { HasErrorPipe } from '~/shared/pipes/has-error.pipe';
import { PricePipe } from '~/shared/pipes/price.pipe';
import { DirectivesModule } from '~/core/directives/directive.module';

const declarations = [
  HasErrorPipe,
  PricePipe
];

@NgModule({
  declarations: [
    ...declarations
  ],
  imports: [
    IonicModule,
    ComponentsModule,
    DirectivesModule,
    IonicStorageModule.forRoot(),
    InlineSVGModule.forRoot()
  ],
  exports: [
    IonicModule,
    ComponentsModule,
    DirectivesModule,
    InlineSVGModule,
    ...declarations
  ],
  providers: [
    BaseApiService,
    Logger,
    GoogleAnalytics,
    GAWrapper,
    UserContext
  ]
})
export class CoreModule {}
