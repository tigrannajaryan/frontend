import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsComponent } from './discounts.component';
import { SharedModule } from '../shared/shared.module';
import { DiscountsApi } from './discounts.api';

@NgModule({
  imports: [
    IonicPageModule.forChild(DiscountsComponent),
    SharedModule
  ],
  declarations: [
    DiscountsComponent
  ],
  providers: [
    DiscountsApi
  ]
})
export class DiscountsModule {}
