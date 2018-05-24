import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { RegisterSalonComponent } from './register-salon';
import { SharedModule } from '~/shared/shared.module';

@NgModule({
  declarations: [
    RegisterSalonComponent
  ],
  imports: [
    IonicPageModule.forChild(RegisterSalonComponent),
    SharedModule
  ],
  providers: [
    Camera
  ]
})
export class RegisterSalonPageModule {}
