import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServicesListComponent } from './services-list.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    ServicesListComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesListComponent),
    CoreModule
  ]
})
export class ServicesListComponentModule {}
