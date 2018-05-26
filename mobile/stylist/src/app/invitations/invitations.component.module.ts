import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitationsComponent } from './invitations.component';
import { Contacts } from '@ionic-native/contacts';
import { SharedModule } from '../shared/shared.module';
import { InvitationsApi } from './invitations.api';

@NgModule({
  imports: [
    IonicPageModule.forChild(InvitationsComponent),
    SharedModule
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
