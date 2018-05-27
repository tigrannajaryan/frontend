import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServiceItemComponent } from './services-item.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    ServiceItemComponent
  ],
  imports: [
    IonicPageModule.forChild(ServiceItemComponent),
    CoreModule
  ]
})
export class ServicesItemComponentModule {}
