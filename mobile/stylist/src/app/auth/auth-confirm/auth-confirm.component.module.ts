import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { AuthProcessState } from '~/shared/storage/auth-process-state';
import { CoreModule } from '~/core/core.module';

import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';

@NgModule({
  declarations: [
    AuthConfirmPageComponent
  ],
  imports: [
    IonicPageModule.forChild(AuthConfirmPageComponent),
    CoreModule
  ],
  providers: [
    AuthProcessState
  ]
})
export class AuthConfirmPageComponentModule {}
