import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServicesListComponent } from './services-list.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ServicesListComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesListComponent),
    SharedModule
  ]
})
export class ServicesListComponentModule {}
