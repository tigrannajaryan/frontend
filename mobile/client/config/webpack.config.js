const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackOnBuildPlugin = require('on-build-webpack');
const webpackutil = require('../../scripts/webpack-util');

// get git info from command line
const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

// Ionic’s config to extend
const webpackConfig = require('../node_modules/@ionic/app-scripts/config/webpack.config');

// Application common config
const config = {
  plugins: [
    new webpack.EnvironmentPlugin({
      MB_ENV: undefined,
      TRAVIS_BUILD_NUMBER: undefined,
      APP_VERSION_NUMBER: undefined,
      APP_BUNDLE_ID: undefined
    }),

    new webpack.NormalModuleReplacementPlugin(/\/environments\/environment\.default/, function (resource) {
      if (process.env.APP_BUNDLE_ID !== undefined) {
        console.log('APP_BUNDLE_ID=', process.env.APP_BUNDLE_ID);
      }

      if (process.env.MB_ENV !== undefined) {
        let env = process.env.MB_ENV.trim();

        if (process.env.MB_ENV === 'dev' && fs.existsSync(path.resolve('./src/app/environments/environment.local.ts'))) {
          console.warn('\033[1;33mReplacing .dev env config with .local\033[0m');
          env = 'local';
        }

        console.log('Rewriting ', resource.request);
        // @TODO try to generalise the regex using negative lookaheads https://stackoverflow.com/questions/977251/regular-expressions-and-negating-a-whole-character-group
        resource.request = resource.request.replace(/\/environments\/environment\.default/, '\/environments/environment.' + env);
        console.log('to        ', resource.request);
      } else {
        console.log('No environment specified. Using `default`');
      }
    }),

    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commitHash),
    })
  ],

  resolve: {
    alias: {
      // Make ~ an alias for root source code directory (inspired by Alexei Mironov)
      "~": path.resolve('./src/app')
    },
    symlinks: false
  }
};

// Config with extensive hashing
const prodConfig = ['prod', 'staging'].indexOf(process.env.MB_ENV) !== -1 ? {
  output: {
    // Include content-based hash in the chunk file names.
    // See also hashifyJsFileNames() which updates the file names in index.html
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    new WebpackOnBuildPlugin(function(stats) {
      webpackutil.hashifyFileNames(path.resolve(__dirname, '../'));
    })
  ]
} : {};

module.exports = {
  prod: merge(webpackConfig.prod, config, prodConfig),
  dev: merge(webpackConfig.dev, config, prodConfig)
};
