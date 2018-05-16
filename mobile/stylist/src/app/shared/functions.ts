import { ProfileStatus } from './auth-api-service/auth-api-service';
import { PageNames } from './page-names';

/**
 * Determines what page to show after auth based on the completeness
 * of the profile of the user.
 * @param profileStatus as returned by auth.
 */
export function profileStatusToPage(profileStatus: ProfileStatus): string {
  /**
   * with this approach (PageNames.Today) we have = 'TodayComponent'
   * if TodayComponent wrapped with quotes then its lazy loadint and we need to add module for this component
   * otherwise we will get an error
   */
  if (!profileStatus) {
    // No profile at all, start from beginning.
    return PageNames.RegisterSalon;
  }
  if (!profileStatus.has_personal_data || !profileStatus.has_picture_set) {
    return PageNames.RegisterSalon;
  }
  if (!profileStatus.has_services_set) {
    return PageNames.RegisterServices;
  }
  if (!profileStatus.has_business_hours_set) {
    return PageNames.Worktime;
  }
  if (!profileStatus.has_weekday_discounts_set || !profileStatus.has_other_discounts_set) {
    return PageNames.Discounts;
  }

  // TODO: check the remaining has_ flags and return the appropriate
  // page name once the pages are implemented.

  // Everything is complete, go to Today screen.
  return PageNames.Today;

}
