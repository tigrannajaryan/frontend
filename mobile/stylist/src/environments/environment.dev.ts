export const ENV = {
  apiUrl: 'http://betterbeauty.local:8000/api/v1/',
  production: false,

  // Feature flag to enable or disable incomplete features
  ffEnableIncomplete: true,

  // Disable Sentry reporting for now. Once we have a staging environment file
  // use the following dsn for staging: 'https://b238c730d93f4e11917f5f716dc1920a@sentry.io/1229223'
  sentryDsn: undefined
};
