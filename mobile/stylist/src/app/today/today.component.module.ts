import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { IonicPageModule } from 'ionic-angular';
import { TodayComponent } from './today.component';
import { todayReducer } from './today.reducer';
import { TodayService } from './today.service';
import { TodayEffects } from './today.effects';
import { CoreModule } from '~/core/core.module';

import { profileReducer, profileStatePath } from '~/core/components/user-header/profile.reducer';
import { ProfileEffects } from '~/core/components/user-header/profile.effects';

@NgModule({
  declarations: [
    TodayComponent
  ],
  imports: [
    IonicPageModule.forChild(TodayComponent),
    CoreModule,

    // register reducers for today
    StoreModule.forFeature('today', todayReducer),
    EffectsModule.forFeature([TodayEffects]),

    // user header reducer and effects
    StoreModule.forFeature(profileStatePath, profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ],
  providers: [
    TodayService
  ]
})
export class TodayPageModule {}
