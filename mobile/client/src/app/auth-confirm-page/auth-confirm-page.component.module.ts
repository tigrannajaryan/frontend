import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { AuthConfirmPageComponent } from '~/auth-confirm-page/auth-confirm-page.component';

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
