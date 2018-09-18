import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { DiscountsWeekdayComponent } from './discounts-weekday.component';
import { CoreModule } from '~/core/core.module';
import { DiscountsApi } from '~/shared/stylist-api/discounts.api';

@NgModule({
  declarations: [
    DiscountsWeekdayComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsWeekdayComponent),
    CoreModule
  ],
  providers: [
    DiscountsApi
  ]
})
export class DiscountsWeekdayPageModule {}
