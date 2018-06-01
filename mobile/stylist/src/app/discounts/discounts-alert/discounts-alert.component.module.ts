import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsAlertComponent } from './discounts-alert.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(DiscountsAlertComponent),
    CoreModule
  ],
  declarations: [
    DiscountsAlertComponent
  ],
  entryComponents: [
    DiscountsAlertComponent
  ]
})
export class DiscountsAlertModule {}
