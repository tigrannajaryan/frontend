import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginRegisterComponent } from './login-register.component';
import { SharedModule } from '~/shared/shared.module';

@NgModule({
  declarations: [
    LoginRegisterComponent
  ],
  imports: [
    IonicPageModule.forChild(LoginRegisterComponent),
    SharedModule
  ]
})
export class LoginPageModule {}
