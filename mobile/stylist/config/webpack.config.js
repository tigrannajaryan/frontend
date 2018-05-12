const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const webpackConfig = require('../node_modules/@ionic/app-scripts/config/webpack.config');
const config = {
  plugins: [
    new webpack.EnvironmentPlugin({
      BB_ENV: undefined
    }),
    new webpack.NormalModuleReplacementPlugin(/\.\/environments\/environment\.default/, function (resource) {
      if (process.env.BB_ENV !== undefined) {
        const env = process.env.BB_ENV.trim();
        console.log('Rewriting ', resource.request);
        // @TODO try to generalise the regex using negative lookaheads https://stackoverflow.com/questions/977251/regular-expressions-and-negating-a-whole-character-group
        resource.request = resource.request.replace(/\.\/environments\/environment\.default/, '\.\/environments/environment.' + env);
        console.log('to        ', resource.request);
      } else {
        console.log('No environment specified. Using `default`');
      }
    })
  ],
  resolve: {
    alias: {
      // Make @shared an alias for our shared code directory.
      // Inspired by this: https://github.com/ionic-team/ionic-cli/issues/2232#issuecomment-365786680
      "@shared": path.resolve('../shared/'),

      // Make ~ an alias for root source code directory (inspired by Alexei Mironov)
      "~": path.resolve('./src/app')
    }
  }
};

module.exports = {
  prod: merge(webpackConfig.prod, config),
  dev: merge(webpackConfig.dev, config)
};
