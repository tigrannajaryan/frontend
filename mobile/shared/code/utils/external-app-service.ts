import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppAvailability } from '@ionic-native/app-availability';

export interface ExternalAppDeepLinkConfig {
  // Will be used to identify that app exists on the device.
  iosSchema: string; // instagram://
  androidPackage: string; // com.instagram.android
  // A deep link url path, e.g. instagram://user?username=username
  appUrl: string;
  // A fallback http url path, e.g. https://www.instagram.com/username
  httpUrl: string;
}

@Injectable()
export class ExternalAppService {
  constructor(
    private appAvailability: AppAvailability,
    private browser: InAppBrowser,
    private platform: Platform
  ) {
  }

  /**
   * Open a URL in an external application if it exists. If not, open a browser page.
   */
  async open(config: ExternalAppDeepLinkConfig): Promise<void> {
    let app: string;
    let page;

    if (this.platform.is('ios')) {
      app = config.iosSchema;
    } else if (this.platform.is('android')) {
      app = config.androidPackage;
    }

    if (!app) {
      // Just show in browser:
      page = this.browser.create(config.httpUrl);
      page.show();
      return;
    }

    try {
      await this.appAvailability.check(app);
      // Open url in the app (deeplink):
      page = this.browser.create(config.appUrl);
    } catch {
      // Show in browser in case of no app:
      page = this.browser.create(config.httpUrl);
    } finally {
      page.show();
    }
  }

  /**
   * Shortcut to open instagram app.
   */
  async openInstagram(username: string): Promise<void> {
    await this.open({
      iosSchema: 'instagram://',
      androidPackage: 'com.instagram.android',
      appUrl: `instagram://user?username=${username}`,
      httpUrl: `https://www.instagram.com/${username}`
    });
  }

  doPhoneCall(phone: string): void {
    const page = this.browser.create(`tel:${phone}`);
    page.show();
  }
}
