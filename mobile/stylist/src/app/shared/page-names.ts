/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

export enum PageNames {
    FirstScreen = 'FirstScreenComponent',
    Login = 'LoginComponent',
    RegisterByEmail = 'RegisterByEmailComponent',
    RegisterSalon = 'RegisterSalonComponent',
    RegisterServices = 'ServicesComponent',
    RegisterServicesItem = 'ServicesListComponent',
    RegisterServicesItemAdd = 'ServiceItemComponent',
    Worktime = 'WorktimeComponent',
    Today = 'TodayComponent',
    Discounts = 'DiscountsComponent',
    DiscountsAlert = 'DiscountsAlertComponent',
    ChangePercent = 'ChangePercentComponent'
}
