import { Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppAvailability } from '@ionic-native/app-availability';

import { AppModule } from '~/app.module';

export interface ExternalAppDeepLinkConfig {
  // Will be used to identify that app exists on the device.
  iosSchema: string; // instagram://
  androidPackage: string; // com.instagram.android
  // A deep link url path, e.g. instagram://user?username=username
  appUrl: string;
  // A fallback http url path, e.g. https://www.instagram.com/username
  httpUrl: string;
}

/**
 * Open a URL in an external application if it exists. If not, open a browser page.
 */
export async function openExternalApp(config: ExternalAppDeepLinkConfig): Promise<void> {
  const appAvailability = AppModule.injector.get(AppAvailability);
  const browser = AppModule.injector.get(InAppBrowser);
  const platform = AppModule.injector.get(Platform);

  let app: string;
  let page;

  if (platform.is('ios')) {
    app = config.iosSchema;
  } else if (platform.is('android')) {
    app = config.androidPackage;
  }

  if (!app) {
    // Just show in browser:
    page = browser.create(config.httpUrl);
    page.show();
    return;
  }

  try {
    await appAvailability.check(app);
    // Open url in the app (deeplink):
    page = browser.create(config.appUrl);
  } catch {
    // Show in browser in case of no app:
    page = browser.create(config.httpUrl);
  } finally {
    page.show();
  }
}

/**
 * Shortcut to open instagram app.
 */
export function openInstagram(username: string): Promise<void> {
  return openExternalApp({
    iosSchema: 'instagram://',
    androidPackage: 'com.instagram.android',
    appUrl: `instagram://user?username=${username}`,
    httpUrl: `https://www.instagram.com/${username}`
  });
}
