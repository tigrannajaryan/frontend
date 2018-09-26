import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { IonicStorageModule } from '@ionic/storage';
import { InlineSVGModule } from 'ng-inline-svg';

import { Logger } from '~/shared/logger';
import { UserContext } from '~/shared/user-context';
import { GAWrapper } from '~/shared/google-analytics';
import { FormatPhonePipe } from '~/shared/pipes/format-phone.pipe';
import { HasErrorPipe } from '~/shared/pipes/has-error.pipe';
import { PricePipe } from '~/shared/pipes/price.pipe';
import { BaseService } from '~/shared/api/base-service';
import { PriceCalendarComponent } from '~/shared/components/price-calendar/price-calendar.component';
import { DirectivesModule } from '~/core/directives/directive.module';
import { ComponentsModule } from './components/components.module';

const declarations = [
  FormatPhonePipe,
  HasErrorPipe,
  PriceCalendarComponent, // Added temporarily to avoid AOT compiler error.
                          // Should be moved to the module of page where it is
                          // really used in the future.
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
    BaseService,
    Logger,
    GoogleAnalytics,
    GAWrapper,
    UserContext
  ]
})
export class CoreModule {}
