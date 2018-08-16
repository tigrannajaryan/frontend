import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { HowMadeWorksComponent } from '~/about/how-made-works/how-made-works.component';

@NgModule({
  declarations: [
    HowMadeWorksComponent
  ],
  imports: [
    IonicPageModule.forChild(HowMadeWorksComponent),
    CoreModule
  ]
})
export class HowMadeWorksComponentModule {}
