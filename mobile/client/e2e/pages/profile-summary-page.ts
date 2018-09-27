import { $ } from 'protractor';

class ProfileSummaryPage {
  // UI element declarations.
  get phone() { return $('profile-summary span[data-test-id=phone]'); }
  get profileCompletion() { return $('profile-summary .ProfilePage-completion ion-row'); }
}

export const profileSummaryPage = new ProfileSummaryPage();
