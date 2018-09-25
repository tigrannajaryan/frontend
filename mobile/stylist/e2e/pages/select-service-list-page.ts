import { $ } from 'protractor';

import { waitForNot } from '../shared-e2e/utils';

class SelectServiceListPage {
  /**
   * Return the element that contains the name of the service set
   * @param setNum number in 0-1 range
   */
  getServiceSetName(setNum: number) { return $(`page-services [data-test-id=serviceList${setNum}] [data-test-id=listName]`); }

  /**
   * Return the element that contains the number of services of the service set
   * @param setNum number in 0-1 range
   */
  getServiceCountText(setNum: number) { return $(`page-services [data-test-id=serviceList${setNum}] [data-test-id=serviceCount]`); }

  /**
   * Return the element that contains the number of services of the service set
   * @param setNum number in 0-1 range
   */
  getSelectSetButton(setNum: number) { return $(`page-services [data-test-id=serviceList${setNum}] button`); }

  async selectSet(setNum: number) {
    selectServiceListPage.getSelectSetButton(setNum).click();
    await waitForNot(selectServiceListPage.getSelectSetButton(setNum));
  }
}

export const selectServiceListPage = new SelectServiceListPage();
