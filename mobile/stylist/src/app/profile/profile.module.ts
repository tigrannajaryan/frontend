import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

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
  ]
})
export class ProfilePageModule {}
