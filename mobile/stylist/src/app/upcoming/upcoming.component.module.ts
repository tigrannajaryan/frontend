import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpcomingComponent } from './upcoming.component';
import { CoreModule } from '~/core/core.module';
import { TodayService } from '~/today/today.service';
import { StoreModule } from '@ngrx/store';
import { profileReducer, profileStatePath } from '~/today/user-header/profile.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ProfileEffects } from '~/today/user-header/profile.effects';

@NgModule({
  declarations: [
    UpcomingComponent
  ],
  imports: [
    IonicPageModule.forChild(UpcomingComponent),
    CoreModule,

    // User header reducer and effects
    StoreModule.forFeature(profileStatePath, profileReducer),
    EffectsModule.forFeature([ProfileEffects])
  ],
  providers: [
    TodayService
  ]
})
export class UpcomingPageModule {}
