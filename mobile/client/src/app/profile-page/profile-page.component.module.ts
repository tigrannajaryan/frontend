import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePageComponent } from './profile-page.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ProfileEffects } from '~/core/effects/profile.effects';
import { profileReducer } from '~/core/reducers/profile.reducer';
import { PhoneInputDirective } from '~/core/directives/phone-input.directive';

@NgModule({
  declarations: [
    PhoneInputDirective,
    ProfilePageComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfilePageComponent),
    StoreModule.forFeature('profile', profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ]
})
export class ProfilePageComponentModule {}
