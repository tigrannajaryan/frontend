var fs = require('fs');
var xml2js;
try {
  xml2js = require('../client/node_modules/xml2js');
} catch(err) {
  xml2js = require('../stylist/node_modules/xml2js');
}

var appName = (process.env.IOS_APP_NAME || '').trim();

if (!appName) {
  console.log('IOS_APP_NAME is not set; skipping config.xml patching.');
  process.exit(0);
}

var buildNumber = (process.env.TRAVIS_BUILD_NUMBER || '0').trim();
var appVersion = (process.env.APP_VERSION_NUMBER || '').trim();
var appDescription = (process.env.IOS_APP_DESCRIPTION || '').trim();
var iosAppBundleId = (process.env.IOS_APP_BUNDLE_ID || '').trim();
var androidAppBundleId = (process.env.ANDROID_APP_BUNDLE_ID || '').trim();

var envName = (process.env.MB_ENV || '').trim();

// Read config.xml
fs.readFile('config.xml', 'utf8', function(err, data) {
  console.log('Going to patch config.xml\n--------------------------\n');
  console.log('App Version: ', appVersion);
  console.log('iOS / Android Build Number: ', buildNumber);
  console.log('iOS / Android App Name: ', appName);
  console.log('iOS / Android App Description: ', appDescription);
  console.log('iOS Bundle ID: ', iosAppBundleId);
  console.log('Android Bundle ID: ', androidAppBundleId);
  console.log('\n--------------------------\n');

  if(err) {
    return console.log(err);
  }

  if (envName) {
    var googleServicesFile = 'google-services-' + envName + '.json';
  }

  // Get XML
  var xml = data;

  // Parse XML to JS Obj
  xml2js.parseString(xml, function (err, result) {
    if(err) {
      return console.log(err);
    }
    // Get JS Obj
    var obj = result;

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

    if (googleServicesFile) {
      var androidPlatform = obj['widget']['platform'].find(e => e['$']['name'] === 'android');
      var googleServicesResourceFile = androidPlatform['resource-file'].find(e => e['$']['target'] === 'app/google-services.json');

      // patch file name
      googleServicesResourceFile['$']['src'] = googleServicesFile;
    }

    // Build XML from JS Obj
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);

    // Write config.xml
    fs.writeFile('config.xml', xml, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log('Patch completed.');
    });

  });
});
