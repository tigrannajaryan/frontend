import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';
import { HomeComponent } from './home.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    IonicPageModule.forChild(HomeComponent),
    CoreModule
  ]
})
export class HomePageModule {}
