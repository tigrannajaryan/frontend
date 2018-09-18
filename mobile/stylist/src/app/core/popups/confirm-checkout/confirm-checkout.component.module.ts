import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';

@NgModule({
  declarations: [
    ConfirmCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(ConfirmCheckoutComponent),
    CoreModule
  ]
})
export class ConfirmCheckoutComponentModule {}
