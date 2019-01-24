import { enableProdMode, ErrorHandler, Injector, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

import { IonicApp, IonicModule } from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';
import { AppVersion } from '@ionic-native/app-version';
import { Camera } from '@ionic-native/camera';
import { Clipboard } from '@ionic-native/clipboard';
import { Diagnostic } from '@ionic-native/diagnostic';
import { EmailComposer } from '@ionic-native/email-composer';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Push } from '@ionic-native/push';
import { GooglePlus } from '@ionic-native/google-plus';
import { Contacts } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SMS } from '@ionic-native/sms';

import { GalleryModalHammerConfig, GalleryModalModule } from 'ionic-gallery-modal';
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';

import { META_REDUCERS, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { Logger } from '~/shared/logger';
import { initSentry } from '~/shared/sentry';
import { SharedSingletonsModule } from '~/shared/shared-singletons.module';

import { AuthInterceptor } from '~/shared/api/auth.interceptor';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';

import { ClientAppComponent } from '~/app.component';
import { getMetaReducers } from '~/app.reducers';

import { LogoutEffects } from '~/core/effects/logout.effects';
import { ServicesEffects } from '~/core/effects/services.effects';
import { ProfileEffects } from '~/core/effects/profile.effects';

import { CoreModule } from '~/core/core.module';
import { DataModule } from '~/core/api/data.module';

import { BaseService } from '~/shared/api/base.service';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { GeolocationService } from '~/shared/utils/geolocation.service';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { PushNotification } from '~/shared/push/push-notification';
import { SuccessErrorPopupComponent } from '~/shared/components/success-error-popup/success-error-popup.component';
import { CalendarPickerComponent } from '~/shared/components/calendar-picker/calendar-picker.component';
import { CalendarPrimingComponent } from '~/shared/components/calendar-priming/calendar-priming.component';
import { GoogleSignin } from '~/shared/google-signin';
import { InstagramGalleryComponent } from '~/shared/components/instagram-gallery/instagram-gallery.component';
import { IntegrationsApi } from '~/shared/api/integrations.api';
import { ListPickerPopupComponent } from '~/shared/components/list-picker-popup/list-picker-popup.component';
import { StylistProfileApi } from '~/shared/api/stylist-profile.api';

import { profilePath, profileReducer } from '~/core/reducers/profile.reducer';
import { servicesPath, servicesReducer } from '~/core/reducers/services.reducer';

import { AboutComponent } from '~/about/about.component';
import { AddServicesComponent } from '~/add-services/add-services.component';
import { AppointmentPageComponent } from '~/appointment-page/appointment-page.component';
import { AppointmentPriceComponent } from '~/appointment-price/appointment-price.component';
import { AuthPageComponent } from '~/auth/auth-start/auth-start.component';
import { AuthConfirmPageComponent } from '~/auth/auth-confirm/auth-confirm.component';
import { BookingCompleteComponent } from '~/booking/booking-complete/booking-complete.component';
import { ConfirmCheckoutComponent } from '~/confirm-checkout/confirm-checkout.component';
import { FirstScreenComponent } from '~/first-screen/first-screen.component';
import { HomeComponent } from '~/home/home.component';
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
import { StylistProfileComponent } from '~/stylists/stylist-profile/stylist-profile.component';
import { GoogleMapsConfig } from '~/shared/google-maps-config';
import { InvitationsComponent } from '~/invitations/invitations.component';
import { InvitationsApi } from '~/core/api/invitations.api';

// Init sentry reporting (inits only if ENV.sentryDsn):
initSentry();

if (ENV.production) {
  // Enable Angular’s production mode:
  enableProdMode();
}

const declarations = [
  AboutComponent,
  AddServicesComponent,
  AppointmentPageComponent,
  AppointmentPriceComponent,
  AuthConfirmPageComponent,
  AuthPageComponent,
  BookingCompleteComponent,
  CalendarPickerComponent,
  CalendarPrimingComponent,
  ClientAppComponent,
  ConfirmCheckoutComponent,
  FirstLastNameComponent,
  FirstScreenComponent,
  FollowersComponent,
  HomeComponent,
  HowMadeWorksComponent,
  HowPricingWorksComponent,
  InstagramGalleryComponent,
  InvitationsComponent,
  ListPickerPopupComponent,
  MainTabsComponent,
  MyStylistsComponent,
  NonBookableSavePopupComponent,
  PrivacySettingsComponent,
  ProfileEditComponent,
  ProfileSummaryComponent,
  PushPrimingScreenComponent,
  SelectDateComponent,
  SelectStylistComponent,
  SelectTimeComponent,
  ServicesCategoriesPageComponent,
  ServicesPageComponent,
  StylistComponent,
  StylistProfileComponent,
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

    GalleryModalModule,

    AgmCoreModule.forRoot(),

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
    LaunchNavigator,
    SplashScreen,
    StatusBar,
    ScreenOrientation,
    GooglePlus,

    // Shared:
    BaseService,
    ExternalAppService,
    GeolocationService,
    ServerStatusTracker,

    Push,
    PushNotification,

    ClientAppStorage,
    ClientStartupNavigation,

    GooglePlus,
    GoogleSignin,
    IntegrationsApi,
    StylistProfileApi,

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
      // https://www.npmjs.com/package/ionic-gallery-modal
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GalleryModalHammerConfig
    },

    {
      // Override google maps config
      provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsConfig
    },

    InvitationsApi,

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
