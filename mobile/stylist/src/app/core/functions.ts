import { Page } from 'ionic-angular/navigation/nav-util';
import { App } from 'ionic-angular';

import { UserRole } from '~/shared/api/auth.models';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { PushPrimingScreenParams } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { PushNotification } from '~/shared/push/push-notification';

import { AppModule } from '~/app.module';
import { PageNames } from '~/core/page-names';

export interface PageDescr {
  page: Page;
  params?: any;
}

/**
 * Determines what page to show after auth based on the completeness
 * of the profile of the user. Also calculates the natural navigation
 * history for that page and returns the full list of pages that should
 * be set as navigation history. The last item in this list is the page
 * to show.
 * Must match behavior of isRegistrationComplete.
 * @param profileStatus as returned by auth.
 */
export async function createNavHistoryList(profileStatus: StylistProfileStatus): Promise<PageDescr[]> {
  const pages: PageDescr[] = [];

  // If we are restoring a navigation then the list should start with FirstScreen
  // so that you can navigate all way back to it.
  pages.push({ page: PageNames.FirstScreen });

  pages.push({ page: PageNames.NameSurname });

  if (!profileStatus) {
    // No profile at all, start from beginning.
    return pages;
  }

  if (!profileStatus.has_personal_data) {
    return pages;
  }

  return [
    await nextToShowForCompleteProfile()
  ];
}

export async function nextToShowForCompleteProfile(): Promise<PageDescr> {
  const pushNotification = AppModule.injector.get(PushNotification);

  // The only remaining optional screen is push priming screen. Check if need to show it.
  if (await pushNotification.needToShowPermissionScreen()) {
    // Yes, we need to show it. Do it.

    const pushParams: PushPrimingScreenParams = {
      appType: UserRole.stylist,
      // Show next appropriate screen after PushPrimingScreen
      onContinue: async () => {
        const app = AppModule.injector.get(App);
        app.getRootNav().setRoot(PageNames.HomeSlots);
      }
    };
    return { page: PageNames.PushPrimingScreen, params: { params: pushParams } };
  }

  // Show home screen
  return { page: PageNames.HomeSlots };
}

/**
 * Returns true if profile status indicates that all registation screens were
 * completed. Must match behavior of createNavHistoryList.
 */
export function isRegistrationComplete(profileStatus: StylistProfileStatus): boolean {
  return profileStatus.has_personal_data;
}

export function trimStr(s?: string): string {
  if (s) {
    return s.trim();
  }
  return s;
}

/**
 * Perform one-level deep comparison of arrays
 */
export function arrayEqual(a1: any[], a2: any[]): boolean {
  if (a1.length !== a2.length) {
    return false;
  }

  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}
