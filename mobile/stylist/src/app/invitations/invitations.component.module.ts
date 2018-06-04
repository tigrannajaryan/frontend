import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitationsComponent } from './invitations.component';
import { Contacts } from '@ionic-native/contacts';
import { CoreModule } from '~/core/core.module';
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
    Contacts
  ]
})
export class InvitationsModule {}
