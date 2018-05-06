import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { FirstScreenComponent } from './first-screen';

@NgModule({
  declarations: [
    FirstScreenComponent
  ],
  imports: [
    IonicPageModule.forChild(FirstScreenComponent)
  ],
  providers: [
    Facebook
  ]
})
export class FirstScreenPageModule {}
