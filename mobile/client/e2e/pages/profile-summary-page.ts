import { $, browser } from 'protractor';

import { click, globals, waitForNot } from '../shared-e2e/utils';

class ProfileSummaryPage {
  // UI element declarations.
  get phone() { return $('profile-summary [data-test-id=phone]'); }
  get fullname() { return $('profile-summary [data-test-id=userName]'); }
  get profileCompletion() { return $('profile-summary .ProfilePage-completion ion-row'); }
  get logoutLink() { return $('profile-summary [data-test-id=logout]'); }

  async logout() {
    await click(this.logoutLink);
    await click(globals.alertButton('Yes, Logout'));
    await waitForNot(this.logoutLink);
  }
}

export const profileSummaryPage = new ProfileSummaryPage();
