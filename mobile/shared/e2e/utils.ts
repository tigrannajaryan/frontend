import { $, browser, by, element, ElementFinder, ExpectedConditions, Locator } from 'protractor';
import { formatNumber, parseNumber } from 'libphonenumber-js';

const waitTimeout = 10000; // ms

/**
 * Wait for element to become clickable (visible and enabled)
 * and then click on it.
 * @param finder of the element
 */
export async function click(finder: ElementFinder): Promise<any> {
  // Wait until element is clickable. This usually works, but not always
  // reliably, see below for more comments.
  await waitForClickable(finder);

  // Protractor/WebDriver is unreliable. Sometimes it fails to click on elements and
  // produces internal errors in itself (it has its own bugs). I could not find any
  // other way to reliably click except to try a few times with pauses.
  const maxAttempts = 10;
  let pausePeriodMs = 50;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await finder.click();
      // It worked, done.
      break;
    } catch (e) {
      if (i < maxAttempts - 1) {
        // This is usually internal error of WebDriver and we cannot do anything. Wait a bit and try again.
        browser.sleep(pausePeriodMs);
        // Increase pause period between attempts exponentially to avoid unneccessary clicks and CPU load.
        pausePeriodMs = pausePeriodMs*2;
      } else {
        console.error(`Error: cannot click on ${finder.locator().toString()}`);
        throw e;
      }
    }
  }
}

/**
 * Wait for the specified element to become visible. Waits up to 10 seconds.
 */
export async function waitFor(finder: ElementFinder): Promise<any> {
  return browser.wait(ExpectedConditions.visibilityOf(finder), waitTimeout,
    `waitFor ${finder.locator().toString()} failed.`);
}

/**
 * Wait for the specified element to become clickable. Waits up to 10 seconds.
 */
export async function waitForClickable(finder: ElementFinder): Promise<any> {
  return browser.wait(ExpectedConditions.elementToBeClickable(finder), waitTimeout,
    `waitForClickable ${finder.locator().toString()} failed.`);
}

/**
 * Wait for a specified condition to become truthy
 * @param cond async functor that must return Promise<boolean like>
 */
export async function waitForCond(cond: () => Promise<boolean>): Promise<any> {
  const startTime = new Date().valueOf();
  while (!(await cond())) {
    if (new Date().valueOf() - startTime > waitTimeout) {
      throw new Error('Timeout waiting for condition.');
    }
    await browser.sleep(100);
  }
}

/**
 * Wait for the specified element to become invisible. Waits up to 10 seconds.
 */
export async function waitForNot(finder: ElementFinder): Promise<any> {
  return browser.wait(ExpectedConditions.invisibilityOf(finder),
    waitTimeout, `waitForNot ${finder.locator().toString()} failed.`);
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

export function getRandomEmail(): string {
  return `test-${getRandomString(20)}@madebeauty.com`;
}

export function normalizePhoneNumber(phone: string, shortForm: boolean = true): string {
  const formattedPhone = formatNumber(parseNumber(phone, 'US'), 'International');
  return shortForm && /^\+1\s/.test(formattedPhone) ?
    formattedPhone.replace(/^\+1\s/, '').replace(/\s/g, '-') :
    formattedPhone;
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

/**
 * Clear all session data. Should be combined with await browser.restart();
 */
export async function clearSessionData(): Promise<any> {
  await browser.executeScript('window.localStorage.clear();');
  await browser.executeScript('window.sessionStorage.clear();');
  await browser.driver.manage().deleteAllCookies();
}

class Globals {
  get alertSubtitle() { return $('ion-alert .alert-sub-title'); }
  alertButton(buttonText: string) { return firstVisible(by.cssContainingText('ion-alert button span', buttonText)); }

  get ionLoading() { return $('ion-loading'); }
}

export const globals = new Globals();
