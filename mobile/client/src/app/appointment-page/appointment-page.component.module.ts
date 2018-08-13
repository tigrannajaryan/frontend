import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppointmentPageComponent } from './appointment-page.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentPageComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentPageComponent),
    CoreModule
  ]
})
export class AppointmentPageComponentPageModule {}
