import { AboutComponent } from '~/about/about.component';
import { AppointmentPageComponent } from '~/appointment-page/appointment-page.component';
import { AppointmentsHistoryComponent } from '~/appointments-history/appointments-history.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { BookingCompleteComponent } from '~/booking/booking-complete/booking-complete.component';
import { FirstScreenComponent } from '~/first-screen/first-screen.component';
import { HomePageComponent } from '~/home-page/home-page.component';
import { HowMadeWorksComponent } from '~/onboarding/how-made-works/how-made-works.component';
import { HowPricingWorksComponent } from '~/onboarding/how-pricing-works/how-pricing-works.component';
import { MainTabsComponent } from '~/main-tabs/main-tabs.component';
import { ProfileEditComponent } from '~/profile/profile-edit/profile-edit.component';
import { ProfileSummaryComponent } from '~/profile/profile-summary/profile-summary.component';
import { SelectDateComponent } from '~/booking/select-date/select-date.component';
import { SelectStylistComponent } from '~/stylists/select-stylist/select-stylist.component';
import { SelectTimeComponent } from '~/booking/select-time/select-time.component';
import { ServicesPageComponent } from '~/services-page/services-page.component';
import { ServicesCategoriesPageComponent } from '~/services-categories-page/services-categories-page.component';
import { MyStylistsComponent } from '~/stylists/my-stylists.component';
import { StylistsPageComponent } from '~/stylists/stylists-search/stylists-search.component';
import { PrivacySettingsComponent } from '~/privacy-settings/privacy-settings.component';
import { FollowersComponent } from '~/followers/followers.component';
import { StylistComponent } from '~/stylists/stylist/stylist.component';

/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

// tslint:disable-next-line:variable-name
export const PageNames = {
  About: AboutComponent,
  Appointment: AppointmentPageComponent,
  AppointmentsHistory: AppointmentsHistoryComponent,
  Auth: AuthPageComponent,
  AuthConfirm: AuthConfirmPageComponent,
  BookingComplete: BookingCompleteComponent,
  FirstScreen: FirstScreenComponent,
  Followers: FollowersComponent,
  Home: HomePageComponent,
  HowMadeWorks: HowMadeWorksComponent,
  HowPricingWorks: HowPricingWorksComponent,
  MainTabs: MainTabsComponent,
  MyStylist: MyStylistsComponent,
  Privacy: PrivacySettingsComponent,
  ProfileEdit: ProfileEditComponent,
  ProfileSummary: ProfileSummaryComponent,
  SelectDate: SelectDateComponent,
  SelectStylist: SelectStylistComponent,
  SelectTime: SelectTimeComponent,
  Services: ServicesPageComponent,
  ServicesCategories: ServicesCategoriesPageComponent,
  Stylist: StylistComponent,
  Stylists: StylistsPageComponent
};

export const UNAUTHORIZED_ROOT = PageNames.Auth;
export const AUTHORIZED_ROOT = PageNames.MainTabs;
