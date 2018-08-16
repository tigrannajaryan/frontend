import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { GAWrapper } from '~/shared/google-analytics';
import { HasErrorPipe } from '~/shared/pipes/has-error.pipe';
import { PricePipe } from '~/shared/pipes/price.pipe';

import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { MbIconsComponent } from '~/shared/components/mb-icons/mb-icons.component';

import { InputNumberDirective } from '~/core/directives/input-number.directive';
import { PhoneInputDirective } from '~/core/directives/phone-input.directive';

import { FormatPhonePipe } from '~/core/pipes/format-phone.pipe';

import { MadeHeaderComponent } from '~/core/components/made-header/made-header.component';
import { AppointmentItemComponent } from '~/core/components/appointment-item/appointment-item.component';
import { BookServicesHeaderComponent } from '~/booking/services-header/services-header';

export enum DefaultImage {
  User = '/assets/imgs/user/default_user.png'
}

const declarations = [
  InputNumberDirective,
  PhoneInputDirective,
  FormatPhonePipe,
  HasErrorPipe,
  PricePipe,
  ServerStatusComponent,
  MadeHeaderComponent,
  AppointmentItemComponent,
  MbIconsComponent,
  BookServicesHeaderComponent
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
