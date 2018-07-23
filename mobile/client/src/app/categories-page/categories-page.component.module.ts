import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { CategoriesPageComponent } from '~/categories-page/categories-page.component';

@NgModule({
  declarations: [
    CategoriesPageComponent
  ],
  imports: [
    IonicPageModule.forChild(CategoriesPageComponent),
    CoreModule
  ]
})
export class CategoriesPageComponentModule {}
