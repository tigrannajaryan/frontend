import {
  AlertController,
  NavController,
  NavParams
} from 'ionic-angular';

import { Component } from '@angular/core';
import { SMS, SmsOptions } from '@ionic-native/sms';
import { Contacts } from '@ionic-native/contacts';

import { normalizePhoneNumber } from '~/shared/utils/phone-numbers';
import { Discounts } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { StylistProfile, StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { ClientInvitation, InvitationStatus } from '~/shared/api/invitations.models';
import { InvitationsApi } from '~/core/api/invitations.api';
import { ApiResponse } from '~/shared/api/base.models';
import { showAlert } from '~/shared/utils/alert';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';

import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import {
  AbstractInvitationsComponent, defaultCountry,
  InvitationsComponentParams
} from '~/shared/components/invitations/abstract-invitations.component';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

class ErrorWrapper {
  constructor(readonly error) { }
}

@Component({
  selector: 'page-invitations',
  templateUrl: 'invitations.component.html'
})
export class InvitationsComponent extends AbstractInvitationsComponent {
  // Expose to the view
  PageNames = PageNames;

  // Preloaded stylist profile and discounts promises
  private stylistProfile: Promise<ApiResponse<StylistProfile>>;
  private discounts: Promise<ApiResponse<Discounts>>;

  constructor(
    protected contacts: Contacts,
    protected openNativeSettings: OpenNativeSettings,
    protected sms: SMS,
    protected alertCtrl: AlertController,
    private discountsApi: DiscountsApi,
    private invitationsApi: InvitationsApi,
    private navCtrl: NavController,
    private navParams: NavParams,
    private profileData: ProfileDataStore
  ) {
    super();
  }

  protected async ionViewWillLoad(): Promise<void> {
    // After it’s visited set has_invited_clients to true. It indicates
    // that a stylist has seen the inivitations screen.
    const profileStatus = await getProfileStatus() as StylistProfileStatus;
    if (profileStatus && !profileStatus.has_invited_clients) {
      await updateProfileStatus({
        ...profileStatus,
        has_invited_clients: true
      });
    }
  }

  protected ionViewWillEnter(): void {
    this.params = this.navParams.get('params') as InvitationsComponentParams;
    this.loadContacts();

    // Preload stylist profile and discounts that we will need later
    this.stylistProfile = this.profileData.get();
    this.discounts = this.discountsApi.getDiscounts().get();
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
    const invitationsPromise = this.invitationsApi.getInvitations().get();

    // Set both promises to resolve or error. We catch the errors and wrap them in a proxy ErrorWrapper class
    // to be able to differentiate from success case later. Note: if we don't catch here then by default
    // any one failure of Promise.all() will result in both promises failing without waiting for the other, which is
    // not what we want. This is why we catch here, see explanation here:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    Promise.all([
      localContactsPromise.catch(e => new ErrorWrapper(e)),
      invitationsPromise.catch(e => new ErrorWrapper(e))
    ])
      .then(([localContacts, invitations]) => {
        // Now we have the result of both promises (either success or failure).

        if (localContacts instanceof ErrorWrapper) {
          // Cannot get local contacts, most likely access is denied
          this.canReadPhoneContacts = false;
        } else {
          // Local contacts resolved successfully, load them.
          this.canReadPhoneContacts = true;
          this.loadLocalContacts(localContacts);
        }

        if (invitations instanceof ErrorWrapper || !invitations.response) {
          this.loadingContacts = false;
          throw invitations.error;
        } else {
          this.loadInvitations(invitations.response);
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

      const invitation: ClientInvitation = {
        name: contact.displayName,
        phone: phoneNumber
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
          title: '', subTitle: 'Not all invitations are sent. You can try again later.',
          buttons: [{
            text: 'Dismiss',
            handler: () => this.sendingFinished()
          }]
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
      title: '', subTitle: 'All invitations are sent.',
      buttons: [{
        text: 'Dismiss',
        handler: () => this.sendingFinished()
      }]
    });
    alert.present();
  }

  /**
   * Action to perform when sending invitation is finished (successfully or not).
   */
  private sendingFinished(): void {
    if (this.params && this.params.isRootPage) {
      // Do nothing if this is a regular view from Main screen.
      return;
    }

    // This is during registation.
    this.navCtrl.push(PageNames.HomeSlots);
  }

  private async composeInvitationText(): Promise<string> {
    const stylistProfile = (await this.stylistProfile).response;
    const discounts = (await this.discounts).response;

    let defaultInvitationText = `Hi, it's ${stylistProfile.first_name}. I'm now using the Made app to book`;
    defaultInvitationText = defaultInvitationText + (discounts.first_booking > 0 ? ' and I discounted your next visit on the app.' : '.');

    defaultInvitationText = `${defaultInvitationText} You can get it at https://madebeauty.com/get/`;

    return defaultInvitationText;
  }
}
