import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsComponent } from './discounts.component';
import { CoreModule } from '~/core/core.module';
import { DiscountsApi } from './discounts.api';

@NgModule({
  imports: [
    IonicPageModule.forChild(DiscountsComponent),
    CoreModule
  ],
  declarations: [
    DiscountsComponent
  ],
  providers: [
    DiscountsApi
  ]
})
export class DiscountsModule {}
