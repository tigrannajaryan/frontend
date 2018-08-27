import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { CoreModule } from '~/core/core.module';
import { HomePageComponent } from './home-page.component';

@NgModule({
  declarations: [
    HomePageComponent
  ],
  imports: [
    IonicPageModule.forChild(HomePageComponent),
    IonicStorageModule.forRoot(),
    CoreModule
  ]
})
export class HomePageModule {}
