import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class SelectDatePage {
  // UI element declarations.
  get addServiceBtn() {
    return $('select-date [data-test-id=addServiceBtn]');
  }

  serviceItemName(index: number) {
    return $(`select-date [data-test-id=serviceItem${index}] [data-test-id=name]`);
  }

  serviceItemDeleteBtn(index: number) {
    return $(`select-date [data-test-id=serviceItem${index}] [data-test-id=deleteBtn]`);
  }

  // Operations
  async addService() {
    await click(this.addServiceBtn);
    await waitForNot(this.addServiceBtn);
  }

  async deleteService(index: number) {
    await click(this.serviceItemDeleteBtn(index));
  }
}

export const selectDatePage = new SelectDatePage();
