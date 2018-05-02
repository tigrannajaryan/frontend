import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TodayComponent } from './today.component';

@NgModule({
  declarations: [
    TodayComponent
  ],
  imports: [
    IonicPageModule.forChild(TodayComponent)
  ]
})
export class TodayPageModule {}
