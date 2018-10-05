import { $ } from 'protractor';

import { click, waitForNot } from '../shared-e2e/utils';

class CalendarExamplePage {
  // UI element declarations.
  get continueBtn() { return $('page-calendar-example button[data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await click(this.continueBtn);
    await waitForNot(this.continueBtn);
  }
}

export const calendarExamplePage = new CalendarExamplePage();
