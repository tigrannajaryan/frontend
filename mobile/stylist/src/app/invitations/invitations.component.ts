import {
  IonicPage,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import { Component } from '@angular/core';
import { Contact, Contacts, IContactFindOptions } from '@ionic-native/contacts';
import * as Fuse from 'fuse.js/dist/fuse';
import { formatNumber, parseNumber } from 'libphonenumber-js';

import { PageNames } from '~/core/page-names';
import { ClientInvitation } from './invitations.models';
import { InvitationsApi, InvitationsResponse } from './invitations.api';
import { loading } from '~/core/utils/loading';
import { trimStr } from '~/core/functions';
import { showAlert } from '~/core/utils/alert';

export enum ContactStatus {
  New,
  Invited,
  Accepted
}

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
  status: ContactStatus;
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
  protected PageNames = PageNames;
  protected formatField = InvitationsComponent.formatField;
  protected ContactStatus = ContactStatus;

  // Indicates that this page is opened from the Home screen.
  protected isProfile: boolean;

  // The list of all contacts as an array and as a map
  protected allContacts: PhoneContact[];
  protected allContactsByPhone: Map<string, PhoneContact>;

  // Currently visible contacts grouped by sections
  protected displayedContacts: DisplayContactSection[];

  // Currently selected contacts
  protected selectedContacts: PhoneContact[] = [];

  // Indicates that the contacts are being loaded
  protected loadingContacts = false;

  // Current value of search input field
  protected searchInput = '';

  // Indicates that search action must be performed. Used for debounce logic
  protected searchPending: any;

  // Indicates that the search text looks like a phone number
  protected seachInputIsLikePhoneNumber = false;

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

  protected static apiContactStatusStringToEnum(status: string): ContactStatus {
    switch (status) {
      case 'invited': return ContactStatus.Invited;
      case 'accepted': return ContactStatus.Accepted;
      default: return ContactStatus.New;
    }
  }

  /**
   * Normalize phone number for using as a key of Map. Trims whitespace and
   * removes all invalid characters.
   */
  protected static phoneAsKey(phone: string): string {
    // Remove all characters except digits and +
    return phone.trim().replace(/[^+0-9]/gm, '');
  }

  /**
   * Validate and format a phone number string as a number in default country
   * or as international number and returns details of parsing.
   * If the number is valid returns it formatted in Internatioal format.
   * @returns undefined if the phone number is not valid
   */
  static validatePhoneNumber(phone: string): string {
    try {
      const intlFormat = formatNumber(parseNumber(phone, defaultCountry), 'International');

      // Due to a bug in libphonenum we need to parse again the resulting international format
      // to see if it is really a valid number.
      if (parseNumber(intlFormat, defaultCountry).phone) {
        return intlFormat;
      } else {
        return undefined;
      }
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Show an error message about invalid phone number.
   */
  protected static showPhoneNumberError(phone: string): void {
    showAlert('', `${phone.trim()} is not a valid phone number. Only US phone numbers like ` +
      '(212)&nbsp;456-7890 or international phone numbers starting with + sign are accepted.');
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private contacts: Contacts,
    private invitationsApi: InvitationsApi
  ) {
  }

  protected ionViewWillEnter(): void {
    this.isProfile = Boolean(this.navParams.get('isProfile'));
    this.loadContacts();
  }

  /**
   * Load local contacts from phone and invitations from backend
   * and merge them into one list of contacts with correct invitation
   * statuses.
   */
  protected loadContacts(): void {
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
          this.displayedContacts = undefined;
        } else {
          // Local contacts resolved successfully, load them.
          this.loadLocalContacts(localContacts);
          if (invitations instanceof ErrorWrapper) {
            this.loadingContacts = false;
            throw invitations.error;
          } else {
            this.loadInvitations(invitations);
          }

          // Build the displayedContacts array. Use empty search term to display all contacts.
          this.searchInput = '';
          this.filterAndDisplayContacts();
        }

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
    this.allContacts = [];
    this.allContactsByPhone = new Map();
    for (const contact of allGrouppedContacts) {
      if (contact.phoneNumbers) {
        for (const phoneNumber of contact.phoneNumbers) {
          const phoneContact: PhoneContact = {
            selected: false,
            phoneNumber: trimStr(phoneNumber.value),
            displayName: trimStr(contact.displayName),
            type: trimStr(phoneNumber.type),
            status: ContactStatus.New
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
      const status: ContactStatus = InvitationsComponent.apiContactStatusStringToEnum(invitation.status);

      if (contact) {
        // The invited contact exists in local list. Just set the status of the invitation.
        contact.status = status;
      } else {
        // The invited contact does not exists in local list. Probably was deleted from address book
        // or was invited by manually entering the phone number. Add it as a contact to our list.
        const phoneContact: PhoneContact = {
          displayName: invitation.name,
          phoneNumber: invitation.phone,
          selected: false,
          status
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
    if (!InvitationsComponent.validatePhoneNumber(contact.item.phoneNumber)) {
      InvitationsComponent.showPhoneNumberError(contact.item.phoneNumber);
      return;
    }

    if (contact.item.status === ContactStatus.New) {
      // Toggle the selection state.
      contact.item.selected = !contact.item.selected;
      this.updateSelectedContacts();
    } else {
      showAlert('', 'This contact is already invited.');
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
    const phoneNumber = InvitationsComponent.validatePhoneNumber(this.searchInput);
    if (!phoneNumber) {
      InvitationsComponent.showPhoneNumberError(this.searchInput.trim());
      return;
    }

    // Create a new contact and select it
    const phoneContact: PhoneContact = {
      selected: true,
      phoneNumber,
      status: ContactStatus.New
    };

    this.addToAllContacts(phoneContact);
    this.updateSelectedContacts();

    // Clear search field because it was used as an input for phone number
    // not as a search term.
    this.onSearchCancel();
  }

  @loading
  protected async sendInvitations(): Promise<void> {
    if (this.selectedContacts.length === 0) {
      showAlert('', 'To invite select some contacts by tapping on the contact name or enter a phone number manually in the search box.');
      return;
    }

    // Prepare the list of selected phone numbers
    const invitations: ClientInvitation[] = [];
    for (const contact of this.selectedContacts) {
      const phoneNumber = InvitationsComponent.validatePhoneNumber(contact.phoneNumber);

      invitations.push({
        name: contact.displayName,
        phone: phoneNumber
      });
    }

    // And send to backend.
    await this.invitationsApi.sendInvitations(invitations);

    this.nextRoute();
  }

  protected nextRoute(): void {
    if (this.isProfile) {
      this.navCtrl.pop();
      return;
    }

    this.navCtrl.push(PageNames.Home);
  }
}
