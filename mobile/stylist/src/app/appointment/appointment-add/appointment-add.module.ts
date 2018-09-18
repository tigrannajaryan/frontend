import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { IonicPageModule } from 'ionic-angular';

import { HomeService as AppointmentService } from '~/shared/stylist-api/home.service';
import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
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
