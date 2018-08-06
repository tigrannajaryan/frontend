import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsFirstBookingComponent } from './discounts-first-booking.component';
import { CoreModule } from '~/core/core.module';
import { DiscountsApi } from '~/core/api/discounts/discounts.api';

@NgModule({
  declarations: [
    DiscountsFirstBookingComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsFirstBookingComponent),
    CoreModule
  ],
  providers: [
    DiscountsApi
  ]
})
export class DiscountsFirstVisitPageModule {}
