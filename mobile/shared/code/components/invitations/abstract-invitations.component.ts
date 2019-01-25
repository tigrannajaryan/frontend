import { Contact, Contacts, IContactFindOptions } from '@ionic-native/contacts/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { AlertController } from 'ionic-angular';

import * as Fuse from 'fuse.js/dist/fuse';

import { trimStr } from '~/shared/utils/string-utils';
import { showAlert } from '~/shared/utils/alert';
import { normalizePhoneNumber } from '~/shared/utils/phone-numbers';
import { InvitationsResponse, InvitationStatus } from '~/shared/api/invitations.models';

/**
 * Single phone contact as opposed to multi-phone contacts
 * returned by Ionic Contacts library.
 */
export interface PhoneContact {
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
export interface DisplayContactSection {
    sectionName: string;
    items: DisplayContact[];
}

/**
 * All phone numbers that are not starting with plus sign are assumed to be in this country.
 */
export const defaultCountry = 'US';

export interface InvitationsComponentParams {
    isRootPage?: boolean;
    inClientToStylistInvitation?: boolean;
}

export abstract class AbstractInvitationsComponent {
    formatField = AbstractInvitationsComponent.formatField;
    InvitationStatus = InvitationStatus;

    // Indicates that this page is opened from the Main screen.
    params: InvitationsComponentParams;

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
    searchInputIsLikePhoneNumber: boolean;

    protected contacts: Contacts;
    protected openNativeSettings: OpenNativeSettings;
    protected sms: SMS;
    protected alertCtrl: AlertController;

    /**
     * Sort contacts by displayName and group them into sections by first letter.
     */
    static groupContactsToSections(phoneContacts: PhoneContact[]): DisplayContactSection[] {
        // First map to the right structure.
        const filteredContacts = phoneContacts.map(c => ({ item: c, matches: [] }));

        // Sort by (displayName, phoneNumber)
        filteredContacts.sort((a, b) => AbstractInvitationsComponent.comparePhoneContacts(a.item, b.item));

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
        this.allContactsByPhone.set(AbstractInvitationsComponent.phoneAsKey(phoneContact.phoneNumber), phoneContact);
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
            const phoneNumber = AbstractInvitationsComponent.phoneAsKey(invitation.phone);
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
            this.displayedContacts = AbstractInvitationsComponent.groupContactsToSections(this.allContacts);
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
        sort((a, b) => AbstractInvitationsComponent.comparePhoneContacts(a, b));
    }

    /**
     * Event handlers for clicking the contact.
     */
    protected onContactClick(contact: DisplayContact): void {
        // First check if the contact's phone number is valid.
        if (!normalizePhoneNumber(contact.item.phoneNumber, defaultCountry)) {
            AbstractInvitationsComponent.showPhoneNumberError(contact.item.phoneNumber);
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
        this.searchInputIsLikePhoneNumber = this.searchInput.search(/[+0-9]/) >= 0;

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
        this.searchInputIsLikePhoneNumber = false;
        this.filterAndDisplayContacts();
    }

    /**
     * Event handler for Add Contact button.
     */
    protected onAddManualContact(): void {
        const phoneNumber = normalizePhoneNumber(this.searchInput, defaultCountry);
        if (!phoneNumber) {
            AbstractInvitationsComponent.showPhoneNumberError(this.searchInput.trim());
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
}
