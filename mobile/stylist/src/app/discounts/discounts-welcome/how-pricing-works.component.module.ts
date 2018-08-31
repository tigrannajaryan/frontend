import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HowPricingWorksComponent } from './how-pricing-works.component';
import { CoreModule } from '~/core/core.module';

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
