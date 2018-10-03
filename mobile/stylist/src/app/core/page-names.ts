import { AboutComponent } from '~/about/about.component';
import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { AppointmentCheckoutComponent } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { AppointmentServicesComponent } from '~/appointment/appointment-services/appointment-services';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { ChangePercentComponent } from '~/core/popups/change-percent/change-percent.component';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { DiscountsComponent } from '~/discounts/discounts.component';
import { DiscountsAlertComponent } from '~/discounts/discounts-alert/discounts-alert.component';
import { DiscountsFirstBookingComponent } from '~/discounts/discounts-first-booking/discounts-first-booking.component';
import { DiscountsRevisitComponent } from '~/discounts/discounts-revisit/discounts-revisit.component';
import { DiscountsWeekdayComponent } from '~/discounts/discounts-weekday/discounts-weekday.component';
import { HomeComponent } from '~/home/home.component';
import { FirstScreenComponent } from '~/first-screen/first-screen';
import { HowPricingWorksComponent } from '~/discounts/discounts-welcome/how-pricing-works.component';
import { InvitationsComponent } from '~/invitations/invitations.component';
import { RegisterSalonComponent } from '~/register-salon/register-salon';
import { ServicesComponent } from '~/services/services.component';
import { ServicesCategoriesComponent } from '~/services/services-categories/services-categories.component';
import { ServicesListComponent } from '~/services/services-list/services-list.component';
import { ServiceItemComponent } from '~/services/services-item/services-item.component';
import { TabsComponent } from '~/tabs/tabs.component';
import { WelcomeToMadeComponent } from '~/discounts/welcome-to-made/welcome-to-made.component';
import { WorktimeComponent } from '~/worktime/worktime.component';
import { CalendarExampleComponent } from '~/register-salon/calendar-example/calendar-example.component';

/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

// tslint:disable-next-line:variable-name
export const PageNames = {
  About: AboutComponent,
  AddServicesComponent,
  AppointmentAdd: AppointmentAddComponent,
  AppointmentCheckout: AppointmentCheckoutComponent,
  AppointmentServices: AppointmentServicesComponent,
  Auth: AuthPageComponent,
  AuthConfirm: AuthConfirmPageComponent,
  CalendarExample: CalendarExampleComponent,
  ChangePercent: ChangePercentComponent,
  ConfirmCheckoutComponent,
  Discounts: DiscountsComponent,
  DiscountsAlert: DiscountsAlertComponent,
  DiscountsFirstBooking: DiscountsFirstBookingComponent,
  DiscountsRevisit: DiscountsRevisitComponent,
  DiscountsWeekday: DiscountsWeekdayComponent,
  FirstScreen: FirstScreenComponent,
  Home: HomeComponent,
  HowPricingWorks: HowPricingWorksComponent,
  Invitations: InvitationsComponent,
  RegisterSalon: RegisterSalonComponent,
  Services: ServicesComponent,
  ServicesCategories: ServicesCategoriesComponent,
  ServicesItem: ServiceItemComponent,
  ServicesList: ServicesListComponent,
  Tabs: TabsComponent,
  WelcomeToMade: WelcomeToMadeComponent,
  Worktime: WorktimeComponent
};
