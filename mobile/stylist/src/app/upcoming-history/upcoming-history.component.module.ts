import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpcomingHistoryComponent } from './upcoming-history.component';
import { CoreModule } from '~/core/core.module';
import { TodayService } from '~/today/today.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { profileReducer, profileStatePath } from '~/core/components/user-header/profile.reducer';
import { ProfileEffects } from '~/core/components/user-header/profile.effects';

@NgModule({
  declarations: [
    UpcomingHistoryComponent
  ],
  imports: [
    IonicPageModule.forChild(UpcomingHistoryComponent),
    CoreModule,

    // User header reducer and effects
    StoreModule.forFeature(profileStatePath, profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ],
  providers: [
    TodayService
  ]
})
export class UpcomingHistoryComponentModule {}
