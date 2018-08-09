import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileEditComponent } from '~/profile/profile-edit/profile-edit.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ProfileEffects } from '~/core/effects/profile.effects';
import { profileReducer } from '~/core/reducers/profile.reducer';
import { Camera } from '@ionic-native/camera';

@NgModule({
  declarations: [
    ProfileEditComponent
  ],
  providers: [
    Camera
  ],
  imports: [
    IonicPageModule.forChild(ProfileEditComponent),
    StoreModule.forFeature('profile', profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ]
})
export class ProfileEditComponentModule {}
