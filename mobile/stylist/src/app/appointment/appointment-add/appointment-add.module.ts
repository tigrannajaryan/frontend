import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentAddComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentAddComponent),
    CoreModule
  ]
})
export class AppointmentAddComponentModule {}
