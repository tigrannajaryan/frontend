import { Page } from 'ionic-angular/navigation/nav-util';

import { AboutComponent } from '~/about/about.component';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { AllClientsComponent } from '~/clients/all-clients/all-clients.component';
import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { AppointmentCheckoutComponent } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { AppointmentServicesComponent } from '~/appointment/appointment-services/appointment-services';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { CalendarExampleComponent } from '~/register-salon/calendar-example/calendar-example.component';
import { CalendarPrimingComponent } from '~/shared/components/calendar-priming/calendar-priming.component';
import { ChangeGapTimeComponent } from '~/core/popups/change-gap-time/change-gap-time.component';
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
import { HomeSlotsComponent } from '~/home-slots/home-slots.component';
import { InvitationsComponent } from '~/invitations/invitations.component';
import { MyClientsComponent } from '~/clients/my-clients/my-clients.component';
import { ProfileComponent } from '~/profile/profile.component';
import { PushPrimingScreenComponent } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { RegisterSalonComponent } from '~/register-salon/register-salon';
import { RegistrationDoneComponent } from '~/onboarding/registration-done/registration-done.component';
import { ServiceItemComponent } from '~/services/services-item/services-item.component';
import { ServicesCategoriesComponent } from '~/services/services-categories/services-categories.component';
import { ServicesComponent } from '~/services/services.component';
import { ServicesListComponent } from '~/services/services-list/services-list.component';
import { WelcomeToMadeComponent } from '~/discounts/welcome-to-made/welcome-to-made.component';
import { WorkHoursComponent } from '~/workhours/workhours.component';

// New onboarding
import { AddressInputComponent } from '~/onboarding/address-input/address-input.component';
import { ConnectInstagramComponent } from '~/onboarding/connect-instagram/connect-instagram.component';
import { NameSurnameComponent } from '~/onboarding/name-surname/name-surname.component';
import { SalonNameComponent } from '~/onboarding/salon-name/salon-name.component';
import { StylistPhotoComponent } from '~/onboarding/stylist-photo/stylist-photo.component';

/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

// tslint:disable-next-line:variable-name
export const PageNames: {[key: string]: Page} = {
  About: AboutComponent,
  AddressInput: AddressInputComponent,
  AddServicesComponent,
  AllClients: AllClientsComponent,
  AppointmentAdd: AppointmentAddComponent,
  AppointmentCheckout: AppointmentCheckoutComponent,
  AppointmentServices: AppointmentServicesComponent,
  Auth: AuthPageComponent,
  AuthConfirm: AuthConfirmPageComponent,
  CalendarExample: CalendarExampleComponent,
  CalendarPriming: CalendarPrimingComponent,
  ChangeGapTime: ChangeGapTimeComponent,
  ChangePercent: ChangePercentComponent,
  ClientDetails: ClientDetailsComponent,
  ClientsCalendar: ClientsCalendarComponent,
  ConfirmCheckoutComponent,
  ConnectInstagram: ConnectInstagramComponent,
  Discounts: DiscountsComponent,
  DiscountsAlert: DiscountsAlertComponent,
  DiscountsFirstBooking: DiscountsFirstBookingComponent,
  DiscountsRevisit: DiscountsRevisitComponent,
  DiscountsWeekday: DiscountsWeekdayComponent,
  FirstScreen: FirstScreenComponent,
  HomeSlots: HomeSlotsComponent,
  Invitations: InvitationsComponent,
  MyClients: MyClientsComponent,
  NameSurname: NameSurnameComponent,
  Profile: ProfileComponent,
  PushPrimingScreen: PushPrimingScreenComponent,
  RegisterSalon: RegisterSalonComponent,
  RegistrationDone: RegistrationDoneComponent,
  SalonName: SalonNameComponent,
  Services: ServicesComponent,
  ServicesCategories: ServicesCategoriesComponent,
  ServicesItem: ServiceItemComponent,
  ServicesList: ServicesListComponent,
  StylistPhoto: StylistPhotoComponent,
  WelcomeToMade: WelcomeToMadeComponent,
  WorkHours: WorkHoursComponent
};
