import { $, $$ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class ServicesPage {
  /**
   * Return the element that contains the name of the service set.
   * Note: categoryNum includes invisible categories (those that don't have any services).
   * @param categoryNum number starting from 0
   */
  getCategoryName(categoryNum: number) {
    return $(`page-services-list [data-test-id=categorySection${categoryNum}] [data-test-id=categoryName]`);
  }

  getServicesInCategory(categoryNum: number) {
    return $$(`page-services-list [data-test-id=categorySection${categoryNum}] [data-test-id=serviceList]`);
  }

  get continueButton() { return $('page-services-list button[data-test-id=continueBtn]'); }

  async continue() {
    await click(this.continueButton);
    await waitForNot(this.continueButton);
  }
}

export const servicesPage = new ServicesPage();
