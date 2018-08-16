import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiscountsWelcomeComponent } from './discounts-welcome.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    DiscountsWelcomeComponent
  ],
  imports: [
    IonicPageModule.forChild(DiscountsWelcomeComponent),
    CoreModule
  ]
})
export class DiscountsWelcomeComponentModule {}
