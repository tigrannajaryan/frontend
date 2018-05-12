/**
 * This watch config is added to support our @shared directory correctly.
 * Inspired by: https://github.com/ionic-team/ionic-cli/issues/2232#issuecomment-365786680
 */
const watchConfig = require('../node_modules/@ionic/app-scripts/config/watch.config');
watchConfig.srcFiles.paths = [
    '{{SRC}}/**/*.(ts|html|s(c|a)ss)', // This is our app directory that we watch
    '../shared/**/*.(ts|html|s(c|a)ss)' // This is the shared directory to watch in addition
];
