export const ENV = {
  apiUrl: 'https://admindev.madebeauty.com/api/v1/',
  production: false,

  // Feature flag to enable or disable incomplete features
  ffEnableIncomplete: false,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: false,

  // Disable Sentry reporting by default.
  sentryDsn: undefined,

  // Disable GA reporting by default
  gaTrackingId: undefined,

  // Firebase Cloud Messaging Sender ID. Use Staging push notifications by default
  FCM_PUSH_SENDER_ID: '17636556416'
};
