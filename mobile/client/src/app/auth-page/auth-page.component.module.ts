import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AuthPageComponent } from '~/auth-page/auth-page.component';

@NgModule({
  declarations: [
    AuthPageComponent
  ],
  imports: [
    IonicPageModule.forChild(AuthPageComponent)
  ]
})
export class AuthPageComponentModule {}
