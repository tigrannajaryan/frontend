import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterByEmailComponent } from './register-by-email';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    RegisterByEmailComponent
  ],
  imports: [
    IonicPageModule.forChild(RegisterByEmailComponent),
    SharedModule
  ]
})
export class RegisterByEmailPageModule {}
