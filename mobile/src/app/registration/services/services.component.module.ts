import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedModule } from '../../../shared/shared.module';
import { ServicesComponent } from './services.component';

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
