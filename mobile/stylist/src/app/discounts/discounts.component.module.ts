import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsComponent } from './discounts.component';
import { DiscountsApi } from '~/core/api/discounts/discounts.api';
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
