import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DatePipe } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './profile';
import { ProfileInfoComponent } from './profile-info/profile-info';

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileInfoComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfileComponent),
    SharedModule
  ],
  providers: [DatePipe]
})
export class ProfilePageModule {}
