import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsInfoComponent } from './discounts-info.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    DiscountsInfoComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsInfoComponent),
    CoreModule
  ]
})
export class DiscountsInfoPageModule {}
