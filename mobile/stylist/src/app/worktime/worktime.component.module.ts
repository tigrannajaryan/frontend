import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { WorktimeApi } from '~/shared/stylist-api/worktime.api';

import { WorktimeComponent } from './worktime.component';
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
