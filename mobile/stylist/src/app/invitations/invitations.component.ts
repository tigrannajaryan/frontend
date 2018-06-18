import {
  AlertController,
  IonicPage,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import { Component } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';

import { PageNames } from '~/core/page-names';
import { ClientInvitation } from './invitations.models';
import { InvitationsApi } from './invitations.api';
import { showAlert } from '~/core/utils/alert';
import { loading } from '~/core/utils/loading';

@IonicPage({
  segment: 'invitations'
})
@Component({
  selector: 'page-invitations',
  templateUrl: 'invitations.component.html'
})
export class InvitationsComponent {
  protected PageNames = PageNames;
  phoneNumber = '';
  invitations: ClientInvitation[] = [];

  invitationsSent = 0;
  invitationsAccepted = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private contacts: Contacts,
    private invitationsApi: InvitationsApi
  ) {
  }

  async pickContactPhone(): Promise<void> {
    try {
      const contact = await this.contacts.pickContact();
      if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
        showAlert('', 'The contact has no phone numbers');
        return;
      }

      if (contact.phoneNumbers.length === 1) {
        this.addInvitation(contact.phoneNumbers[0].value, contact.name.givenName);
      } else {
        const alert = this.alertCtrl.create();
        alert.setTitle(contact.name.givenName);
        contact.phoneNumbers.forEach(phoneNumber => {
          alert.addInput({
            type: 'radio',
            label: phoneNumber.value,
            value: phoneNumber.value
          });
        });
        alert.addButton('Cancel');
        alert.addButton({
          text: 'OK',
          handler: phoneNumber => {
            if (phoneNumber) {
              this.addInvitation(phoneNumber, contact.name.givenName);
            }
          }
        });
        alert.present();
      }
    } catch (error) {
      showAlert('Error', error);
    }
  }

  addContact(): void {
    if (this.phoneNumber) {
      this.addInvitation(this.phoneNumber, '');
      this.phoneNumber = '';
    }
  }

  removeInvitation(invitation: ClientInvitation): void {
    const indexOfInvitation = this.invitations.indexOf(invitation);
    this.invitations.splice(indexOfInvitation, 1);
  }

  @loading
  async sendInvitations(): Promise<void> {
    await this.invitationsApi.sendInvitations(this.invitations);
    this.navCtrl.push(PageNames.Today);
  }

  private addInvitation(phoneNumber: string, clientName?: string): void {
    phoneNumber = phoneNumber.trim();

    // Check for duplicates
    if (this.invitations.find(e => e.phone === phoneNumber)) {
      showAlert('', `Phone number ${phoneNumber} is already added to the invitation list.`);
      return;
    }

    const newInvitation: ClientInvitation = {
      name: clientName,
      phone: phoneNumber
    };
    this.invitations.push(newInvitation);
  }

}
