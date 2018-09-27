import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class SelectCategoryPage {
  // UI element declarations.
  categoryCard(categoryCode: string) { return $(`page-services-categories [data-test-id=category${categoryCode}]`); }

  // Operations
  async selectCategory(categoryCode: string) {
    await click(this.categoryCard(categoryCode));
    await waitForNot(this.categoryCard(categoryCode));
  }
}

export const selectCategoryPage = new SelectCategoryPage();
