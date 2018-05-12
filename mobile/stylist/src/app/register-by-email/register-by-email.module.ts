import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterByEmailComponent } from './register-by-email';

@NgModule({
  declarations: [
    RegisterByEmailComponent
  ],
  imports: [
    IonicPageModule.forChild(RegisterByEmailComponent)
  ]
})
export class RegisterByEmailPageModule {}
