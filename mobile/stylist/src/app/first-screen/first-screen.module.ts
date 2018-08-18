import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FirstScreenComponent } from './first-screen';

@NgModule({
  declarations: [
    FirstScreenComponent
  ],
  imports: [
    IonicPageModule.forChild(FirstScreenComponent)
  ]
})
export class FirstScreenPageModule {}
