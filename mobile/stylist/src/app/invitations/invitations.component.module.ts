import { NgModule } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SMS } from '@ionic-native/sms';
import { IonicPageModule } from 'ionic-angular';

import { InvitationsApi } from '~/shared/stylist-api/invitations.api';
import { CoreModule } from '~/core/core.module';
import { InvitationsComponent } from './invitations.component';

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
    OpenNativeSettings,
    SMS
  ]
})
export class InvitationsModule {}
