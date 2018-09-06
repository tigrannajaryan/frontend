import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutComponent } from './about.component';

@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    IonicPageModule.forChild(AboutComponent)
  ]
})
export class AboutPageModule {}
