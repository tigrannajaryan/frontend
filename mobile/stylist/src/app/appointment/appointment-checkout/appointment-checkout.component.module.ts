import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { CoreModule } from '~/core/core.module';
import { TodayService } from '~/today/today.service';

@NgModule({
  declarations: [
    AppointmentCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentCheckoutComponent),
    CoreModule
  ],
  providers: [
    TodayService
  ]
})
export class AppointmentCheckoutComponentModule {}
