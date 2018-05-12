import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServicesComponent } from './services.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ServicesComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesComponent),
    SharedModule
  ]
})
export class ServicesPageModule {}
