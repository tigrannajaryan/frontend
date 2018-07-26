import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { HomeApi } from '~/core/api/home/home.api';

@NgModule({
  declarations: [
    ConfirmCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(ConfirmCheckoutComponent),
    CoreModule
  ],
  providers: [
    HomeApi
  ]
})
export class ConfirmCheckoutComponentModule {}
