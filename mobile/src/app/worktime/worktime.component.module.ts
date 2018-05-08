import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorktimeComponent } from './worktime.component';
import { WorktimeApi } from './worktime.api';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    WorktimeComponent
  ],
  imports: [
    IonicPageModule.forChild(WorktimeComponent),
    SharedModule
  ],
  providers: [
    WorktimeApi
  ]
})
export class WorktimeComponentModule {}
