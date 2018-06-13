import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { TodayService } from '~/today/today.service';

@NgModule({
  declarations: [
    ConfirmCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(ConfirmCheckoutComponent),
    CoreModule
  ],
  providers: [
    TodayService
  ]
})
export class ConfirmCheckoutComponentModule {}
