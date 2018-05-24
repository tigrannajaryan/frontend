import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';
import { ProfileComponent } from './profile';

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfileComponent)
  ]
})
export class ProfilePageModule {}
