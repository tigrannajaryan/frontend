import { $ } from 'protractor';

class StylistProfilePage {
  // UI element declarations.
  get goBack() { return $('stylist-profile button.back-button'); }
  get addStylist() { return $('stylist-profile [data-test-id=addStylist]'); }
  get removeStylist() { return $('stylist-profile [data-test-id=removeStylist]'); }
}

export const stylistProfilePage = new StylistProfilePage();
