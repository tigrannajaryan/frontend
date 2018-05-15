import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsAlertComponent } from './discounts-alert.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(DiscountsAlertComponent),
    SharedModule
  ],
  declarations: [
    DiscountsAlertComponent
  ],
  entryComponents: [
    DiscountsAlertComponent
  ]
})
export class DiscountsAlertModule {}
