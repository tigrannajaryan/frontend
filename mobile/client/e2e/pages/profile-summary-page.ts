import { $ } from 'protractor';

class ProfileSummaryPage {
  // UI element declarations.
  get phone() { return $('profile-summary [data-test-id=phone]'); }
  get fullname() { return $('profile-summary [data-test-id=userName]'); }
  get profileCompletion() { return $('profile-summary .ProfilePage-completion ion-row'); }
}

export const profileSummaryPage = new ProfileSummaryPage();
