import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { RegisterSalonComponent } from './register-salon';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    RegisterSalonComponent
  ],
  imports: [
    IonicPageModule.forChild(RegisterSalonComponent),
    CoreModule
  ],
  providers: [
    Camera
  ]
})
export class RegisterSalonPageModule {}
