import {
  AlertController,
  IonicPage,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';

import { Component } from '@angular/core';
import { Contact, Contacts, IContactFindOptions } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SMS } from '@ionic-native/sms';
import * as Fuse from 'fuse.js/dist/fuse';

import { normalizePhoneNumber } from '~/shared/utils/phone-numbers';
import { Discounts } from '~/shared/stylist-api/discounts.models';
import { DiscountsApi } from '~/shared/stylist-api/discounts.api';
import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
import { StylistProfile } from '~/shared/stylist-api/stylist-models';
import { ClientInvitation, InvitationStatus } from '~/shared/stylist-api/invitations.models';
import { InvitationsApi, InvitationsResponse } from '~/shared/stylist-api/invitations.api';

import { PageNames } from '~/core/page-names';
import { trimStr } from '~/core/functions';
import { showAlert } from '~/core/utils/alert';

class ErrorWrapper {
  constructor(readonly error) { }
}

/**
 * Single phone contact as opposed to multi-phone contacts
 * returned by Ionic Contacts library.
 */
interface PhoneContact {
  selected: boolean;
  phoneNumber: string;
  displayName?: string;
  type?: string;
  status: InvitationStatus;
}

/**
 * A match returned by Fuse.search() function.
 * This interface is defined by Fuse.search()
 * implementation but typings are missing, so we define it here.
 */
interface FuseMatch {
  indices: number[][];
  key: string;
}

/**
 * A contact to display, including the contact details
 * and search matches. This interface is defined by Fuse.search()
 * implementation but typings are missing, so we define it here.
 */
export interface DisplayContact {
  item: PhoneContact;
  matches: FuseMatch[];
}

/**
 * A section of contacts starting with the same first letter.
 */
interface DisplayContactSection {
  sectionName: string;
  items: DisplayContact[];
}

/**
 * All phone numbers that are not starting with plus sign are assumed to be in this country.
 */
const defaultCountry = 'US';

@IonicPage({
  segment: 'invitations'
})
@Component({
  selector: 'page-invitations',
  templateUrl: 'invitations.component.html'
})
export class InvitationsComponent {
  // Expose to html template
  PageNames = PageNames;
  formatField = InvitationsComponent.formatField;
  InvitationStatus = InvitationStatus;

  // Indicates that this page is opened from the Main screen.
  isMainScreen: boolean;

  // The flag that indicates if we can read local contacts successfully.
  canReadPhoneContacts: boolean;

  // The list of all contacts as an array and as a map
  allContacts: PhoneContact[];
  allContactsByPhone: Map<string, PhoneContact>;

  // Currently visible contacts grouped by sections
  displayedContacts: DisplayContactSection[];

  // Currently selected contacts
  selectedContacts: PhoneContact[];

  // Indicates that the contacts are being loaded
  loadingContacts: boolean;

  // Current value of search input field
  searchInput: string;

  // Indicates that search action must be performed. Used for debounce logic
  searchPending: any;

  // Indicates that the search text looks like a phone number
  seachInputIsLikePhoneNumber: boolean;

  // Preloaded stylist profile and discounts promises
  private stylistProfile: Promise<StylistProfile>;
  private discounts: Promise<Discounts>;

  /**
   * PhoneContact comparison function for sorting
   */
  protected static comparePhoneContacts(a: PhoneContact, b: PhoneContact): number {
    // Contacts without displayName should go to the end of the list
    if (!a.displayName) {
      if (!b.displayName) {
        // Contacts without displayName should sort by phone number
        // between them.
        return a.phoneNumber.localeCompare(b.phoneNumber);
      }
      return 1;
    }
    if (!b.displayName) {
      return -1;
    }

    const cmp = a.displayName.localeCompare(b.displayName);
    if (cmp === 0) {
      // Contacts with the same displayName should sort by phone number
      // between them.
      return a.phoneNumber.localeCompare(b.phoneNumber);
    }
    return cmp;
  }

  /**
   * Sort contacts by displayName and group them into sections by first letter.
   */
  static groupContactsToSections(phoneContacts: PhoneContact[]): DisplayContactSection[] {
    // First map to the right structure.
    const filteredContacts = phoneContacts.map(c => ({ item: c, matches: [] }));

    // Sort by (displayName, phoneNumber)
    filteredContacts.sort((a, b) => InvitationsComponent.comparePhoneContacts(a.item, b.item));

    // Group into sections by first letter
    const groupedContacts: DisplayContactSection[] = [];
    for (const contact of filteredContacts) {
      const firstLetter = contact.item.displayName ? contact.item.displayName[0].toUpperCase() : '';
      if (groupedContacts.length === 0 ||
        groupedContacts[groupedContacts.length - 1].sectionName !== firstLetter) {

        groupedContacts.push({
          sectionName: firstLetter,
          items: []
        });
      }

      groupedContacts[groupedContacts.length - 1].items.push(contact);
    }

    return groupedContacts;
  }

  /**
   * Format a field in a way that highlights search matches (if any) using
   * <b></b> tag.
   */
  static formatField(contact: DisplayContact, fieldName: keyof PhoneContact): string {
    let value = contact.item[fieldName];
    if (!value) {
      return '';
    }

    value = value.toString();

    // Check only matches for this field name
    const matches = contact.matches.filter(m => m.key === fieldName);

    if (matches.length === 0) {
      return value;
    }

    // Now build the result as a concatenation of substring segments
    // alternating between match and non-match segments.
    let r = '';
    let i = 0;
    for (const m of matches) {
      for (const idx of m.indices) {
        // Non-match segment
        const s1 = value.substring(i, idx[0]);
        r = r + s1;

        // Match segment. Use <b> tag.
        const s2 = value.substring(idx[0], idx[1] + 1);
        r = `${r}<b>${s2}</b>`;

        i = idx[1] + 1;
        if (i >= value.length) {
          // End of string
          break;
        }
      }
    }

    // Last non-match portion
    const s1 = value.substring(i);
    r = r + s1;

    return r;
  }

  /**
   * Normalize phone number for using as a key of Map. We need this function to make
   * sure the same phone number formatted in different ways (e.g. as local number or in international format)
   * is recognised as the same phone number in Map operations.
   */
  protected static phoneAsKey(phone: string): string {
    return normalizePhoneNumber(phone, defaultCountry);
  }

  /**
   * Show an error message about invalid phone number.
   */
  protected static showPhoneNumberError(phone: string): void {
    showAlert('', `${phone.trim()} is not a valid phone number. Only US phone numbers like ` +
      '(212)&nbsp;456-7890 or international phone numbers starting with + sign are accepted.');
  }

  constructor(
    private alertCtrl: AlertController,
    private contacts: Contacts,
    private discountsApi: DiscountsApi,
    private invitationsApi: InvitationsApi,
    private navCtrl: NavController,
    private navParams: NavParams,
    private openNativeSettings: OpenNativeSettings,
    private platform: Platform,
    private sms: SMS,
    private stylistApi: StylistServiceProvider
  ) {
  }

  protected ionViewWillEnter(): void {
    this.isMainScreen = Boolean(this.navParams.get('isMainScreen'));
    this.loadContacts();

    // Preload stylist profile and discounts that we will need later
    this.stylistProfile = this.stylistApi.getProfile();
    this.discounts = this.discountsApi.getDiscounts();
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
    this.seachInputIsLikePhoneNumber = false;

    this.loadingContacts = true;

    // Initiate asynchronously in parallel reading local contacts and reading invitations from backend
    const localContactsPromise = this.getLocalContacts();
    const invitationsPromise = this.invitationsApi.getInvitations();

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

        if (invitations instanceof ErrorWrapper) {
          this.loadingContacts = false;
          throw invitations.error;
        } else {
          this.loadInvitations(invitations);
        }

        // Build the displayedContacts array. Use empty search term to display all contacts.
        this.searchInput = '';
        this.filterAndDisplayContacts();

        this.loadingContacts = false;
      });
  }

  /**
   * Get local contacts from the phone.
   */
  protected async getLocalContacts(): Promise<Contact[]> {
    // Get all contacts that have a phone number.
    const options: IContactFindOptions = {
      multiple: true,
      hasPhoneNumber: true
    };
    return this.contacts.find(['phoneNumbers', 'displayName'], options);
  }

  /**
   * Add a phone number to allContacts list and to the parallel allContactsByPhone map.
   */
  protected addToAllContacts(phoneContact: PhoneContact): void {
    this.allContacts.push(phoneContact);
    this.allContactsByPhone.set(InvitationsComponent.phoneAsKey(phoneContact.phoneNumber), phoneContact);
  }

  /**
   * Process and load local contacts to allContacts/allContactsByPhone structure.
   */
  protected async loadLocalContacts(allGrouppedContacts: Contact[]): Promise<void> {
    // Make each phone number an item in our flattened allContacts array.
    for (const contact of allGrouppedContacts) {
      if (contact.phoneNumbers) {
        for (const phoneNumber of contact.phoneNumbers) {
          const phoneContact: PhoneContact = {
            selected: false,
            phoneNumber: trimStr(phoneNumber.value),
            displayName: trimStr(contact.name.formatted),
            type: trimStr(phoneNumber.type),
            status: InvitationStatus.New
          };
          if (phoneContact.displayName === phoneContact.phoneNumber) {
            // Avoid using dummy displayName if it is exactly the same as the phone number.
            phoneContact.displayName = undefined;
          }

          this.addToAllContacts(phoneContact);
        }
      }
    }
  }

  /**
   * Load invitations received from backend and merge them with local contacts that
   * are already in allContacts/allContactsByPhone structure.
   */
  protected loadInvitations(invitations: InvitationsResponse): void {
    for (const invitation of invitations.invitations) {
      const phoneNumber = InvitationsComponent.phoneAsKey(invitation.phone);
      const contact = this.allContactsByPhone.get(phoneNumber);

      if (contact) {
        // The invited contact exists in local list. Just set the status of the invitation.
        contact.status = invitation.status;
      } else {
        // The invited contact does not exists in local list. Probably was deleted from address book
        // or was invited by manually entering the phone number. Add it as a contact to our list.
        const phoneContact: PhoneContact = {
          displayName: invitation.name,
          phoneNumber: invitation.phone,
          selected: false,
          status: invitation.status
        };

        this.addToAllContacts(phoneContact);
      }
    }
  }

  /**
   * Filter allFlatContacts using searchTerm and store the results
   * in displayedContacts. Searches in displayName and phoneNumber
   * fields (case insensitive). Performs fuzzy searching. The
   * resulting displayedContacts is also sorted alphabetically by
   * displayName and grouped by the first letter.
   */
  protected filterAndDisplayContacts(): void {
    if (this.searchInput) {
      // Perform fuzzy search. Filter allContacts by searchTerm
      const options = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        includeMatches: true,
        keys: [
          'displayName',
          'phoneNumber'
        ]
      };

      const fuse = new Fuse(this.allContacts, options);
      const filteredContacts: DisplayContact[] = fuse.search(this.searchInput);

      // Make all filtered contacts one section
      const section: DisplayContactSection = {
        sectionName: 'SEARCH RESULTS',
        items: filteredContacts
      };
      this.displayedContacts = [section];

    } else {
      // No filtering, include all contacts, but group them into sections.
      this.displayedContacts = InvitationsComponent.groupContactsToSections(this.allContacts);
    }
  }

  /**
   * Update the list of selected contacts. Walks through all contacts
   * and find contacts with "selected === true" field. The final list is sorted
   * by phone contacts.
   */
  protected updateSelectedContacts(): void {
    // Extract selected contacts (including currently invisible due to filtering).
    this.selectedContacts = this.allContacts.filter(c => c.selected).
      sort((a, b) => InvitationsComponent.comparePhoneContacts(a, b));
  }

  /**
   * Event handlers for clicking the contact.
   */
  protected onContactClick(contact: DisplayContact): void {
    // First check if the contact's phone number is valid.
    if (!normalizePhoneNumber(contact.item.phoneNumber, defaultCountry)) {
      InvitationsComponent.showPhoneNumberError(contact.item.phoneNumber);
      return;
    }

    if (contact.item.status === InvitationStatus.New) {
      // Toggle the selection state.
      contact.item.selected = !contact.item.selected;
      this.updateSelectedContacts();

      if (contact.item.selected) {
        // We selected a new item. Clear the search to allow starting over.
        this.onSearchCancel();
      }
    } else {
      let msg;
      switch (contact.item.status) {
        case InvitationStatus.InvitationFailed:
          msg = 'The invitation of this contact failed. Is the phone number correct?'; break;

        case InvitationStatus.InvitationPending:
          msg = 'The invitation will be sent soon.'; break;

        default:
          msg = 'This contact is already invited';
      }

      showAlert('', msg);
    }
  }

  /**
   * Event handler for removing selected contact.
   */
  protected onRemoveSelection(contact: PhoneContact): void {
    contact.selected = false;
    this.updateSelectedContacts();
  }

  /**
   * Event handler for search field input change.
   */
  protected onSearchChange(): void {
    // First see if the input looks like a phone number. This is needed to activate the
    // "Add Contact" button. Not related to search functionality in reality.
    this.seachInputIsLikePhoneNumber = this.searchInput.search(/[+0-9]/) >= 0;

    // Now the search part.

    // Using debounce logic to avoid too much heavy processing when use is
    // typing fast and keep the phone responsive.

    // Cancel previous debounce timeout handler if any.
    if (this.searchPending) {
      clearTimeout(this.searchPending);
    }

    // Debounce interval is 200ms normally. However set it to 0 if the input is fully
    // deleted to reduce the unneccessary delay.
    const debounceIntervalMs = this.searchInput ? 200 : 0;

    // Perform search action on debounce timeout.
    this.searchPending = setTimeout(() => {
      clearTimeout(this.searchPending);
      this.searchPending = undefined;

      // The search action: filter and display results.
      this.filterAndDisplayContacts();
    }, debounceIntervalMs);
  }

  /**
   * Event handler for search cancel button.
   */
  protected onSearchCancel(): void {
    this.searchInput = '';
    this.seachInputIsLikePhoneNumber = false;
    this.filterAndDisplayContacts();
  }

  /**
   * Event handler for Add Contact button.
   */
  protected onAddManualContact(): void {
    const phoneNumber = normalizePhoneNumber(this.searchInput, defaultCountry);
    if (!phoneNumber) {
      InvitationsComponent.showPhoneNumberError(this.searchInput.trim());
      return;
    }

    // Create a new contact and select it
    const phoneContact: PhoneContact = {
      selected: true,
      phoneNumber,
      status: InvitationStatus.New
    };

    this.addToAllContacts(phoneContact);
    this.updateSelectedContacts();

    // Clear search field because it was used as an input for phone number
    // not as a search term.
    this.onSearchCancel();
  }

  /**
   * Event handler for 'Settings' link click.
   */
  protected onSettingsClick(): void {
    // Open application settings where the user can manually grant permission to read Contacts
    // if it was not previously granted.
    this.openNativeSettings.open('application_details');
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

    if (this.platform.is('android')) {
      const alert = this.alertCtrl.create({
        subTitle: `Text message will be sent to ${this.selectedContacts.length} number(s). Are you sure?`,
        buttons:
          [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Send',
              handler: () => {
                this.sendInvitations(invitationText);
              }
            }
          ]
      });
      alert.present();
    } else {
      // No need for warning on iOS since it opens Messages app and user can still cancel
      this.sendInvitations(invitationText);
    }
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
        // tap the Send button. On Android this sends directly without user intervention.
        await this.sms.send(invitation.phone, invitationText);
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
      await this.invitationsApi.sendInvitations([invitation]);
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
   * Event handler for 'Skip' click.
   */
  protected onSkip(): void {
    this.navCtrl.push(PageNames.AlmostDone);

    // Send empty invitations list to backend to make sure the profile's
    // has_invited_clients is marked true and we do not bother the user
    // again during next login.
    this.invitationsApi.sendInvitations([]);
  }

  /**
   * Action to perform when sending invitation is finished (successfully or not).
   */
  private sendingFinished(): void {
    if (this.isMainScreen) {
      // Do nothing if this is a regular view from Main screen.
      return;
    }

    // This is during registation.
    this.navCtrl.push(PageNames.AlmostDone);
  }

  private async composeInvitationText(): Promise<string> {
    const stylistProfile = await this.stylistProfile;
    const discounts = await this.discounts;

    let defaultInvitationText = `Hi, it's ${stylistProfile.first_name}. I'm now using the Made app to book`;
    defaultInvitationText = defaultInvitationText + (discounts.first_booking > 0 ? ' and I discounted your next visit on the app.' : '.');

    defaultInvitationText = `${defaultInvitationText} You can get it at https://www.madebeauty.com/get.`;

    return defaultInvitationText;
  }
}
