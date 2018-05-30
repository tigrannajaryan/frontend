import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginRegisterComponent } from './login-register.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    LoginRegisterComponent
  ],
  imports: [
    IonicPageModule.forChild(LoginRegisterComponent),
    CoreModule
  ]
})
export class LoginPageModule {}
