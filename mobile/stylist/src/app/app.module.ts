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

import { pages } from '~/core/page-names';

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
  ...pages,

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
