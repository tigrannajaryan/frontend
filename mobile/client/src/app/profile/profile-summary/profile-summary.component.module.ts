import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { ProfileSummaryComponent } from '~/profile/profile-summary/profile-summary.component';

@NgModule({
  declarations: [
    ProfileSummaryComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfileSummaryComponent),
    CoreModule
  ]
})
export class ProfileSummaryComponentModule {}
