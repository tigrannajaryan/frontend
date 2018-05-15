import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginComponent } from './login.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    IonicPageModule.forChild(LoginComponent),
    SharedModule
  ]
})
export class LoginPageModule {}
