import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { ServicesPageComponent } from '~/services-page/services-page.component';

@NgModule({
  declarations: [
    ServicesPageComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesPageComponent),
    CoreModule
  ]
})
export class ServicesPageComponentModule {}
