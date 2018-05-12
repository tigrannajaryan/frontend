import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServiceItemComponent } from './services-item.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ServiceItemComponent
  ],
  imports: [
    IonicPageModule.forChild(ServiceItemComponent),
    SharedModule
  ]
})
export class ServicesItemComponentModule {}
