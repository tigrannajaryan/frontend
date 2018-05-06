import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    IonicPageModule.forChild(LoginComponent)
  ]
})
export class LoginPageModule {}
