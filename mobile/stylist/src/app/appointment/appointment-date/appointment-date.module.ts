import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicPageModule } from 'ionic-angular';

import { ChartComponent } from '~/appointment/appointment-date/chart.component';

import {
  appointmentDatesReducer,
  appointmentDatesStatePath
} from '~/appointment/appointment-date/appointment-dates.reducer';
import {
  AppointmentDatesEffects
} from '~/appointment/appointment-date/appointment-dates.effects';

import { AppointmentDateComponent } from '~/appointment/appointment-date/appointment-date';
import { AppointmentDatesServiceMock } from '~/appointment/appointment-date/appointment-dates-service-mock';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentDateComponent,
    ChartComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentDateComponent),

    StoreModule.forFeature(appointmentDatesStatePath, appointmentDatesReducer),
    EffectsModule.forFeature([AppointmentDatesEffects]),

    CoreModule
  ],
  providers: [
    AppointmentDatesServiceMock
  ]
})
export class AppointmentAddComponentModule {}
