import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { IonicPageModule } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { TodayComponent } from './today.component';
import { todayReducer } from './today.reducer';
import { TodayService } from './today.service';
import { TodayEffects } from './today.effects';
import { UserFooterComponent } from '~/today/user-footer/user-footer.component';
import { UserHeaderComponent } from '~/today/user-header/user-header.component';

@NgModule({
  declarations: [
    TodayComponent,
    UserHeaderComponent,
    UserFooterComponent
  ],
  imports: [
    IonicPageModule.forChild(TodayComponent),
    CoreModule,

    // Register reducers for today
    StoreModule.forFeature('today', todayReducer),
    EffectsModule.forFeature([TodayEffects])
  ],
  providers: [
    TodayService
  ]
})
export class TodayPageModule {}
