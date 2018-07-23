import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePageComponent } from './profile-page.component';

@NgModule({
  declarations: [
    ProfilePageComponent,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePageComponent),
  ],
})
export class ProfilePageComponentModule {}
