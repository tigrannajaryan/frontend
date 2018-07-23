import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { StylistsPageComponent } from '~/stylists-page/stylists-page.component';

@NgModule({
  declarations: [
    StylistsPageComponent
  ],
  imports: [
    IonicPageModule.forChild(StylistsPageComponent),
    CoreModule
  ]
})
export class StylistsPageComponentModule {}
