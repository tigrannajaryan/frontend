import { NgModule } from '@angular/core';

import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { UserHeaderComponent } from '~/core/components/user-header/user-header.component';

import { MadeNavComponent } from './made-nav/made-nav.component';
import { MadeTableComponent } from './made-table/made-table';
import { DirectivesModule } from '~/core/directives/directive.module';
import { IonicModule } from 'ionic-angular';
import { UserHeaderMenuComponent } from '~/core/components/user-header/user-header-menu/user-header-menu.component';
import { ServicesPickComponent } from '~/core/components/services-pick/services-pick.component';
import { AppointmentItemComponent } from '~/core/components/appointment-item/appointment-item.component';
import { DiscountsFooterComponent } from '~/core/components/discounts/discounts-footer/discounts-footer.component';
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
import { DiscountsApi } from '~/core/api/discounts/discounts.api';

const components = [
  MadeNavComponent,
  ServerStatusComponent,
  UserHeaderComponent,
  MadeTableComponent,
  UserHeaderMenuComponent,
  ServicesPickComponent,
  AppointmentItemComponent,
  DiscountsFooterComponent,
  DiscountsListComponent,
  DiscountsWeekdayShortComponent,
  DiscountsRevisitShortComponent,
  DiscountsFirstBookingShortComponent,
  DiscountsMaximumShortComponent,
  BackHeaderComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  entryComponents: [
    UserHeaderMenuComponent,
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
