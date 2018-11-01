import { Page } from 'ionic-angular/navigation/nav-util';

import { StylistProfileStatus } from '~/shared/stylist-api/stylist-models';
import { PageNames } from './page-names';

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
export function createNavHistoryList(profileStatus: StylistProfileStatus): PageDescr[] {
  const pages: PageDescr[] = [];

  // If we are restoring a navigation then the list should start with FirstScreen
  // so that you can navigate all way back to it.
  pages.push({ page: PageNames.FirstScreen });

  pages.push({ page: PageNames.RegisterSalon });
  if (!profileStatus) {
    // No profile at all, start from beginning.
    return pages;
  }

  if (!profileStatus.has_personal_data) {
    return pages;
  }

  pages.push({ page: PageNames.Services });
  if (!profileStatus.has_services_set) {
    return pages;
  }

  pages.push({ page: PageNames.WorkHours });
  if (!profileStatus.has_business_hours_set) {
    return pages;
  }

  pages.push({ page: PageNames.DiscountsWeekday });
  if (!profileStatus.has_weekday_discounts_set || !profileStatus.has_other_discounts_set) {
    return pages;
  }

  pages.push({ page: PageNames.Invitations });
  if (!profileStatus.has_invited_clients) {
    return pages;
  }

  // Everything is complete, go to Home screen. We are return a single page here,
  // there will be no navigation history.
  return [{ page: PageNames.Tabs }];
}

/**
 * Returns true if profile status indicates that all registation screens were
 * completed. Must match behavior of createNavHistoryList.
 */
export function isRegistrationComplete(profileStatus: StylistProfileStatus): boolean {
  return profileStatus.has_business_hours_set &&
    profileStatus.has_invited_clients &&
    profileStatus.has_other_discounts_set &&
    profileStatus.has_personal_data &&
    profileStatus.has_services_set &&
    profileStatus.has_weekday_discounts_set;
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
