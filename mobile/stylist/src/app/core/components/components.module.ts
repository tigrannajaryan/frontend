import { NgModule } from '@angular/core';

import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { MbIconsComponent } from '~/shared/components/mb-icons/mb-icons.component';
import { ContinueFooterComponent } from '~/shared/components/continue-footer/continue-footer.component';
import { CheckListComponent } from '~/shared/components/check-list/check-list.component';
import { NumListComponent } from '~/shared/components/num-list/num-list.component';
import { PhoneInputComponent } from '~/shared/components/phone-input/phone-input.component';
import { CodeInputComponent } from '~/shared/components/code-input/code-input.component';
import { PricePairComponent } from '~/shared/components/price-pair/price-pair.component';

import { DiscountsApi } from '~/core/api/discounts.api';

import { MadeNavComponent } from './made-nav/made-nav.component';
import { MadeTableComponent } from './made-table/made-table';
import { DirectivesModule } from '~/core/directives/directive.module';
import { IonicModule } from 'ionic-angular';
import { ServicesPickComponent } from '~/core/components/services-pick/services-pick.component';
import { AppointmentItemComponent } from '~/core/components/appointment-item/appointment-item.component';
import { DiscountsListComponent } from '~/core/components/discounts/discounts-list/discounts-list.component';
import { DiscountsWeekdayShortComponent } from '~/core/components/discounts/discounts-weekday-short/discounts-weekday-short.component';
import { DiscountsRevisitShortComponent } from '~/core/components/discounts/discounts-revisit-short/discounts-revisit-short.component';
import {
  DiscountsFirstBookingShortComponent
} from '~/core/components/discounts/discounts-first-booking-short/discounts-first-booking-short.component';
import {
  DiscountsMaximumShortComponent
} from '~/core/components/discounts/discounts-maximum-short/discounts-maximum-short.component';
import { BackHeaderComponent } from '~/core/components/back-header/back-header.component';
import { MadeMenuHeaderComponent } from '~/core/components/made-menu-header/made-menu-header.component';
import { PhoneLinkComponent } from '~/shared/components/phone-link/phone-link.component';
import { ClientItemComponent } from '~/clients/client-item/client-item.component';
import { HorizontalCalendarComponent } from '~/calendar/horizontal-calendar/horizontal-calendar.component';
import { StylistPreviewComponent } from '~/core/components/stylist-preview/stylist-preview.component';
import {
  StylistPushNotificationsTrackerComponent
} from '~/core/components/push-notifications-tracker/push-notifications-tracker.component';

import { TimeSlotContentComponent } from '~/home-slots/time-slot-content/time-slot-content.component';

const components = [
  MadeNavComponent,
  ServerStatusComponent,
  MadeMenuHeaderComponent,
  MadeTableComponent,
  ServicesPickComponent,
  AppointmentItemComponent,
  ContinueFooterComponent,
  DiscountsListComponent,
  DiscountsWeekdayShortComponent,
  DiscountsRevisitShortComponent,
  DiscountsFirstBookingShortComponent,
  DiscountsMaximumShortComponent,
  BackHeaderComponent,
  MbIconsComponent,
  CheckListComponent,
  NumListComponent,
  PhoneInputComponent,
  PhoneLinkComponent,
  CodeInputComponent,
  ClientItemComponent,
  PricePairComponent,
  HorizontalCalendarComponent,
  StylistPreviewComponent,
  StylistPushNotificationsTrackerComponent,
  TimeSlotContentComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  entryComponents: [
    ServerStatusComponent,
    ServicesPickComponent
  ],
  imports: [
    IonicModule,
    DirectivesModule
  ],
  exports: [
    ...components
  ],
  providers: [
    DiscountsApi
  ]
})
export class ComponentsModule { }
