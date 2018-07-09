import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ServicesPageComponent } from '~/services-page/services-page.component';

@NgModule({
  declarations: [
    ServicesPageComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesPageComponent)
  ]
})
export class ServicesPageComponentModule {}
