import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AuthConfirmPageComponent } from '~/auth-confirm-page/auth-confirm-page.component';
import { InputNumberDirective } from '~/core/directives/input-number.directive';

@NgModule({
  declarations: [
    AuthConfirmPageComponent,
    InputNumberDirective
  ],
  imports: [
    IonicPageModule.forChild(AuthConfirmPageComponent)
  ]
})
export class AuthConfirmPageComponentModule {}
