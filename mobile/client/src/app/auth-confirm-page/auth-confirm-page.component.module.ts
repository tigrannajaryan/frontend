import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AuthConfirmPageComponent } from '~/auth-confirm-page/auth-confirm-page.component';
import { InputNumberDirective } from '~/core/directives/input-number.directive';

import { FormatPhonePipe } from '~/core/pipes/format-phone.pipe';
import { HasErrorPipe } from '~/core/pipes/has-error.pipe';

@NgModule({
  declarations: [
    AuthConfirmPageComponent,
    InputNumberDirective,
    FormatPhonePipe,
    HasErrorPipe
  ],
  imports: [
    IonicPageModule.forChild(AuthConfirmPageComponent)
  ]
})
export class AuthConfirmPageComponentModule {}
