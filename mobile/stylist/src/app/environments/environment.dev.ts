export const ENV = {
  apiUrl: 'http://betterbeauty.local:8000/api/v1/',
  production: false,

  // Feature flag to enable push notifications
  ffEnablePushNotifications: true,

  // Feature flag to enable instagram integration
  ffEnableInstagramLinking: true,

  // Disable Sentry reporting for now. Once we have a staging environment file
  // use the following dsn for staging: 'https://b238c730d93f4e11917f5f716dc1920a@sentry.io/1229223'
  sentryDsn: undefined,

  // ID of Made Pro client, check https://www.instagram.com/developer/clients
  INSTAGRAM_CLIENT_ID: '417299d1d7ee4c67972fd7b62c8d5044'
};
