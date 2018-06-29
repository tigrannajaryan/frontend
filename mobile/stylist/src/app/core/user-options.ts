import { Injectable } from '@angular/core';

/**
 * The list of user options. Add any property below that you
 * want to be able to store in persistent storage and access
 * via UserOptions class.
 */
interface Options {
  showTodayScreenHelp: boolean;
  showFutureAppointmentHelp: boolean;
}

const storageKey = 'user-options';

/**
 * Locally stored set of user options
 */
@Injectable()
export class UserOptions {
  private options: Options;

  constructor() {
    try {
      this.options = JSON.parse(window.localStorage.getItem(storageKey));
    } catch (e) {
      // Ignore read errors. We will re-initialize below.
    }

    if (!this.options) {
      // If no storage is found initialize to most sensible defaults.
      // Note: most sensible here does not mean what a new app state
      // should be but instead what a normally used app would need.
      // This would ensure that if the storage is deleted the app
      // will behave in the most common way.
      this.options = {
        showTodayScreenHelp: false,
        showFutureAppointmentHelp: false
      };
    }
  }

  /**
   * Get the value of an option
   * @param key a string name equal to one of properties of Options
   */
  get<K extends keyof Options>(key: K): Options[K] {
    return this.options[key];
  }

  /**
   * Set the value of an option and saved in persistent storage
   * @param key a string name equal to one of properties of Options
   * @param value the value of option. The type of this value is as declared in Options
   */
  set<K extends keyof Options>(key: K, value: Options[K]): void {
    this.options[key] = value;
    window.localStorage.setItem(storageKey, JSON.stringify(this.options));
  }
}
