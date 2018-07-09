import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AuthConfirmPageComponent } from '~/auth-confirm-page/auth-confirm-page.component';

@NgModule({
  declarations: [
    AuthConfirmPageComponent
  ],
  imports: [
    IonicPageModule.forChild(AuthConfirmPageComponent)
  ]
})
export class AuthConfirmPageComponentModule {}
