/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

export enum PageNames {
  About = 'AboutComponent',
  AddServicesComponent = 'AddServicesComponent',
  AppointmentAdd = 'AppointmentAddComponent',
  AppointmentService = 'AppointmentServicesComponent',
  AppointmentDate = 'AppointmentDateComponent',
  AppointmentCheckout = 'AppointmentCheckoutComponent',
  ChangePercent = 'ChangePercentComponent',
  ConfirmCheckoutComponent = 'ConfirmCheckoutComponent',
  Discounts = 'DiscountsComponent',
  DiscountsAlert = 'DiscountsAlertComponent',
  DiscountsChange = 'DiscountsChangeComponent',
  FirstScreen = 'FirstScreenComponent',
  Invitations = 'InvitationsComponent',
  Login = 'LoginComponent',
  LoginRegister = 'LoginRegisterComponent',
  Profile = 'ProfileComponent',
  RegisterByEmail = 'RegisterByEmailComponent',
  RegisterSalon = 'RegisterSalonComponent',
  RegisterServices = 'ServicesComponent',
  RegisterServicesItem = 'ServicesListComponent',
  RegisterServicesItemAdd = 'ServiceItemComponent',
  Today = 'TodayComponent',
  Worktime = 'WorktimeComponent',
  UpcomingHistory = 'UpcomingHistoryComponent'
}
