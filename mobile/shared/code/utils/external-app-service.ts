import { Injectable } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

export interface ExternalAppDeepLinkConfig {
  // Will be used to identify that app exists on the device.
  iosSchema: string; // instagram://
  androidPackage: string; // com.instagram.android
  // A deep link url path, e.g. instagram://user?username=username
  appUrl: string;
  // A fallback http url path, e.g. https://www.instagram.com/username
  httpUrl: string;
}

export enum MapsApp {
  APPLE_MAPS = 'APPLE_MAPS',
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  MAPS_ME = 'MAPS_ME'
}

@Injectable()
export class ExternalAppService {

  private static openLink(link: string): void {
    if (!link.match(/^https?:\/\//i)) {
      // IF link have no http or https
      // we should add it
      // otherwise we will have a bug (white screen)
      // because if we open google.com without http/s
      link = `http://${ link }`;
    }

    window.open(link, '_system');
  }

  constructor(
    private alertCtrl: AlertController,
    private appAvailability: AppAvailability,
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
      ExternalAppService.openLink(config.httpUrl);
      return;
    }

    try {
      await this.appAvailability.check(app);
      // Open url in the app (deeplink):
      ExternalAppService.openLink(config.appUrl);
    } catch {
      // Show in browser in case of no app:
      ExternalAppService.openLink(config.httpUrl);
    }
  }

  /**
   * Simply open a browser page
   */
  openWebPage(link: string): void {
    ExternalAppService.openLink(link);
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
      // Fallback to copy:
      this.copyToTheClipboard('Email');
    }
  }

  /**
   * Make a call with phone app
   */
  doPhoneCall(phone: string): void {
    // Open phone app:
    window.open(`tel:${phone}`);
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

  /**
   * Opens an address in maps app or in browser (Google.Maps).
   * NOTE: tmp passing LaunchNavigator as a param to prevent stylist app’s builds to fail
   */
  async openAddress(launchNavigator: LaunchNavigator, address: string): Promise<void> {
    let appName;

    if (!this.platform.is('cordova')) {
      // Show an address on a google map in browser as a fallback:
      ExternalAppService.openLink(`https://maps.google.com/?q=${address}`);
      return;
    }

    // On devices:
    if (this.platform.is('ios')) {
      appName = MapsApp.APPLE_MAPS;
    } else if (this.platform.is('android')) {
      appName = MapsApp.GOOGLE_MAPS;
    }

    const options: LaunchNavigatorOptions = {
      app: launchNavigator.APP[appName]
    };

    try {
      await launchNavigator.navigate(address, options);
    } catch {
      // Fallback to copy:
      this.copyToTheClipboard('Address');
    }
  }

  /**
   * Copy some text to the device’s clipboard
   */
  copyToTheClipboard(whatCopied: string): void {
    this.clipboard.copy(whatCopied);
    const alert = this.alertCtrl.create({
      title: `${whatCopied} copied`,
      subTitle: `${whatCopied} successfully copied to the clipboard.`,
      buttons: [{ text: 'Dismiss', role: 'cancel' }]
    });
    alert.present();
  }
}
