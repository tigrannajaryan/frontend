import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ErrorHandler, Injector, NgModule } from '@angular/core';
import { META_REDUCERS, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicApp, IonicModule } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AppVersion } from '@ionic-native/app-version';
import { StatusBar } from '@ionic-native/status-bar';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppAvailability } from '@ionic-native/app-availability';
import { Contacts } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SMS } from '@ionic-native/sms';
import { Camera } from '@ionic-native/camera';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { Push } from '@ionic-native/push';
import { DatePicker } from '@ionic-native/date-picker';
import { GooglePlus } from '@ionic-native/google-plus';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { GalleryModalHammerConfig, GalleryModalModule } from 'ionic-gallery-modal';

import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { initSentry } from '~/shared/sentry';
import { Logger } from '~/shared/logger';
import { SharedSingletonsModule } from '~/shared/shared-singletons.module';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { AuthInterceptor } from './shared/api/auth.interceptor';
import { AuthService } from '~/shared/api/auth.api';
import { PushNotification } from '~/shared/push/push-notification';
import { SuccessErrorPopupComponent } from '~/shared/components/success-error-popup/success-error-popup.component';
import { GoogleSignin } from './shared/google-signin';
import { IntegrationsApi } from './shared/api/integrations.api';
import { MadeAnalyticsApi } from './shared/api/made-analytics.api';
import { InstagramOAuthService } from '~/shared/utils/instagram-oauth-service';

import { ENV } from '~/environments/environment.default';

import { MyAppComponent } from './app.component';
import { getMetaReducers } from './app.reducers';

import { DataModule } from '~/core/data.module';

import { AuthProcessState } from '~/shared/storage/auth-process-state';
import { HomeService } from '~/core/api/home.service';
import { WorktimeApi } from '~/core/api/worktime.api';
import { InvitationsApi } from '~/core/api/invitations.api';
import { ClientDetailsApi } from '~/core/api/client-details.api';

import { CoreModule } from '~/core/core.module';
import { GoogleMapsConfig } from '~/shared/google-maps-config';
import { profileReducer, profileStatePath } from '~/core/components/made-menu-header/profile.reducer';
import { ProfileEffects } from '~/core/components/made-menu-header/profile.effects';
import { StylistAppStorage } from './core/stylist-app-storage';

import { UiKitPreviewComponent } from '~/ui-kit-preview/ui-kit-preview.component';
import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { ServicesEffects } from '~/appointment/appointment-services/services.effects';
import { NotificationsApi } from './shared/push/notifications.api';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';
import { CalendarPickerComponent } from '~/shared/components/calendar-picker/calendar-picker.component';

import { AboutComponent } from '~/about/about.component';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { AllClientsComponent } from '~/clients/all-clients/all-clients.component';
import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { AppointmentCheckoutComponent } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { AppointmentPriceComponent } from '~/appointment/appointment-price/appointment-price.component';
import { AppointmentServicesComponent } from '~/appointment/appointment-services/appointment-services';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
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
import { RegistrationDoneComponent } from '~/onboarding/registration-done/registration-done.component';
import { ServiceItemComponent } from '~/services/services-item/services-item.component';
import { ServicesCategoriesComponent } from '~/services/services-categories/services-categories.component';
import { ServicesComponent } from '~/services/services.component';
import { ServicesListComponent } from '~/services/services-list/services-list.component';
import { UpcomingAndPastComponent } from '~/home/home.component';
import { WorkHoursComponent } from '~/workhours/workhours.component';

// Onboarding
import { CalendarExampleComponent } from '~/onboarding/calendar-example/calendar-example.component';
import { ConnectInstagramComponent } from '~/onboarding/connect-instagram/connect-instagram.component';
import { FieldEditComponent } from '~/onboarding/field-edit/field-edit.component';
import { SalonAddressComponent } from '~/onboarding/salon-address/salon-address.component';
import { StylistPhotoComponent } from '~/onboarding/stylist-photo/stylist-photo.component';
import { WelcomeToMadeComponent } from '~/onboarding/welcome-to-made/welcome-to-made.component';
import { SettingsComponent } from '~/settings/settings.component';
import { SettingsFieldComponent } from '~/settings/settings-field/settings-field.component';

initSentry();

const imports = [
  AgmCoreModule.forRoot(),
  BrowserModule,
  HttpClientModule,
  CoreModule,
  SharedSingletonsModule,

  /**
   * StoreModule.forRoot is imported once in the root module, accepting a reducer
   * function or object map of reducer functions. If passed an object of
   * reducers, combineReducers will be run creating your application
   * meta-reducer. This returns all providers for an @ngrx/store
   * based application.
   */
  StoreModule.forRoot({}),

  /**
   * EffectsModule.forRoot() is imported once in the root module and
   * sets up the effects class to be initialized immediately when the
   * application starts.
   *
   * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
   */
  EffectsModule.forRoot([])
];

if (!ENV.production) {
  imports.push(
    StoreDevtoolsModule.instrument({
      logOnly: ENV.production
    })
  );
}

const declarations = [
  // Pages
  AboutComponent,
  AddServicesComponent,
  AllClientsComponent,
  AppointmentAddComponent,
  AppointmentCheckoutComponent,
  AppointmentPriceComponent,
  AppointmentServicesComponent,
  AuthConfirmPageComponent,
  AuthPageComponent,
  CalendarPrimingComponent,
  ChangeGapTimeComponent,
  ChangePercentComponent,
  ClientDetailsComponent,
  ClientsCalendarComponent,
  ConfirmCheckoutComponent,
  DiscountsAlertComponent,
  DiscountsComponent,
  DiscountsFirstBookingComponent,
  DiscountsRevisitComponent,
  DiscountsWeekdayComponent,
  FirstScreenComponent,
  HomeSlotsComponent,
  InvitationsComponent,
  SettingsFieldComponent,
  MyClientsComponent,
  ProfileComponent,
  PushPrimingScreenComponent,
  RegistrationDoneComponent,
  ServiceItemComponent,
  ServicesCategoriesComponent,
  ServicesComponent,
  ServicesListComponent,
  SettingsComponent,
  UpcomingAndPastComponent,
  WorkHoursComponent,

  // Onboarding
  CalendarExampleComponent,
  ConnectInstagramComponent,
  FieldEditComponent,
  SalonAddressComponent,
  StylistPhotoComponent,
  WelcomeToMadeComponent,

  // Components
  CalendarPickerComponent,
  MadeMenuComponent,
  MyAppComponent,
  SuccessErrorPopupComponent,
  UiKitPreviewComponent
];

@NgModule({
  declarations,

  imports: [
    IonicModule.forRoot(MyAppComponent, {
      backButtonText: '',
      backButtonIcon: 'md-arrow-back',
      tabsHideOnSubPages: true
    }),

    DataModule.forRoot(),

    // User header reducer and effects
    StoreModule.forFeature(profileStatePath, profileReducer),
    EffectsModule.forFeature([ProfileEffects]),

    // For appointment screens
    StoreModule.forFeature('service', servicesReducer),
    EffectsModule.forFeature([ServicesEffects]),

    GalleryModalModule,

    ...imports
  ],

  bootstrap: [IonicApp],

  entryComponents: declarations,
  providers: [
    StatusBar,
    SplashScreen,
    AuthService,
    AppVersion,
    StylistAppStorage,
    ScreenOrientation,
    InAppBrowser,
    AppAvailability,
    Clipboard,
    EmailComposer,

    GooglePlus,
    GoogleSignin,

    InstagramOAuthService,

    Push,
    PushNotification,

    LaunchNavigator,

    { // Add auth token to all requests
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor, multi: true
    },

    {
      // Our custom handler for unhandled exceptions
      provide: ErrorHandler,
      useClass: UnhandledErrorHandler
    },

    {
      // This allows us to inject Logger into getMetaReducers()
      provide: META_REDUCERS,
      deps: [Logger],
      useFactory: getMetaReducers
    },

    {
      // Override google maps config
      provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsConfig
    },

    {
      // https://www.npmjs.com/package/ionic-gallery-modal
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GalleryModalHammerConfig
    },

    // Providers for pages
    AuthProcessState,
    HomeService,
    WorktimeApi,
    InvitationsApi,
    ClientDetailsApi,
    NotificationsApi,
    IntegrationsApi,
    MadeAnalyticsApi,

    ExternalAppService,

    Contacts,
    OpenNativeSettings,
    SMS,
    Camera,
    DatePicker
  ]
})
export class AppModule {
  /**
   * Allows for retrieving singletons using `AppModule.injector.get(MyService)`
   * This is good to prevent injecting the service as constructor parameter.
   */
  static injector: Injector;

  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}
