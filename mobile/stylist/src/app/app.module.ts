import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrowserModule } from '@angular/platform-browser';
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

import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { initSentry } from '~/shared/sentry';
import { Logger } from '~/shared/logger';
import { SharedSingletonsModule } from '~/shared/shared-singletons.module';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { AuthInterceptor } from './shared/api/auth.interceptor';
import { AuthService } from '~/shared/api/auth.api';
import { authPath, authReducer } from '~/shared/storage/auth.reducer';
import { AuthEffects } from '~/shared/storage/auth.effects';
import { MyAppComponent } from './app.component';
import { getMetaReducers } from './app.reducers';
import { ENV } from '~/environments/environment.default';

import { DataModule } from '~/core/data.module';

import { AuthProcessState } from '~/shared/storage/auth-process-state';
import { HomeService } from '~/core/api/home.service';
import { WorktimeApi } from '~/core/api/worktime.api';
import { InvitationsApi } from '~/core/api/invitations.api';
import { ClientDetailsApi } from '~/core/api/client-details.api';

import { PushNotification } from '~/shared/push/push-notification';
import { PushPrimingScreenComponent } from './shared/components/push-priming-screen/push-priming-screen.component';

import { CoreModule } from '~/core/core.module';
import { GoogleMapsConfig } from '~/core/google-maps-config';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { ChangePercentComponent } from '~/core/popups/change-percent/change-percent.component';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { profileReducer, profileStatePath } from '~/core/components/made-menu-header/profile.reducer';
import { ProfileEffects } from '~/core/components/made-menu-header/profile.effects';
import { StylistAppStorage } from './core/stylist-app-storage';

import { AboutComponent } from '~/about/about.component';
import { AllClientsComponent } from '~/clients/all-clients/all-clients.component';
import { AppointmentAddComponent } from '~/appointment/appointment-add/appointment-add';
import { AppointmentCheckoutComponent } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { AppointmentServicesComponent } from '~/appointment/appointment-services/appointment-services';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { CalendarExampleComponent } from '~/register-salon/calendar-example/calendar-example.component';
import { ClientsCalendarComponent } from '~/calendar/clients-calendar/clients-calendar.component';
import { DiscountsComponent } from '~/discounts/discounts.component';
import { DiscountsAlertComponent } from '~/discounts/discounts-alert/discounts-alert.component';
import { DiscountsFirstBookingComponent } from '~/discounts/discounts-first-booking/discounts-first-booking.component';
import { DiscountsRevisitComponent } from '~/discounts/discounts-revisit/discounts-revisit.component';
import { DiscountsWeekdayComponent } from '~/discounts/discounts-weekday/discounts-weekday.component';
import { HomeComponent } from '~/home/home.component';
import { FirstScreenComponent } from '~/first-screen/first-screen';
import { InvitationsComponent } from '~/invitations/invitations.component';
import { MyClientsComponent } from '~/clients/my-clients/my-clients.component';
import { ClientDetailsComponent } from '~/clients/client-details/client-details.component';
import { RegisterSalonComponent } from '~/register-salon/register-salon';
import { ServicesComponent } from '~/services/services.component';
import { ServicesCategoriesComponent } from '~/services/services-categories/services-categories.component';
import { ServicesListComponent } from '~/services/services-list/services-list.component';
import { ServiceItemComponent } from '~/services/services-item/services-item.component';
import { WelcomeToMadeComponent } from '~/discounts/welcome-to-made/welcome-to-made.component';
import { UiKitPreviewComponent } from '~/ui-kit-preview/ui-kit-preview.component';
import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { ServicesEffects } from '~/appointment/appointment-services/services.effects';
import { WorkHoursComponent } from '~/workhours/workhours.component';
import { NotificationsApi } from './shared/push/notifications.api';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';

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
  StoreModule.forFeature(authPath, authReducer),

  /**
   * EffectsModule.forRoot() is imported once in the root module and
   * sets up the effects class to be initialized immediately when the
   * application starts.
   *
   * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
   */
  EffectsModule.forRoot([
    AuthEffects
  ])
];

if (!ENV.production) {
  imports.push(
    StoreDevtoolsModule.instrument({
      logOnly: ENV.production
    })
  );
}

const declarations = [
  AboutComponent,
  AddServicesComponent,
  AllClientsComponent,
  AppointmentAddComponent,
  AppointmentCheckoutComponent,
  AppointmentServicesComponent,
  AuthConfirmPageComponent,
  AuthPageComponent,
  CalendarExampleComponent,
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
  HomeComponent,
  InvitationsComponent,
  MadeMenuComponent,
  MyAppComponent,
  MyClientsComponent,
  PushPrimingScreenComponent,
  RegisterSalonComponent,
  ServiceItemComponent,
  ServicesCategoriesComponent,
  ServicesComponent,
  ServicesListComponent,
  UiKitPreviewComponent,
  WelcomeToMadeComponent,
  WorkHoursComponent
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

    Push,
    PushNotification,

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

    // Providers for pages
    AuthProcessState,
    HomeService,
    WorktimeApi,
    InvitationsApi,
    ClientDetailsApi,
    NotificationsApi,

    ExternalAppService,

    Contacts,
    OpenNativeSettings,
    SMS,
    Camera
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
