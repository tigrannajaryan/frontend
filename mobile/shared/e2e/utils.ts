import { $, browser, element, ElementFinder, ExpectedConditions, Locator } from 'protractor';

/**
 * Wait for the specified element to becomes visible. Waits up to 10 seconds.
 */
export async function waitFor(finder: ElementFinder): Promise<any> {
  return browser.wait(ExpectedConditions.visibilityOf(finder), 10000, `waitFor ${finder.locator().toString()} failed.`);
}

/**
 * Wait for the specified element to becomes visible. Waits up to 5 seconds.
 */
export async function waitForNot(finder: ElementFinder): Promise<any> {
  return browser.wait(ExpectedConditions.invisibilityOf(finder),
    5000, `waitForNot ${finder.locator().toString()} failed.`);
}

/**
 * Returns the first visible element that matches the specified locator
 * e.g. firstVisible(by.cssContainingText('page-logreg span', 'Log in'))
 */
export function firstVisible(locator: Locator): ElementFinder {
  return element.all(locator).filter(e => e.isDisplayed()).first();
}

/**
 * Generate a random string composed of letters.
 */
export function getRandomString(length: number): string {
  let str = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    str += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return str;
}

export function getRandomNumber(length: number): string {
  let str = '';
  const nums = '0123456789';
  for (let i = 0; i < length; i++) {
    str += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return str;
}

/**
 * Clear Ionic storage, forcing the session information and everything stored locally to be forgotten.
 * Can be used to start a fresh login session.
 */
export async function clearIonicStorage(): Promise<{}> {
  const deleteDBScript = `
  try {
    var db = openDatabase('_ionicstorage', '1', 'my database', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('DROP TABLE _ionickv');
    });
  } catch (e) {}`;

  return browser.executeScript(deleteDBScript);
}

class Globals {
  get alertSubtitle() { return $('ion-alert .alert-sub-title'); }
}

export const globals = new Globals();
