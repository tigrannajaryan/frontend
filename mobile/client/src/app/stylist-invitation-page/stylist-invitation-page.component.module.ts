import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { StylistInvitationPageComponent } from '~/stylist-invitation-page/stylist-invitation-page.component';

@NgModule({
  declarations: [
    StylistInvitationPageComponent
  ],
  imports: [
    IonicPageModule.forChild(StylistInvitationPageComponent),
    CoreModule
  ]
})
export class StylistInvitationPageComponentModule {}
