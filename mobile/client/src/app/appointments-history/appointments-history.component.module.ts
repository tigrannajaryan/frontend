import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { AppointmentsHistoryComponent } from './appointments-history.component';

@NgModule({
  declarations: [
    AppointmentsHistoryComponent
  ],
  imports: [
    IonicPageModule.forChild(AppointmentsHistoryComponent),
    CoreModule
  ]
})
export class AppointmentsHistoryPageModule {}
