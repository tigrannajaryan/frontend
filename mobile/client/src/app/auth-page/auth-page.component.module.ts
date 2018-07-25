import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { AuthPageComponent } from '~/auth-page/auth-page.component';

@NgModule({
  declarations: [
    AuthPageComponent
  ],
  imports: [
    IonicPageModule.forChild(AuthPageComponent),
    CoreModule
  ]
})
export class AuthPageComponentModule {}
