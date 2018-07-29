import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { IonicPageModule } from 'ionic-angular';

import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { HomeService as AppointmentService } from '~/home/home.service';
import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentAddComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentAddComponent),
    StoreModule.forFeature('service', servicesReducer),
    CoreModule
  ],
  providers: [
    AppointmentService
  ]
})
export class AppointmentAddComponentModule {}
