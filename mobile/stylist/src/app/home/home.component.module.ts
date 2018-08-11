import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { profileReducer, profileStatePath } from '~/core/components/user-header/profile.reducer';
import { ProfileEffects } from '~/core/components/user-header/profile.effects';
import { HomeComponent } from './home.component';
import { HomeService } from './home.service';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    IonicPageModule.forChild(HomeComponent),
    CoreModule,

    // User header reducer and effects
    StoreModule.forFeature(profileStatePath, profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ],
  providers: [
    HomeService
  ]
})
export class HomePageModule {}
