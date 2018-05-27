import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';
import { Component } from '@angular/core';
import { Contact, Contacts } from '@ionic-native/contacts';
import { InvitationClient } from './invitations.models';
import { InvitationsApi } from './invitations.api';
// import { PageNames } from '~/shared/page-names';

@IonicPage({
  segment: 'invitations'
})
@Component({
  selector: 'page-invitations',
  templateUrl: 'invitations.component.html'
})
export class InvitationsComponent {
  phoneNumber = '';
  invitations: InvitationClient[] = [];

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

  pickContact(): void {
    this.contacts.pickContact().then((contact: Contact) => {
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
            const newInvitation: InvitationClient = {
              name: contact.name.givenName,
              phone: phoneNumber
            };
            this.invitations.push(newInvitation);
          }
        });
        alert.present();
      } else {
        const newInvitation: InvitationClient = {
          name: contact.name.givenName,
          phone: contact.phoneNumbers[0].value
        };
        this.invitations.push(newInvitation);
      }
    }).catch(error => {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: error,
        buttons: ['Dismiss']
      });
      alert.present();
    });
  }

  addContact(): void {
    if (this.phoneNumber) {
      const newInvitation: InvitationClient = {
        phone: this.phoneNumber
      };
      this.invitations.push(newInvitation);
      this.phoneNumber = '';
    }
  }

  async sendInvitations(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      await this.invitationsApi.sendInvitations(this.invitations);

      // Go to Summary Page when it is created
      // this.navCtrl.push(PageNames.?, {}, { animate: false });
    } finally {
      loading.dismiss();
    }
  }

}
