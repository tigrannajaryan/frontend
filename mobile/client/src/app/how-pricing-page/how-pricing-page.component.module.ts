import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HowPricingPageComponent } from './how-pricing-page.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    HowPricingPageComponent
  ],
  imports: [
    IonicPageModule.forChild(HowPricingPageComponent),
    CoreModule
  ]
})
export class HowPricingPageComponentModule {}
