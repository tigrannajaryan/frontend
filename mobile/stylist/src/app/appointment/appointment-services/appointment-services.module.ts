import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicPageModule } from 'ionic-angular';

import { servicesReducer } from './services.reducer';
import { ServicesEffects } from './services.effects';

import { CoreModule } from '~/core/core.module';
import { AppointmentServicesComponent } from './appointment-services';

@NgModule({
  declarations: [
    AppointmentServicesComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentServicesComponent),

    StoreModule.forFeature('service', servicesReducer),
    EffectsModule.forFeature([ServicesEffects]),

    CoreModule
  ]
})
export class AppointmentServicesComponentModule {}
