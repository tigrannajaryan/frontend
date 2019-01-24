import {
  AlertController,
  NavParams
} from 'ionic-angular';

import { Component } from '@angular/core';
import { SMS, SmsOptions } from '@ionic-native/sms';

import { normalizePhoneNumber } from '~/shared/utils/phone-numbers';
import { ClientInvitation, InvitationStatus, InviteTarget } from '~/shared/api/invitations.models';
import { showAlert } from '~/shared/utils/alert';

import { PageNames } from '~/core/page-names';
import { InvitationsApi } from '~/core/api/invitations.api';
import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileModel } from '~/core/api/profile.models';
import {
  AbstractInvitationsComponent, defaultCountry,
  InvitationsComponentParams
} from '~/shared/components/invitations/abstract-invitations.component';
import { Contacts } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

class ErrorWrapper {
  constructor(readonly error) { }
}

@Component({
  selector: 'page-invitations',
  templateUrl: 'invitations.component.html'
})
export class InvitationsComponent extends AbstractInvitationsComponent {
  // Expose to html template
  PageNames = PageNames;

  private profile: ProfileModel;

  constructor(
    protected contacts: Contacts,
    protected openNativeSettings: OpenNativeSettings,
    protected sms: SMS,
    protected alertCtrl: AlertController,
    private invitationsApi: InvitationsApi,
    private navParams: NavParams,
    private profileDataStore: ProfileDataStore
  ) {
    super();
  }

  protected async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params') as InvitationsComponentParams;
    this.loadContacts();

    // Preload user profile that we will need later
    const profileResponse = await this.profileDataStore.get();
    if (profileResponse.response) {
      this.profile = profileResponse.response;
    }
  }

  /**
   * Load local contacts from phone and invitations from backend
   * and merge them into one list of contacts with correct invitation
   * statuses.
   */
  protected loadContacts(): void {
    // Initialize local state
    this.allContacts = [];
    this.allContactsByPhone = new Map();
    this.displayedContacts = [];
    this.selectedContacts = [];
    this.searchInput = '';
    this.searchPending = false;
    this.searchInputIsLikePhoneNumber = false;

    this.loadingContacts = true;

    // Initiate asynchronously in parallel reading local contacts and reading invitations from backend
    const localContactsPromise = this.getLocalContacts();

    // Set both promises to resolve or error. We catch the errors and wrap them in a proxy ErrorWrapper class
    // to be able to differentiate from success case later. Note: if we don't catch here then by default
    // any one failure of Promise.all() will result in both promises failing without waiting for the other, which is
    // not what we want. This is why we catch here, see explanation here:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    Promise.all([
      localContactsPromise.catch(e => new ErrorWrapper(e))
    ])
      .then(([localContacts]) => {
        // Now we have the result of both promises (either success or failure).

        if (localContacts instanceof ErrorWrapper) {
          // Cannot get local contacts, most likely access is denied
          this.canReadPhoneContacts = false;
        } else {
          // Local contacts resolved successfully, load them.
          this.canReadPhoneContacts = true;
          this.loadLocalContacts(localContacts);
        }

        // Build the displayedContacts array. Use empty search term to display all contacts.
        this.searchInput = '';
        this.filterAndDisplayContacts();

        this.loadingContacts = false;
      });
  }

  /**
   * Event handler for 'Invite Clients' button click.
   */
  protected async onInviteClients(): Promise<void> {
    if (this.selectedContacts.length === 0) {
      showAlert('', 'To invite select some contacts by tapping on the contact name or enter a phone number manually in the search box.');
      return;
    }

    const invitationText = await this.composeInvitationText();
    this.sendInvitations(invitationText);
  }

  /**
   * Send invitations to selected contacts
   */
  protected async sendInvitations(invitationText: string): Promise<void> {
    // Go through the list of selected phone numbers
    for (const contact of this.selectedContacts) {
      const phoneNumber = normalizePhoneNumber(contact.phoneNumber, defaultCountry);
      if (!phoneNumber) {
        // Skip any invalid numbers (there should not be any because we validate earlier, but
        // we want to be definsive).
        continue;
      }

      const inviteTarget = this.params && this.params.inClientToStylistInvitation
        ? InviteTarget.stylist : InviteTarget.client;

      const invitation: ClientInvitation = {
        name: contact.displayName,
        phone: phoneNumber,
        invite_target: inviteTarget
      };

      try {
        // Send the message. On iOS This opens standard SMS App on the phone and the user must manually
        // tap the Send button. On Android we use intent to achieve similar functionality.
        const options: SmsOptions = {
          android: {
            intent: 'INTENT' // Use intent to open default SMS app instead of sending directly
          }
        };
        await this.sms.send(invitation.phone, invitationText, options);
      } catch (e) {
        // SMS is not sent. Most likely cancelled by the user.
        const alert = this.alertCtrl.create({
          title: '', subTitle: 'Not all invitations are sent. You can try again later.'
        });
        alert.present();
        return;
      }

      // Remove the invited contact from the selected list and updates its status
      contact.selected = false;
      contact.status = InvitationStatus.Invited;
      this.updateSelectedContacts();

      // Let our backend know that the message was sent
      const { response } = await this.invitationsApi.createInvitations([invitation]).get();
      if (!response) {
        return;
      }
    }

    const alert = this.alertCtrl.create({
      title: '', subTitle: 'All invitations are sent.'
    });
    alert.present();
  }

  private async composeInvitationText(): Promise<string> {
    let defaultInvitationText = '';

    if (this.params && this.params.inClientToStylistInvitation) {
      defaultInvitationText = `Hi, it's ${this.profile.first_name}. I saw this cool app to find
 and book stylists called MADE Pro. Check it out and see if you would be interested
 in creating a stylist profile! Check it out https://madebeauty.com/get/`;
    } else {
      defaultInvitationText = `Hi, it's ${this.profile.first_name}. I'm using the MADE app to find
 and book stylists. You can book using dynamic pricing
 and find some great deals! Check it out https://madebeauty.com/get/`;
    }

    return defaultInvitationText;
  }
}
