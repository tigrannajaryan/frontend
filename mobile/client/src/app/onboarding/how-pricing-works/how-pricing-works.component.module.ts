import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { HowPricingWorksComponent } from '~/onboarding/how-pricing-works/how-pricing-works.component';

@NgModule({
  declarations: [
    HowPricingWorksComponent
  ],
  imports: [
    IonicPageModule.forChild(HowPricingWorksComponent),
    CoreModule
  ]
})
export class HowPricingWorksComponentModule {}
