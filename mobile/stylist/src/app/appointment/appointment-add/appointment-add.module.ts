import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicPageModule } from 'ionic-angular';

import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { clientsReducer } from '~/appointment/appointment-add/clients.reducer';
import { ClientsEffects } from '~/appointment/appointment-add/clients.effects';
import {
  appointmentDatesReducer,
  appointmentDatesStatePath
} from '~/appointment/appointment-date/appointment-dates.reducer';

import { TodayService as AppointmentService } from '~/today/today.service';
import { ClientsService } from '~/appointment/appointment-add/clients-service';

import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentAddComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentAddComponent),

    StoreModule.forFeature('service', servicesReducer),
    StoreModule.forFeature('clients', clientsReducer),
    StoreModule.forFeature(appointmentDatesStatePath, appointmentDatesReducer),
    EffectsModule.forFeature([ClientsEffects]),

    CoreModule
  ],
  providers: [
    AppointmentService,
    ClientsService
  ]
})
export class AppointmentAddComponentModule {}
