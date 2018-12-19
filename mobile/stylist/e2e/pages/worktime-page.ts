import { $, browser } from 'protractor';
import { click, waitFor, waitForCond, waitForNot } from '../shared-e2e/utils';

class WorktimePage {
  /**
   * Return the element that contains the week day
   * @param cardNum number starting from 0
   * @param weekDayNum number in 0-6 range
   */
  getWeekDayToggle(cardNum: number, weekDayNum: number) {
    return $(`page-hours [data-test-id='${cardNum}'] [data-test-id=weekDayBox${weekDayNum}]`);
  }

  getWeekDayToggleClickableArea(cardNum: number, weekDayNum: number) {
    return $(`page-hours [data-test-id='${cardNum}'] [data-test-id=weekDayLabel${weekDayNum}]`);
  }

  get continueButton() { return $('page-hours button[data-test-id=continueBtn]'); }

  get goBack() { return $('page-hours button.back-button'); }

  // Operations
  async isWeekdaySelected(cardNum: number, weekDayNum: number): Promise<boolean> {
    const classes = await worktimePage.getWeekDayToggle(cardNum, weekDayNum).getAttribute('class');
    return classes.includes('is-available');
  }

  async toggleWeekDay(cardNum: number, weekDayNum: number) {
    const toggle = this.getWeekDayToggle(cardNum, weekDayNum);
    await waitFor(toggle);
    const wasSelected = await this.isWeekdaySelected(cardNum, weekDayNum);
    await this.getWeekDayToggleClickableArea(cardNum, weekDayNum).click();
    await waitForCond(async () => (await this.isWeekdaySelected(cardNum, weekDayNum)) === !wasSelected);
    const isSelected = await this.isWeekdaySelected(cardNum, weekDayNum);
    expect(isSelected).toEqual(!wasSelected);
  }

  async continue() {
    await click(this.continueButton);
    await waitForNot(this.continueButton);
  }
}

export const worktimePage = new WorktimePage();
