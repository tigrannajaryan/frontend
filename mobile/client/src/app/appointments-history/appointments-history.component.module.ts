import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { AppointmentsHistoryComponent } from './appointments-history.component';
import { AppointmentsHistoryApi } from './appointments-history.api';
import { AppointmentsHistoryApiMock } from '~/appointments-history/appointments-history.api.mock';
import { CoreModule } from '~/core/core.module';

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
    AppointmentsHistoryApi,
    AppointmentsHistoryApiMock
  ]
})
export class AppointmentsHistoryPageModule {}
