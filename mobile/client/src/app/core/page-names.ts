/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

export enum PageNames {
  Appointment = 'AppointmentPageComponent',
  AppointmentsHistory = 'AppointmentsHistoryComponent',
  Auth = 'AuthPageComponent',
  AuthConfirm = 'AuthConfirmPageComponent',
  Home = 'HomePageComponent',
  HowMadeWorks = 'HowMadeWorksComponent',
  HowPricingWorks = 'HowPricingWorksComponent',
  ProfileEdit = 'ProfileEditComponent',
  ProfileSummary = 'ProfileSummaryComponent',
  SelectDate = 'SelectDateComponent',
  Services = 'ServicesPageComponent',
  ServicesCategories = 'ServicesCategoriesPageComponent',
  StylistInvitation = 'StylistInvitationPageComponent',
  Stylists = 'StylistsPageComponent',
  MainTabs = 'MainTabsComponent'
}

export const UNAUTHORIZED_ROOT = PageNames.Auth;
export const AUTHORIZED_ROOT = PageNames.MainTabs;
