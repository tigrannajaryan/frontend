import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentCheckoutComponent),
    CoreModule
  ]
})
export class AppointmentCheckoutComponentModule {}
