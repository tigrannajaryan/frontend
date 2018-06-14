import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicPageModule } from 'ionic-angular';

import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { clientsReducer } from '~/appointment/appointment-add/clients.reducer';
import { ClientsEffects } from '~/appointment/appointment-add/clients.effects';
import { TodayService as AppointmentService } from '~/today/today.service';

import { AppointmentDateComponent } from '~/appointment/appointment-date/appointment-date';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentDateComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentDateComponent),

    // StoreModule.forFeature('service', servicesReducer),
    // StoreModule.forFeature('clients', clientsReducer),
    // EffectsModule.forFeature([ClientsEffects]),

    CoreModule
  ],
  providers: [
    AppointmentService
  ]
})
export class AppointmentAddComponentModule {}
