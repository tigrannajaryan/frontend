import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServicesComponent } from './services.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    ServicesComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesComponent),
    CoreModule
  ]
})
export class ServicesPageModule {}
