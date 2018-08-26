import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { GAWrapper } from '~/shared/google-analytics';

import { FormatPhonePipe } from '~/core/pipes/format-phone.pipe';
import { HasErrorPipe } from '~/shared/pipes/has-error.pipe';
import { PricePipe } from '~/shared/pipes/price.pipe';

import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { MbIconsComponent } from '~/shared/components/mb-icons/mb-icons.component';
import { WelcomeInfoComponent } from '~/shared/components/welcome-info/welcome-info.component';
import { ContinueFooterComponent } from '~/shared/components/continue-footer/continue-footer.component';
import { HowPricingInfoComponent } from '~/shared/components/how-pricing-info/how-pricing-info.component';

import { InputNumberDirective } from '~/core/directives/input-number.directive';
import { PhoneInputDirective } from '~/core/directives/phone-input.directive';

import { AppointmentItemComponent } from '~/core/components/appointment-item/appointment-item.component';
import { BookServicesHeaderComponent } from '~/booking/services-header/services-header';
import { MadeHeaderComponent } from '~/core/components/made-header/made-header.component';
import { ProfileHeaderComponent } from '~/core/components/profile-header/profile-header.component';

export enum DefaultImage {
  User = '/assets/imgs/user/default_user.png'
}

const declarations = [
  InputNumberDirective,
  PhoneInputDirective,

  FormatPhonePipe,
  HasErrorPipe,
  PricePipe,

  AppointmentItemComponent,
  BookServicesHeaderComponent,
  MadeHeaderComponent,
  MbIconsComponent,
  ProfileHeaderComponent,
  ServerStatusComponent,
  BookServicesHeaderComponent,
  WelcomeInfoComponent,
  HowPricingInfoComponent,
  ContinueFooterComponent
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
