import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServicesItemComponent } from './services-item.component';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  declarations: [
    ServicesItemComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesItemComponent),
    SharedModule
  ]
})
export class ServicesItemComponentModule {}
