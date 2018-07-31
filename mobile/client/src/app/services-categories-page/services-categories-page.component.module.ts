import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { ServicesCategoriesPageComponent } from '~/services-categories-page/services-categories-page.component';

@NgModule({
  declarations: [
    ServicesCategoriesPageComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesCategoriesPageComponent),
    CoreModule
  ]
})
export class ServicesCategoriesPageComponentModule {}
