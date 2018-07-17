import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { IonicPageModule } from 'ionic-angular';
import { HomeComponent } from './home.component';
import { homeReducer } from './home.reducer';
import { HomeService } from './home.service';
import { HomeEffects } from './home.effects';
import { CoreModule } from '~/core/core.module';

import { profileReducer, profileStatePath } from '~/core/components/user-header/profile.reducer';
import { ProfileEffects } from '~/core/components/user-header/profile.effects';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    IonicPageModule.forChild(HomeComponent),
    CoreModule,

    // Register reducers for home
    StoreModule.forFeature('home', homeReducer),
    EffectsModule.forFeature([HomeEffects]),

    // User header reducer and effects
    StoreModule.forFeature(profileStatePath, profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ],
  providers: [
    HomeService
  ]
})
export class HomePageModule {}
