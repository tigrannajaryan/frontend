import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PhoneInputDirective } from '~/core/directives/phone-input.directive';

import { AuthPageComponent } from '~/auth-page/auth-page.component';

@NgModule({
  declarations: [
    AuthPageComponent,
    PhoneInputDirective
  ],
  imports: [
    IonicPageModule.forChild(AuthPageComponent)
  ]
})
export class AuthPageComponentModule {}
