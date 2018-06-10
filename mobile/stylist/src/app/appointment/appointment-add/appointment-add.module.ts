import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicPageModule } from 'ionic-angular';

import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { clientsReducer } from '~/appointment/appointment-add/clients.reducer';
import { ClientsEffects } from '~/appointment/appointment-add/clients.effects';
import { TodayService as AppointmentService } from '~/today/today.service';
import { ClientsServiceMock } from './clients-service-mock';

import { AppointmentAddComponent } from './appointment-add';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AppointmentAddComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentAddComponent),

    StoreModule.forFeature('service', servicesReducer),
    StoreModule.forFeature('clients', clientsReducer),
    EffectsModule.forFeature([ClientsEffects]),

    CoreModule
  ],
  providers: [
    ClientsServiceMock,
    AppointmentService
  ]
})
export class AppointmentAddComponentModule {}
