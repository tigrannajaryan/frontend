import { AboutComponent } from '~/about/about.component';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { AllClientsComponent } from '~/clients/all-clients/all-clients.component';
import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { AppointmentCheckoutComponent } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { AppointmentServicesComponent } from '~/appointment/appointment-services/appointment-services';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { CalendarExampleComponent } from '~/register-salon/calendar-example/calendar-example.component';
import { ChangePercentComponent } from '~/core/popups/change-percent/change-percent.component';
import { ClientDetailsComponent } from '~/clients/client-details/client-details.component';
import { ClientsCalendarComponent } from '~/calendar/clients-calendar/clients-calendar.component';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { DiscountsAlertComponent } from '~/discounts/discounts-alert/discounts-alert.component';
import { DiscountsComponent } from '~/discounts/discounts.component';
import { DiscountsFirstBookingComponent } from '~/discounts/discounts-first-booking/discounts-first-booking.component';
import { DiscountsRevisitComponent } from '~/discounts/discounts-revisit/discounts-revisit.component';
import { DiscountsWeekdayComponent } from '~/discounts/discounts-weekday/discounts-weekday.component';
import { FirstScreenComponent } from '~/first-screen/first-screen';
import { HomeComponent } from '~/home/home.component';
import { InvitationsComponent } from '~/invitations/invitations.component';
import { MyClientsComponent } from '~/clients/my-clients/my-clients.component';
import { PushPrimingScreenComponent } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { RegisterSalonComponent } from '~/register-salon/register-salon';
import { ServiceItemComponent } from '~/services/services-item/services-item.component';
import { ServicesCategoriesComponent } from '~/services/services-categories/services-categories.component';
import { ServicesComponent } from '~/services/services.component';
import { ServicesListComponent } from '~/services/services-list/services-list.component';
import { TabsComponent } from '~/tabs/tabs.component';
import { WelcomeToMadeComponent } from '~/discounts/welcome-to-made/welcome-to-made.component';
import { WorkHoursComponent } from '~/workhours/workhours.component';

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
  AllClients: AllClientsComponent,
  AppointmentAdd: AppointmentAddComponent,
  AppointmentCheckout: AppointmentCheckoutComponent,
  AppointmentServices: AppointmentServicesComponent,
  Auth: AuthPageComponent,
  AuthConfirm: AuthConfirmPageComponent,
  CalendarExample: CalendarExampleComponent,
  ChangePercent: ChangePercentComponent,
  ClientDetails: ClientDetailsComponent,
  ClientsCalendar: ClientsCalendarComponent,
  ConfirmCheckoutComponent,
  Discounts: DiscountsComponent,
  DiscountsAlert: DiscountsAlertComponent,
  DiscountsFirstBooking: DiscountsFirstBookingComponent,
  DiscountsRevisit: DiscountsRevisitComponent,
  DiscountsWeekday: DiscountsWeekdayComponent,
  FirstScreen: FirstScreenComponent,
  Home: HomeComponent,
  Invitations: InvitationsComponent,
  MyClients: MyClientsComponent,
  PushPrimingScreen: PushPrimingScreenComponent,
  RegisterSalon: RegisterSalonComponent,
  Services: ServicesComponent,
  ServicesCategories: ServicesCategoriesComponent,
  ServicesItem: ServiceItemComponent,
  ServicesList: ServicesListComponent,
  Tabs: TabsComponent,
  WelcomeToMade: WelcomeToMadeComponent,
  WorkHours: WorkHoursComponent
};
