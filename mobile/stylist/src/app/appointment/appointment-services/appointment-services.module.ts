import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { AppointmentServicesComponent } from './appointment-services';

@NgModule({
  declarations: [
    AppointmentServicesComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentServicesComponent),
    CoreModule
  ]
})
export class AppointmentServicesComponentModule {}
