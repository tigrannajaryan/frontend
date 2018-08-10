import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { CoreModule } from '~/core/core.module';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { AppointmentsHistoryComponent } from './appointments-history.component';

@NgModule({
  declarations: [
    AppointmentsHistoryComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentsHistoryComponent),
    IonicStorageModule.forRoot(),
    CoreModule
  ],
  providers: [
    AppointmentsDataStore
  ]
})
export class AppointmentsHistoryPageModule {}
