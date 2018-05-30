import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DatePipe } from '@angular/common';

import { CoreModule } from '~/core/core.module';
import { ProfileComponent } from './profile';
import { ProfileInfoComponent } from './profile-info/profile-info';

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileInfoComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfileComponent),
    CoreModule
  ],
  providers: [DatePipe]
})
export class ProfilePageModule {}
