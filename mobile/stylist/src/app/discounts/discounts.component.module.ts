import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { DiscountsApi } from '~/shared/stylist-api/discounts.api';
import { DiscountsComponent } from './discounts.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    DiscountsComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsComponent),
    CoreModule
  ],
  providers: [
    DiscountsApi
  ]
})
export class DiscountsSettingsPageModule {}
