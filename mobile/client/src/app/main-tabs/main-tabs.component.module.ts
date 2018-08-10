import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MainTabsComponent } from './main-tabs.component';

@NgModule({
  declarations: [
    MainTabsComponent
  ],
  imports: [
    IonicPageModule.forChild(MainTabsComponent)
  ]
})
export class MainTabsComponentModule {}
