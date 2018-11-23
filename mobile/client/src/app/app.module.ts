import { enableProdMode, ErrorHandler, Injector, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { IonicApp, IonicModule } from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';
import { AppVersion } from '@ionic-native/app-version';
import { Camera } from '@ionic-native/camera';
import { Clipboard } from '@ionic-native/clipboard';
import { Diagnostic } from '@ionic-native/diagnostic';
import { EmailComposer } from '@ionic-native/email-composer';
import { Geolocation } from '@ionic-native/geolocation';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonicStorageModule } from '@ionic/storage';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Push } from '@ionic-native/push';

import { META_REDUCERS, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { Logger } from '~/shared/logger';
import { initSentry } from '~/shared/sentry';
import { SharedSingletonsModule } from '~/shared/shared-singletons.module';

import { AuthInterceptor } from '~/shared/api/auth.interceptor';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';

import { ClientAppComponent } from '~/app.component';
import { getMetaReducers } from '~/app.reducers';

import { AuthEffects } from '~/shared/storage/auth.effects';
import { LogoutEffects } from '~/core/effects/logout.effects';
import { ServicesEffects } from '~/core/effects/services.effects';
import { ProfileEffects } from '~/core/effects/profile.effects';

import { CoreModule } from '~/core/core.module';
import { DataModule } from '~/core/api/data.module';

import { BaseService } from '~/shared/api/base.service';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { GeolocationService } from '~/shared/utils/geolocation.service';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { PushNotification } from './shared/push/push-notification';
import { authPath, authReducer } from '~/shared/storage/auth.reducer';
import { SuccessErrorPopupComponent } from '~/shared/components/success-error-popup/success-error-popup.component';
import { CalendarPrimingComponent } from './shared/components/calendar-priming/calendar-priming.component';
import { profilePath, profileReducer } from '~/core/reducers/profile.reducer';
import { servicesPath, servicesReducer } from '~/core/reducers/services.reducer';

import { AboutComponent } from '~/about/about.component';
import { AppointmentPageComponent } from '~/appointment-page/appointment-page.component';
import { AppointmentsHistoryComponent } from '~/appointments-history/appointments-history.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { BookingCompleteComponent } from '~/booking/booking-complete/booking-complete.component';
import { FirstScreenComponent } from '~/first-screen/first-screen.component';
import { HomePageComponent } from '~/home-page/home-page.component';
import { HowMadeWorksComponent } from '~/onboarding/how-made-works/how-made-works.component';
import { HowPricingWorksComponent } from '~/onboarding/how-pricing-works/how-pricing-works.component';
import { MainTabsComponent } from '~/main-tabs/main-tabs.component';
import { MyStylistsComponent } from '~/stylists/my-stylists.component';
import { NonBookableSavePopupComponent } from '~/stylists/non-bookable-save-popup/non-bookable-save-popup.component';
import { ProfileEditComponent } from '~/profile/profile-edit/profile-edit.component';
import { ProfileSummaryComponent } from '~/profile/profile-summary/profile-summary.component';
import { SelectDateComponent } from '~/booking/select-date/select-date.component';
import { SelectTimeComponent } from '~/booking/select-time/select-time.component';
import { ServicesPageComponent } from '~/services-page/services-page.component';
import { ServicesCategoriesPageComponent } from '~/services-categories-page/services-categories-page.component';
import { SelectStylistComponent } from '~/stylists/select-stylist/select-stylist.component';
import { StylistSearchComponent } from '~/stylists/stylists-search/stylists-search.component';
import { UiKitPreviewComponent } from '~/ui-kit-preview/ui-kit-preview.component';

import { ENV } from '~/environments/environment.default';
import { PrivacySettingsComponent } from '~/privacy-settings/privacy-settings.component';
import { FollowersComponent } from '~/followers/followers.component';
import { StylistComponent } from '~/stylists/stylist/stylist.component';
import { PushPrimingScreenComponent } from './shared/components/push-priming-screen/push-priming-screen.component';
import { ClientAppStorage } from './core/client-app-storage';
import { FirstLastNameComponent } from '~/profile/first-last-name/first-last-name.component';
import { ClientStartupNavigation } from './core/client-startup-navigation';

// Init sentry reporting (inits only if ENV.sentryDsn):
initSentry();

if (ENV.production) {
  // Enable Angular’s production mode:
  enableProdMode();
}

const declarations = [
  AboutComponent,
  AppointmentPageComponent,
  AppointmentsHistoryComponent,
  AuthConfirmPageComponent,
  AuthPageComponent,
  BookingCompleteComponent,
  CalendarPrimingComponent,
  ClientAppComponent,
  FirstLastNameComponent,
  FirstScreenComponent,
  FollowersComponent,
  HomePageComponent,
  HowMadeWorksComponent,
  HowPricingWorksComponent,
  MainTabsComponent,
  MyStylistsComponent,
  NonBookableSavePopupComponent,
  PushPrimingScreenComponent,
  PrivacySettingsComponent,
  ProfileEditComponent,
  ProfileSummaryComponent,
  SelectDateComponent,
  SelectStylistComponent,
  SelectTimeComponent,
  ServicesCategoriesPageComponent,
  ServicesPageComponent,
  StylistComponent,
  StylistSearchComponent,
  SuccessErrorPopupComponent,
  UiKitPreviewComponent
];

@NgModule({
  declarations,
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    CoreModule,
    SharedSingletonsModule,
    DataModule.forRoot(),

    IonicModule.forRoot(ClientAppComponent, {
      backButtonText: '',
      backButtonIcon: 'ios-arrow-round-back'
    }),
    IonicStorageModule.forRoot(),

    /**
     * StoreModule.forRoot is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
     *
     * Using forFeature in order to fix empty initial state error, for more info see
     * - https://github.com/ngrx/store/issues/401
     * - https://forum.ionicframework.com/t/ngrx-state-does-not-work-in-production-build/107226/3
     */
    StoreModule.forRoot({}),
    StoreModule.forFeature(authPath, authReducer),
    StoreModule.forFeature(profilePath, profileReducer),
    StoreModule.forFeature(servicesPath, servicesReducer),
    EffectsModule.forFeature([ProfileEffects]),

    /**
     * EffectsModule.forRoot() is imported once in the root module and
     * sets up the effects class to be initialized immediately when the
     * application starts.
     *
     * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
     */
    EffectsModule.forRoot([
      LogoutEffects,

      AuthEffects,
      ServicesEffects
    ])
  ],

  bootstrap: [IonicApp],

  entryComponents: declarations,

  providers: [
    Logger,

    // Plugins
    AppAvailability,
    AppVersion,
    Clipboard,
    Diagnostic,
    EmailComposer,
    Geolocation,
    InAppBrowser,
    LaunchNavigator,
    SplashScreen,
    StatusBar,
    ScreenOrientation,

    // Shared:
    BaseService,
    ExternalAppService,
    GeolocationService,
    ServerStatusTracker,

    Push,
    PushNotification,

    ClientAppStorage,
    ClientStartupNavigation,

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
