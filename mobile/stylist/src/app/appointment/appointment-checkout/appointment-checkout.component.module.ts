import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { CoreModule } from '~/core/core.module';
import { HomeService } from '~/home/home.service';

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
