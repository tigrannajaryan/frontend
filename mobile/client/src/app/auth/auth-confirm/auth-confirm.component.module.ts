import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';

@NgModule({
  declarations: [
    AuthConfirmPageComponent
  ],
  imports: [
    IonicPageModule.forChild(AuthConfirmPageComponent),
    CoreModule
  ]
})
export class AuthConfirmPageComponentModule {}
