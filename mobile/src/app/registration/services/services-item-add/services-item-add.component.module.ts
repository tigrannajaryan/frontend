import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServicesItemAddComponent } from './services-item-add.component';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  declarations: [
    ServicesItemAddComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesItemAddComponent),
    SharedModule
  ]
})
export class ServicesItemAddComponentModule {}
