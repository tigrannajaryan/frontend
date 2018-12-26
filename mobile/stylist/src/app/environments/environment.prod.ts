export const ENV = {
  apiUrl: 'https://admin.madebeauty.com/api/v1/',
  production: true,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: true,

  // Enable Sentry reporting on production
  sentryDsn: 'https://5d75acaf6e9246b79b4bbcf3b5d86d2a@sentry.io/1229225',

  gaTrackingId: 'UA-125728679-2',

  // Firebase Cloud Messaging Sender ID
  FCM_PUSH_SENDER_ID: '833238145213',

  // ID of Made Pro client, check https://www.instagram.com/developer/clients
  INSTAGRAM_CLIENT_ID: '417299d1d7ee4c67972fd7b62c8d5044'

};
