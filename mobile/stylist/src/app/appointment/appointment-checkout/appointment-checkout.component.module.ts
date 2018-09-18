import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { HomeService } from '~/shared/stylist-api/home.service';

@NgModule({
  declarations: [
    AppointmentCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentCheckoutComponent),
    CoreModule
  ],
  providers: [
    HomeService
  ]
})
export class AppointmentCheckoutComponentModule {}
