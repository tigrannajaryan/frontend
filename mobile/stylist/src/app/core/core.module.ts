import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { IonicStorageModule } from '@ionic/storage';
import { InlineSVGModule } from 'ng-inline-svg';

import { Logger } from '~/shared/logger';
import { UserContext } from '~/shared/user-context';
import { AppAnalytics } from '~/shared/app-analytics';
import { HasErrorPipe } from '~/shared/pipes/has-error.pipe';
import { PricePipe } from '~/shared/pipes/price.pipe';
import { BaseService } from '~/shared/api/base.service';
import { NoServiceSelectedComponent } from '~/shared/components/no-service-selected/no-service-selected.component';
import { PriceCalendarComponent } from '~/shared/components/price-calendar/price-calendar.component';
import { PushNotificationToastService } from '~/shared/push/push-notification-toast';
import { ServicesHeaderListComponent } from '~/shared/components/services-header-list/services-header-list';
import { UserNamePhotoComponent } from '~/shared/components/user-name-photo/user-name-photo.component';

import { DirectivesModule } from '~/core/directives/directive.module';
import { ComponentsModule } from './components/components.module';
import { TimeSlotsComponent } from '~/home-slots/time-slots/time-slots.component';

const declarations = [
  HasErrorPipe,
  NoServiceSelectedComponent,
  PriceCalendarComponent,
  PricePipe,
  ServicesHeaderListComponent,
  UserNamePhotoComponent,
  TimeSlotsComponent
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
    AppAnalytics,
    PushNotificationToastService,
    UserContext
  ]
})
export class CoreModule {}
