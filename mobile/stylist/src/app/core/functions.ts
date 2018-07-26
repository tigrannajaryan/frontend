import { ProfileStatus } from './auth-api-service/auth-api-service';
import { PageNames } from './page-names';
import { ENV } from '../../environments/environment.default';

export interface PageDescr {
  page: PageNames;
  params?: any;
}

/**
 * Determines what page to show after auth based on the completeness
 * of the profile of the user. Also calculates the natural navigation
 * history for that page and returns the full list of pages that should
 * be set as navigation history. The last item in this list is the page
 * to show.
 * @param profileStatus as returned by auth.
 */
export function createNavHistoryList(profileStatus: ProfileStatus): PageDescr[] {
  const pages: PageDescr[] = [];

  pages.push({ page: PageNames.RegisterSalon });
  if (!profileStatus) {
    // No profile at all, start from beginning.
    return pages;
  }

  if (!profileStatus.has_personal_data) {
    return pages;
  }

  pages.push({ page: PageNames.RegisterServices });
  if (!profileStatus.has_services_set) {
    return pages;
  }

  pages.push({ page: PageNames.Worktime });
  if (!profileStatus.has_business_hours_set) {
    return pages;
  }

  pages.push({ page: PageNames.Discounts });
  if (!profileStatus.has_weekday_discounts_set && !profileStatus.has_other_discounts_set) {
    return pages;
  }

  if (ENV.ffEnableIncomplete) {
    pages.push({ page: PageNames.Invitations });
    if (!profileStatus.has_invited_clients) {
      return pages;
    }
  }

  // Everything is complete, go to Home screen. We are return a single page here,
  // there will be no navigation history.
  return [{ page: PageNames.Tabs }];
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
