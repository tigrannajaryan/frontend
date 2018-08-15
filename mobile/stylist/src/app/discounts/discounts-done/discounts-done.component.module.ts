import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsDoneComponent } from './discounts-done.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    DiscountsDoneComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsDoneComponent),
    CoreModule
  ]
})
export class DiscountsDoneComponentModule {}
