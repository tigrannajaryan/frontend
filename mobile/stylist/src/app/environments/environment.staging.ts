export const ENV = {
  apiUrl: 'https://admindev.madebeauty.com/api/v1/',
  production: false,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: true,

  // Feature flag to enable instagram integration
  ffEnableInstagramLinking: true,

  // Enable Sentry reporting on production
  sentryDsn: 'https://b238c730d93f4e11917f5f716dc1920a@sentry.io/1229223',

  gaTrackingId: 'UA-120898935-1',

  // Firebase Cloud Messaging Sender ID
  FCM_PUSH_SENDER_ID: '17636556416',

  // ID of Made Pro client, check https://www.instagram.com/developer/clients
  INSTAGRAM_CLIENT_ID: '417299d1d7ee4c67972fd7b62c8d5044'
};
