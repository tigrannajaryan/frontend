import { $ } from 'protractor';

class DiscountsPage {
  get goBack() { return $('page-discounts button.back-button'); }
}

export const discountsPage = new DiscountsPage();
