/**
 * Define page names in one place to avoid typos if the names are used as
 * strings througout the source code. Import this file if you need to refer
 * to the page name as string (e.g. when passing to lazy loading navCtrl).
 */

// (!) please stick to alphabetical order

export enum PageNames {
  Auth = 'AuthPageComponent',
  AuthConfirm = 'AuthConfirmPageComponent',
  Services = 'ServicesPageComponent',
  ServicesCategories = 'ServicesCategoriesPageComponent',
  StylistInvitation = 'StylistInvitationPageComponent',
  Stylists = 'StylistsPageComponent'
}

export const UNAUTHORIZED_ROOT = PageNames.Auth;
export const AUTHORIZED_ROOT = PageNames.Stylists;
