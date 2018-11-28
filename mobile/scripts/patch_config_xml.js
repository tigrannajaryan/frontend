var fs = require('fs');
var path = require('path');
var xml2js;
try {
  xml2js = require('../client/node_modules/xml2js');
} catch (err) {
  xml2js = require('../stylist/node_modules/xml2js');
}

var appName = (process.env.IOS_APP_NAME || '').trim();

if (!appName) {
  console.log('IOS_APP_NAME is not set; skipping config.xml patching.');
  process.exit(0);
}

function patchConfigObject(obj, projectRootPath, platforms) {
  var buildNumber = (process.env.TRAVIS_BUILD_NUMBER || '0').trim();
  var appVersion = (process.env.APP_VERSION_NUMBER || '').trim();
  var appDescription = (process.env.IOS_APP_DESCRIPTION || '').trim();
  var iosAppBundleId = (process.env.IOS_APP_BUNDLE_ID || '').trim();
  var androidAppBundleId = (process.env.ANDROID_APP_BUNDLE_ID || '').trim();

  console.log('Going to patch config.xml\n--------------------------\n');
  console.log('App Version: ', appVersion);
  console.log('iOS / Android Build Number: ', buildNumber);
  console.log('iOS / Android App Name: ', appName);
  console.log('iOS / Android App Description: ', appDescription);
  console.log('iOS Bundle ID: ', iosAppBundleId);
  console.log('Android Bundle ID: ', androidAppBundleId);
  console.log('\n--------------------------\n');

  // if app version is set externally - patch config, skip overwise
  if (appVersion) {
    obj['widget']['$']['version'] = appVersion;
  } else {
    console.log('App version is not set, not touching it...');
  }

  // set iOS and Android build versions
  obj['widget']['$']['ios-CFBundleVersion'] = buildNumber;
  obj['widget']['$']['android-versionCode'] = buildNumber;

  // set iOS and Android bundle id
  obj['widget']['$']['id'] = 'madeBeauty.mobile';
  obj['widget']['$']['ios-CFBundleIdentifier'] = iosAppBundleId;
  obj['widget']['$']['android-packageName'] = androidAppBundleId;


  // set name and descripition
  obj['widget']['name'] = appName;
  obj['widget']['description'] = appDescription;

  // Read web client id for Google Plus plugin.
  // Values in webclientid-config.json are from
  // https://console.developers.google.com/apis/credentials?project=made-prod&organizationId=1065847735654

  var webclientidConfigFname = path.join(projectRootPath, '../support/config/webclientid-config.json');
  var webclientidJson = fs.readFileSync(webclientidConfigFname, 'utf-8');
  var googlePlusProductionWebAppClientId = JSON.parse(webclientidJson);

  // Reversed client id is only needed for iOS
  var googlePlusProductionReversedClientId = {
    staging: {
      ios: "apps.googleusercontent.com.17636556416-l518l3bkc3pev82sl9d2dq6vrd1th7hc",
      android: "" // Android does not use reverse client id
    },
    prod: {
      ios: "com.googleusercontent.apps.833238145213-u4lbuebvh1voqude6fo0qa3poc4aru75",
      android: "" // Android does not use reverse client id
    }
  };

  // Facebook App Ids for Facebook plugin
  var facebookAppId = {
    staging: {
      client: "334939343971396",
      stylist: "467418693781904"
    },
    prod: {
      client: "485733848602904",
      stylist: "315613705946728"
    }
  };

  // Determine environment name
  var envName = (process.env.MB_ENV || '').trim();
  if (envName !== 'prod') {
    // Use staging configuration by for all environments except prod
    envName = 'staging';
  }
  console.log('Using configuration for environment', envName);

  // Compose file name for Google Services
  if (envName) {
    var googleServicesFile = 'google-services-' + envName + '.json';
  }

  var platform = platforms[0];
  console.log('Platform is', platform);

  // The internal name of the app ("client" or "stylist")
  var appInternalName = path.basename(projectRootPath);
  console.log('App name is', appInternalName);

  // Patch Google Plus plugin parameters
  var faecbookPlugin = obj['widget']['plugin'].find(e => e['$']['name'] === 'cordova-plugin-googleplus');
  console.log('googlePlusPlugin is', faecbookPlugin);

  var WEB_APPLICATION_CLIENT_ID = faecbookPlugin['variable'].find(e => e['$']['name'] === 'WEB_APPLICATION_CLIENT_ID');
  console.log('WEB_APPLICATION_CLIENT_ID is', WEB_APPLICATION_CLIENT_ID);
  WEB_APPLICATION_CLIENT_ID['$']['value'] = googlePlusProductionWebAppClientId[envName][platform];
  console.log('Updated WEB_APPLICATION_CLIENT_ID to', googlePlusProductionWebAppClientId[envName][platform]);

  var REVERSED_CLIENT_ID = faecbookPlugin['variable'].find(e => e['$']['name'] === 'REVERSED_CLIENT_ID');
  console.log('REVERSED_CLIENT_ID is', REVERSED_CLIENT_ID);
  REVERSED_CLIENT_ID['$']['value'] = googlePlusProductionReversedClientId[envName][platform];
  console.log('Updated REVERSED_CLIENT_ID to', googlePlusProductionReversedClientId[envName][platform]);

  var currentPlatform = obj['widget']['platform'].find(e => e['$']['name'] === platform);
  console.log('currentPlatform is', currentPlatform);

  if (googleServicesFile) {
    // Patch google-services.json file name
    var googleServicesResourceFile = currentPlatform['resource-file'].find(e => e['$']['target'] === 'app/google-services.json');
    console.log('googleServicesResourceFile is', googleServicesResourceFile);

    googleServicesResourceFile['$']['src'] = googleServicesFile;
    console.log('Updated googleServicesResourceFile to', googleServicesFile);
  }

  // Patch Facebook App id
  var configFile = currentPlatform['config-file'].find(e => e['$']['target'] === './res/values/strings.xml');
  console.log('configFile is', configFile);
  var configFileStrings = configFile['string'];
  console.log('configFileStrings is', configFileStrings);

  var fb_app_id = configFileStrings.find(e => e['$']['name'] === 'fb_app_id');
  console.log('fb_app_id is', fb_app_id._);
  fb_app_id._ = facebookAppId[envName][appInternalName];
  console.log('Setting fb_app_id to', fb_app_id._);

  var faecbookPlugin = obj['widget']['plugin'].find(e => e['$']['name'] === 'cordova-plugin-facebook4');
  console.log('faecbookPlugin is', faecbookPlugin);
  var FB_APP_ID = faecbookPlugin['variable'].find(e => e['$']['name'] === 'APP_ID');
  console.log('FB_APP_ID is', FB_APP_ID);
  FB_APP_ID['$']['value'] = facebookAppId[envName][appInternalName];
  console.log('Updated FB_APP_ID to', facebookAppId[envName][appInternalName]);
}

function patchConfigFile(err, xmlInput, projectRootPath, platforms) {
  if (err) {
    return console.log(err);
  }

  // Parse XML to JS Obj
  xml2js.parseString(xmlInput, function (err, obj) {
    if (err) {
      return console.log(err);
    }

    patchConfigObject(obj, projectRootPath, platforms);

    // Build XML from JS Obj
    var builder = new xml2js.Builder();
    var xmlOutput = builder.buildObject(obj);

    // Write config.xml
    fs.writeFile('config.xml', xmlOutput, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('Patch completed.');
    });
  });
}

module.exports = function (ctx) {
  console.log('cordova after-platform-remove hook starting');

  var deferral = ctx.requireCordovaModule('q').defer();

  // Read and patch config.xml
  fs.readFile('config.xml', 'utf8',
    function(err, data) { patchConfigFile(err, data, ctx.opts.projectRoot, ctx.opts.platforms); } );

  return deferral.promise;
};
