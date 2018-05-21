import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePercentComponent } from './change-percent.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(ChangePercentComponent),
    SharedModule
  ],
  declarations: [
    ChangePercentComponent
  ],
  entryComponents: [
    ChangePercentComponent
  ]
})
export class DiscountsChangeModule {}
