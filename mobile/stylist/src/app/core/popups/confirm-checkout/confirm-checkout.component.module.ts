import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { HomeService } from '~/core/api/home/home.service';

@NgModule({
  declarations: [
    ConfirmCheckoutComponent
  ],
  imports: [
    IonicPageModule.forChild(ConfirmCheckoutComponent),
    CoreModule
  ],
  providers: [
    HomeService
  ]
})
export class ConfirmCheckoutComponentModule {}
