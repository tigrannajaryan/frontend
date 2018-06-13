import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    AddServicesComponent
  ],
  imports: [
    IonicPageModule.forChild(AddServicesComponent),
    CoreModule
  ]
})
export class AddServicesComponentModule {}
