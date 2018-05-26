import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams
  } from 'ionic-angular';
import { Component } from '@angular/core';
import { Contacts, Contact } from '@ionic-native/contacts';
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
  invitations: InvitationClient[];

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
      let newInvitation: InvitationClient = {
        client_name: contact.displayName,
        phone: contact.phoneNumbers[0].value
      };
      this.invitations.push()
    }).catch(error => {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: error,
        buttons: ['Dismiss']
      });
      alert.present();
    });
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
