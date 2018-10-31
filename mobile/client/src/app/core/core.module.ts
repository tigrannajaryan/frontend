import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { GAWrapper } from '~/shared/google-analytics';

import { HasErrorPipe } from '~/shared/pipes/has-error.pipe';
import { PricePipe } from '~/shared/pipes/price.pipe';

import { CheckListComponent } from '~/shared/components/check-list/check-list.component';
import { CodeInputComponent } from '~/shared/components/code-input/code-input.component';
import { ContinueFooterComponent } from '~/shared/components/continue-footer/continue-footer.component';
import { MadeLinkDirective } from '~/shared/directives/made-link.directive';
import { MbIconsComponent } from '~/shared/components/mb-icons/mb-icons.component';
import { NumListComponent } from '~/shared/components/num-list/num-list.component';
import { PhoneInputComponent } from '~/shared/components/phone-input/phone-input.component';
import { PhoneLinkComponent } from '~/shared/components/phone-link/phone-link.component';
import { PriceCalendarComponent } from '~/shared/components/price-calendar/price-calendar.component';
import { PricePairComponent } from '~/shared/components/price-pair/price-pair.component';
import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { ServicesHeaderListComponent } from '~/shared/components/services-header-list/services-header-list';
import { UserNamePhotoComponent } from '~/shared/components/user-name-photo/user-name-photo.component';

import { PhoneInputDirective } from '~/shared/directives/phone-input.directive';

import { AppointmentItemComponent } from '~/core/components/appointment-item/appointment-item.component';
import { BookServicesHeaderComponent } from '~/booking/book-services-header/book-services-header';
import { MadeHeaderComponent } from '~/core/components/made-header/made-header.component';
import { ProfileHeaderComponent } from '~/core/components/profile-header/profile-header.component';
import { StylistCardComponent } from '~/stylists/stylist-card/stylist-card.component';

import { InputNumberDirective } from '~/core/directives/input-number.directive';

export enum DefaultImage {
  User = 'assets/icons/stylist-avatar.png'
}

const declarations = [
  AppointmentItemComponent,
  BookServicesHeaderComponent,
  CheckListComponent,
  CodeInputComponent,
  ContinueFooterComponent,
  HasErrorPipe,
  InputNumberDirective,
  MadeHeaderComponent,
  MadeLinkDirective,
  MbIconsComponent,
  NumListComponent,
  NumListComponent,
  PhoneInputComponent,
  PhoneInputDirective,
  PhoneLinkComponent,
  PriceCalendarComponent,
  PricePairComponent,
  PricePipe,
  ProfileHeaderComponent,
  ServerStatusComponent,
  ServicesHeaderListComponent,
  StylistCardComponent,
  UserNamePhotoComponent
];

@NgModule({
  declarations: [
    ...declarations
  ],
  exports: [
    ...declarations
  ],
  imports: [
    IonicModule
  ],
  providers: [
    GoogleAnalytics,
    GAWrapper
  ]
})
export class CoreModule {}
