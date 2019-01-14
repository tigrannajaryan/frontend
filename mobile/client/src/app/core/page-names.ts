import { AboutComponent } from '~/about/about.component';
import { AddServicesComponent } from '~/add-services/add-services.component';
import { AppointmentPageComponent } from '~/appointment-page/appointment-page.component';
import { AppointmentPriceComponent } from '~/appointment-price/appointment-price.component';
import { AppointmentsHistoryComponent } from '~/appointments-history/appointments-history.component';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { BookingCompleteComponent } from '~/booking/booking-complete/booking-complete.component';
import { CalendarPrimingComponent } from '~/shared/components/calendar-priming/calendar-priming.component';
import { ConfirmCheckoutComponent } from '~/confirm-checkout/confirm-checkout.component';
import { FirstLastNameComponent } from '~/profile/first-last-name/first-last-name.component';
import { FirstScreenComponent } from '~/first-screen/first-screen.component';
import { FollowersComponent } from '~/followers/followers.component';
import { HomePageComponent } from '~/home-page/home-page.component';
import { HowMadeWorksComponent } from '~/onboarding/how-made-works/how-made-works.component';
import { HowPricingWorksComponent } from '~/onboarding/how-pricing-works/how-pricing-works.component';
import { MainTabsComponent } from '~/main-tabs/main-tabs.component';
import { MyStylistsComponent } from '~/stylists/my-stylists.component';
import { PrivacySettingsComponent } from '~/privacy-settings/privacy-settings.component';
import { ProfileEditComponent } from '~/profile/profile-edit/profile-edit.component';
import { ProfileSummaryComponent } from '~/profile/profile-summary/profile-summary.component';
import { PushPrimingScreenComponent } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { SelectDateComponent } from '~/booking/select-date/select-date.component';
import { SelectStylistComponent } from '~/stylists/select-stylist/select-stylist.component';
import { SelectTimeComponent } from '~/booking/select-time/select-time.component';
import { ServicesCategoriesPageComponent } from '~/services-categories-page/services-categories-page.component';
import { ServicesPageComponent } from '~/services-page/services-page.component';
import { StylistComponent } from '~/stylists/stylist/stylist.component';
import { StylistProfileComponent } from '~/stylists/stylist-profile/stylist-profile.component';
import { StylistSearchComponent } from '~/stylists/stylists-search/stylists-search.component';
import { InvitationsComponent } from '~/invitations/invitations.component';

/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

// tslint:disable-next-line:variable-name
export const PageNames = {
  About: AboutComponent,
  AddServices: AddServicesComponent,
  Appointment: AppointmentPageComponent,
  AppointmentPrice: AppointmentPriceComponent,
  AppointmentsHistory: AppointmentsHistoryComponent,
  Auth: AuthPageComponent,
  AuthConfirm: AuthConfirmPageComponent,
  BookingComplete: BookingCompleteComponent,
  CalendarPriming: CalendarPrimingComponent,
  ConfirmCheckout: ConfirmCheckoutComponent,
  FirstLastName: FirstLastNameComponent,
  FirstScreen: FirstScreenComponent,
  Followers: FollowersComponent,
  Home: HomePageComponent,
  HowMadeWorks: HowMadeWorksComponent,
  HowPricingWorks: HowPricingWorksComponent,
  MainTabs: MainTabsComponent,
  MyStylists: MyStylistsComponent,
  Invitations: InvitationsComponent,
  Privacy: PrivacySettingsComponent,
  ProfileEdit: ProfileEditComponent,
  ProfileSummary: ProfileSummaryComponent,
  PushPrimingScreen: PushPrimingScreenComponent,
  SelectDate: SelectDateComponent,
  SelectStylist: SelectStylistComponent,
  SelectTime: SelectTimeComponent,
  Services: ServicesPageComponent,
  ServicesCategories: ServicesCategoriesPageComponent,
  StylistInvitation: StylistComponent,
  StylistProfile: StylistProfileComponent,
  StylistSearch: StylistSearchComponent
};

export const UNAUTHORIZED_ROOT = PageNames.Auth;
