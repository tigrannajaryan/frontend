import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterWorktimePage } from './register-worktime';

@NgModule({
  declarations: [
    RegisterWorktimePage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterWorktimePage),
  ],
})
export class RegisterWorktimePageModule {}
