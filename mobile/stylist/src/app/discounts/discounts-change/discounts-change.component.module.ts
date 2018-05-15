import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsChangeComponent } from './discounts-change.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(DiscountsChangeComponent),
    SharedModule
  ],
  declarations: [
    DiscountsChangeComponent
  ],
  entryComponents: [
    DiscountsChangeComponent
  ]
})
export class DiscountsChangeModule {}
