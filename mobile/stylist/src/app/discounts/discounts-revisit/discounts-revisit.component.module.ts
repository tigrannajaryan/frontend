import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { DiscountsRevisitComponent } from './discounts-revisit.component';
import { CoreModule } from '../../core/core.module';
import { DiscountsApi } from '~/shared/stylist-api/discounts.api';

@NgModule({
  declarations: [
    DiscountsRevisitComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsRevisitComponent),
    CoreModule
  ],
  providers: [
    DiscountsApi
  ]
})
export class DiscountsRevisitPageModule {}
