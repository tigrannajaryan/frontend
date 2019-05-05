export const ENV = {
  apiUrl: 'https://admindev.madebeauty.com/api/v1/',
  production: false,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: true,

  // Disable Sentry reporting by default.
  sentryDsn: undefined,

  // Disable GA reporting by default
  gaTrackingId: undefined,

  // Firebase Cloud Messaging Sender ID. Use Staging push notifications by default
  FCM_PUSH_SENDER_ID: undefined,

  // ID of Made Pro client, check https://www.instagram.com/developer/clients
  INSTAGRAM_CLIENT_ID: undefined
};
