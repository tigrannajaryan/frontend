import { NgModule } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { InvitationsComponent } from './invitations.component';
import { InvitationsApi } from './invitations.api';

@NgModule({
  imports: [
    IonicPageModule.forChild(InvitationsComponent),
    CoreModule
  ],
  declarations: [
    InvitationsComponent
  ],
  providers: [
    InvitationsApi,
    Contacts,
    OpenNativeSettings
  ]
})
export class InvitationsModule {}
