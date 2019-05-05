export const ENV = {
  apiUrl: 'https://admindev.madebeauty.com/api/v1/',
  production: false,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: true,

  // Enable Sentry reporting on production
  sentryDsn: undefined,

  gaTrackingId: undefined,

  // Firebase Cloud Messaging Sender ID
  FCM_PUSH_SENDER_ID: undefined,

  // ID of Made Pro client, check https://www.instagram.com/developer/clients
  INSTAGRAM_CLIENT_ID: undefined
};
