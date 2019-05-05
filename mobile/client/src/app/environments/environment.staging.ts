export const ENV = {
  apiUrl: 'https://admindev.madebeauty.com/api/v1/',
  production: false,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: true,

  // Feature flag to enable or disable incomplete features
  ffEnableIncomplete: true,

  // Enable Sentry reporting on production
  sentryDsn: undefined,

  gaTrackingId: undefined,

  // Firebase Cloud Messaging Sender ID
  FCM_PUSH_SENDER_ID: undefined
};
