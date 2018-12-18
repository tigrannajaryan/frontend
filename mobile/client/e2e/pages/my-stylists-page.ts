import { $, $$ } from 'protractor';
import { click, globals, waitFor, waitForNot } from '../shared-e2e/utils';
import { stylistProfilePage } from './stylist-profile-page';

class MyStylistsPage {
  // UI element declarations.
  get stylistSearchBtn() { return $$('my-stylists button[data-test-id=goToStylistSearch]').first(); }
  get savedStylistsBtn() { return $('my-stylists button[data-test-id=savedStylistsBtn]'); }
  get savedStylistsCard() { return $('my-stylists [data-test-id=savedStylistsTabList] stylist-card:first-child'); }

  // Operations
  async goToStylistSearch() {
    await waitFor(this.stylistSearchBtn);
    await click(this.stylistSearchBtn);
    await waitForNot(this.stylistSearchBtn);
  }

  async changeTabToSavedStylists() {
    await waitFor(this.savedStylistsBtn);
    await click(this.savedStylistsBtn);
  }

  async selectFirstSavedStylistAndRemoveIt() {
    await waitFor(this.savedStylistsCard);
    await click(this.savedStylistsCard);
    await waitFor(stylistProfilePage.removeStylist);
    await click(stylistProfilePage.removeStylist);
    await click(stylistProfilePage.goBack);
    await waitForNot(stylistProfilePage.removeStylist);
  }
}

export const myStylistsPage = new MyStylistsPage();
