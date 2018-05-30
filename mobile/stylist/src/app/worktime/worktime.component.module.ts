import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorktimeComponent } from './worktime.component';
import { WorktimeApi } from './worktime.api';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    WorktimeComponent
  ],
  imports: [
    IonicPageModule.forChild(WorktimeComponent),
    CoreModule
  ],
  providers: [
    WorktimeApi
  ]
})
export class WorktimeComponentModule {}
