import {
  IonicPage,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import { Component } from '@angular/core';
import { Contacts, IContactFindOptions } from '@ionic-native/contacts';
import * as Fuse from 'fuse.js/dist/fuse';

import { PageNames } from '~/core/page-names';
import { ClientInvitation } from './invitations.models';
import { InvitationsApi } from './invitations.api';
import { loading } from '~/core/utils/loading';
import { trimStr } from '~/core/functions';

/**
 * Single phone contact as opposed to multi-phone contacts
 * returned by Ionic Contacts library.
 */
interface PhoneContact {
  selected: boolean;
  phoneNumber: string;
  displayName?: string;
  type?: string;
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

  protected phoneNumber = '';
  protected allContacts: PhoneContact[];
  protected displayedContacts: DisplayContactSection[];
  protected loadingContacts = false;
  protected selectedCount = 0;

  /**
   * Sort contacts by displayName and group them into sections by first letter.
   */
  static groupContactsToSections(allContacts: PhoneContact[]): DisplayContactSection[] {
    // First map to the right structure.
    const filteredContacts = allContacts.map(c => ({ item: c, matches: [] }));

    // Sort by (displayName, phoneNumber)
    filteredContacts.sort((a, b) => {
      // Contacts without displayName should go to the end of the list
      if (!a.item.displayName) {
        if (!b.item.displayName) {
          // Contacts without displayName should sort by phone number
          // between them.
          return a.item.phoneNumber.localeCompare(b.item.phoneNumber);
        }
        return 1;
      }
      if (!b.item.displayName) {
        return -1;
      }

      const cmp = a.item.displayName.localeCompare(b.item.displayName);
      if (cmp === 0) {
        // Contacts with the same displayName should sort by phone number
        // between them.
        return a.item.phoneNumber.localeCompare(b.item.phoneNumber);
      }
      return cmp;
    });

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private contacts: Contacts,
    private invitationsApi: InvitationsApi
  ) {
    this.loadContactsFromPhone();
  }

  protected async loadContactsFromPhone(): Promise<void> {
    try {
      this.loadingContacts = true;

      // Get all contacts that have a phone number.
      const options: IContactFindOptions = {
        multiple: true,
        hasPhoneNumber: true
      };
      const allGrouppedContacts = await this.contacts.find(['phoneNumbers', 'displayName'], options);

      // Make each phone number an item in our flattened allContacts array.
      this.allContacts = [];
      for (const contact of allGrouppedContacts) {
        if (contact.phoneNumbers) {
          for (const phoneNumber of contact.phoneNumbers) {
            this.allContacts.push({
              selected: false,
              phoneNumber: trimStr(phoneNumber.value),
              displayName: trimStr(contact.displayName),
              type: trimStr(phoneNumber.type)
            });
          }
        }
      }

      // Build the displayedContacts array. Use empty search term to display all contacts.
      this.filterAndDisplayContacts('');

    } catch (e) {
      // Cannot get contacs, most likely access is denied
      this.displayedContacts = undefined;
    } finally {
      this.loadingContacts = false;
    }
  }

  /**
   * Filter allFlatContacts using searchTerm and store the results
   * in displayedContacts. Searches in displayName and phoneNumber
   * fields (case insensitive). Performs fuzzy searching. The
   * resulting displayedContacts is also sorted alphabetically by
   * displayName and grouped by the first letter.
   * @param searchTerm the substring to search for.
   */
  protected filterAndDisplayContacts(searchTerm: string): void {
    if (searchTerm) {
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
      const filteredContacts: DisplayContact[] = fuse.search(searchTerm);

      // Make all filtered contacts one section
      const section: DisplayContactSection = {
        sectionName: 'All contacts',
        items: filteredContacts
      };
      this.displayedContacts = [section];

    } else {
      // No filtering, include all contacts, but group them into sections.
      this.displayedContacts = InvitationsComponent.groupContactsToSections(this.allContacts);
    }
  }

  protected onSearch(event: any): void {
    const searchTerm = event.target.value;
    this.filterAndDisplayContacts(searchTerm ? searchTerm : '');
  }

  protected onSearchCancel(): void {
    this.filterAndDisplayContacts('');
  }

  protected onSelectedChange(): void {
    // Count total number of selected contact (including currently
    // invisible due to filtering).
    this.selectedCount = this.allContacts.filter(c => c.selected).length;
  }

  protected addContact(): void {
    if (this.phoneNumber) {
      // Create a new contact and select it
      this.allContacts.push({
        selected: true,
        phoneNumber: this.phoneNumber
      });

      // Make sure selection change is taken into account
      this.onSelectedChange();

      // Clear the search term to ensure newly added contact is visible and update the view
      this.filterAndDisplayContacts('');

      // Clear the input field
      this.phoneNumber = '';
    }
  }

  @loading
  async sendInvitations(): Promise<void> {
    const invitations: ClientInvitation[] = [];
    for (const contact of this.allContacts) {
      if (contact.selected) {
        invitations.push({
          name: contact.displayName,
          phone: contact.phoneNumber
        });
      }
    }

    await this.invitationsApi.sendInvitations(invitations);
    this.navCtrl.push(PageNames.Tabs);
  }
}
