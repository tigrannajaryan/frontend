const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

// get git info from command line
const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

const webpackConfig = require('../node_modules/@ionic/app-scripts/config/webpack.config');
const config = {
  plugins: [
    new webpack.EnvironmentPlugin({
      BB_ENV: undefined,
      IOS_BUILD_NUMBER: undefined
    }),

    new webpack.NormalModuleReplacementPlugin(/\.\/environments\/environment\.default/, function (resource) {
      if (process.env.BB_ENV !== undefined) {
        let env = process.env.BB_ENV.trim();

        if (process.env.BB_ENV === 'dev' && fs.existsSync(path.resolve('./src/environments/environment.local.ts'))) {
          if (!global.environmentNameLogged) {
            console.warn('\033[1;33mReplacing "dev" env config with "local"\033[0m');
          }
          env = 'local';
        }

        if (!global.environmentNameLogged) {
          console.log('Rewriting ', resource.request);
        }
        // @TODO try to generalise the regex using negative lookaheads https://stackoverflow.com/questions/977251/regular-expressions-and-negating-a-whole-character-group
        resource.request = resource.request.replace(/\.\/environments\/environment\.default/, '\.\/environments/environment.' + env);
        if (!global.environmentNameLogged) {
          console.log('to        ', resource.request);
        }
        global.environmentNameLogged = true;
      } else {
        if (!global.environmentNameLogged) {
          console.log('No environment specified. Using `default`');
        }
        global.environmentNameLogged = true;
      }
    }),

    function () {
      this.plugin('watch-run', function (watching, callback) {
        console.log('Begin compile at ' + new Date());
        const buildNum = process.env.IOS_BUILD_NUMBER || 0;
        console.log('IOS_BUILD_NUMBER=' + buildNum);
        callback();
      })
    },

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

module.exports = {
  prod: merge(webpackConfig.prod, config),
  dev: merge(webpackConfig.dev, config)
};
