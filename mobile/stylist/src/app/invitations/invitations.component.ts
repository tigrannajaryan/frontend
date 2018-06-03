import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';
import { Component } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';
import { ClientInvitation } from './invitations.models';
import { InvitationsApi } from './invitations.api';
import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'invitations'
})
@Component({
  selector: 'page-invitations',
  templateUrl: 'invitations.component.html'
})
export class InvitationsComponent {
  phoneNumber = '';
  invitations: ClientInvitation[] = [];

  invitationsSent = 0;
  invitationsAccepted = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private contacts: Contacts,
    private invitationsApi: InvitationsApi
  ) {
  }

  async pickContactPhone(): Promise<void> {
    try {
      const contact = await this.contacts.pickContact();
      if (contact.phoneNumbers.length > 1) {
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
            this.addInvitation(phoneNumber, contact.name.givenName);
          }
        });
        alert.present();
      } else {
        if (contact.phoneNumbers.length > 0) {
          this.addInvitation(contact.phoneNumbers[0].value, contact.name.givenName);
        }
      }
    } catch (error) {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: error,
        buttons: ['Dismiss']
      });
      alert.present();
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

  async sendInvitations(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      await this.invitationsApi.sendInvitations(this.invitations);

      this.navCtrl.push(PageNames.Today);
    } finally {
      loading.dismiss();
    }
  }

  private addInvitation(phoneNumber: string, clientName?: string): void {
    const newInvitation: ClientInvitation = {
      name: clientName,
      phone: phoneNumber
    };
    this.invitations.push(newInvitation);
  }

}
