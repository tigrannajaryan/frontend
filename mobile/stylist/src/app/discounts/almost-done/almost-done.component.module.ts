import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlmostDoneComponent } from './almost-done.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AlmostDoneComponent
  ],
  imports: [
    IonicPageModule.forChild(AlmostDoneComponent),
    CoreModule
  ]
})
export class AlmostDoneComponentModule {}
