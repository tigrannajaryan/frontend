import { Injectable } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser';

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

  // Fixes InAppBrowser’s page creation in Android. Without these options the app craches in production.
  // See https://forum.ionicframework.com/t/inappbrowser-crash-on-android-device/82993/2 for more info.
  private pageOptionsAndroid: string[] = ['_blank', 'location=no'];

  constructor(
    private alertCtrl: AlertController,
    private appAvailability: AppAvailability,
    private browser: InAppBrowser,
    private clipboard: Clipboard,
    private emailComposer: EmailComposer,
    private platform: Platform
  ) {
  }

  /**
   * Open a URL in an external application if it exists. If not, open a browser page.
   */
  async open(config: ExternalAppDeepLinkConfig): Promise<void> {
    let app: string;

    if (this.platform.is('ios')) {
      app = config.iosSchema;
    } else if (this.platform.is('android')) {
      app = config.androidPackage;
    }

    if (!app) {
      // Just show in browser:
      this.openLink(config.httpUrl);
      return;
    }

    try {
      await this.appAvailability.check(app);
      // Open url in the app (deeplink):
      this.openLink(config.appUrl);
    } catch {
      // Show in browser in case of no app:
      this.openLink(config.httpUrl);
    }
  }

  /**
   * Simply open a browser page
   */
  openWebPage(url: string): void {
    const validLink = /^(http|\/\/)/;
    if (!validLink.test(url)) {
      url = `//${url}`;
    }
    this.openLink(url);
  }

  /**
   * Open native email app
   */
  async openMailApp(email: string): Promise<void> {
    try {
      const hasPermission = await this.emailComposer.hasPermission();
      if (!hasPermission) {
        await this.emailComposer.requestPermission();
      }
      await this.emailComposer.open({ to: email });
    } catch {
      this.clipboard.copy(email);
      const alert = this.alertCtrl.create({
        title: 'Email copied',
        subTitle: 'Email successfully copied to the clipboard.',
        buttons: [{
          text: 'Dismiss',
          role: 'cancel'
        }]
      });
      alert.present();
    }
  }

  /**
   * Make a call with phone app
   */
  doPhoneCall(phone: string): void {
    // Open phone app using a deep link:
    this.openLink(`tel:${phone}`);
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

  private openLink(link: string): void {
    const options: string[] = this.platform.is('android') ? this.pageOptionsAndroid : [];
    const page: InAppBrowserObject = this.browser.create(link, ...options);
    page.show();
  }
}
