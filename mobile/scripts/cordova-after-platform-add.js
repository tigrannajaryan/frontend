var xml2js;
try {
  xml2js = require('../client/node_modules/xml2js');
} catch (err) {
  xml2js = require('../stylist/node_modules/xml2js');
}

function patchConfigXml(fs, path, projectRootPath, platforms) {
  // Values in webclientid-config.json are from
  // https://console.developers.google.com/apis/credentials?project=made-prod&organizationId=1065847735654

  var webclientidConfigFname = path.join(projectRootPath, '../support/config/webclientid-config.json');
  var webclientidJson = fs.readFileSync(webclientidConfigFname, 'utf-8');
  var googlePlusProductionWebAppClientId = JSON.parse(webclientidJson);

  // Reversed client id is only needed for iOS
  var googlePlusProductionReversedClientId = {
    staging: {
      ios: "apps.googleusercontent.com.17636556416-l518l3bkc3pev82sl9d2dq6vrd1th7hc",
      android: ""
    },
    prod: {
      ios: "apps.googleusercontent.com.833238145213-h0usauchlokkr7ubaijs8pnm76co14to",
      android: ""
    }
  };

  var fname = path.join(projectRootPath, 'config.xml');
  var data = fs.readFileSync(fname, 'utf-8');
  console.log('Going to patch', fname);
  var platform = platforms[0];  
  console.log('Platform is', platform);

  // Remove part of platform that comes after @ if present
  const indexAt = platform.indexOf('@');
  if (indexAt >= 0) {
    platform = platform.substring(0, indexAt);
    console.log('Platform is', platform);
  }

  var envName = (process.env.MB_ENV || '').trim();
  if (envName !== 'prod') {
    // Use staging configuration by for all environments except prod
    envName = 'staging';
  }

  if (envName) {
    var googleServicesFile = 'google-services-' + envName + '.json';
  }

  console.log('Using configuration for environment', envName);

  console.log('config.xml is', data);

  xml2js.parseString(data, function (err, result) {
    if (err) {
      return console.error(err);
    }

    console.log('Parsed ', fname);

    // Get JS Obj
    var obj = result;    

    // Patche Google Plus plugin parameters
    var googlePlusPlugin = obj['widget']['plugin'].find(e => e['$']['name'] === 'cordova-plugin-googleplus');

    console.log('googlePlusPlugin is', googlePlusPlugin);

    var WEB_APPLICATION_CLIENT_ID = googlePlusPlugin['variable'].find(e => e['$']['name'] === 'WEB_APPLICATION_CLIENT_ID');
    console.log('WEB_APPLICATION_CLIENT_ID is', WEB_APPLICATION_CLIENT_ID);
    WEB_APPLICATION_CLIENT_ID['$']['value'] = googlePlusProductionWebAppClientId[envName][platform];
    console.log('Updated WEB_APPLICATION_CLIENT_ID to', googlePlusProductionWebAppClientId[envName][platform]);

    var REVERSED_CLIENT_ID = googlePlusPlugin['variable'].find(e => e['$']['name'] === 'REVERSED_CLIENT_ID');
    console.log('REVERSED_CLIENT_ID is', REVERSED_CLIENT_ID);
    REVERSED_CLIENT_ID['$']['value'] = googlePlusProductionReversedClientId[envName][platform];
    console.log('Updated REVERSED_CLIENT_ID to', googlePlusProductionReversedClientId[envName][platform]);

    if (googleServicesFile) {
      // Patch google-services.json file name
      var androidPlatform = obj['widget']['platform'].find(e => e['$']['name'] === 'android');
      console.log('androidPlatform is', androidPlatform);
      var googleServicesResourceFile = androidPlatform['resource-file'].find(e => e['$']['target'] === 'app/google-services.json');
      console.log('googleServicesResourceFile is', googleServicesResourceFile);

      googleServicesResourceFile['$']['src'] = googleServicesFile;
      console.log('Updated googleServicesResourceFile to', googleServicesFile);
    }

    console.log('Building XML from json');

    // Build XML from JS Obj
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);

    console.log('Saving', fname);

    fs.writeFileSync(fname, xml, 'utf-8');
    console.log('cordova-after-platform-add.js: patching complete');
  });
}

function patchBuildGradle(fs, fname) {

  console.log('cordova-after-platform-add.js: patching', fname);

  var data = fs.readFileSync(fname, 'utf-8');

  // swap jcenter() and maven repositories. maven must come before jcenter
  // This is required because certain libraries do not exist in jcenter, they
  // are in maven and build fails if repositories that contain them are listed
  // in the wrong order.
  var re = /(allprojects {\n\s+repositories {\n)(\s+jcenter\(\))\n(\s+maven {\n\s+url ".*"\n\s+})(\n\s+})/gim;

  var newValue = data.replace(re, '$1$3\n$2$4');

  fs.writeFileSync(fname, newValue, 'utf-8');

  console.log('cordova-after-platform-add.js: patching complete');
}

function patchProjectProperties(fs, fname) {

  console.log('cordova-after-platform-add.js: patching', fname);

  var data = fs.readFileSync(fname, 'utf-8');

  // We need to use version 11.0.1 for Google Services otherwise we get Java lib version conflicts
  var re = /(com.google.android.gms:play-services-.*:)(.*)/gim;

  var newValue = data.replace(re, '$1' + '11.0.1');

  fs.writeFileSync(fname, newValue, 'utf-8');

  console.log('cordova-after-platform-add.js: patching complete');
}

module.exports = function (ctx) {
  console.log('cordova-after-platform-add.js hook starting');

  var fs = ctx.requireCordovaModule('fs'),
    path = ctx.requireCordovaModule('path'),
    deferral = ctx.requireCordovaModule('q').defer();

  if (ctx.opts.platforms.indexOf('android') >= 0) {
    // Patches for Android builds
    var buildGradle = path.join(ctx.opts.projectRoot, 'platforms/android/build.gradle');
    patchBuildGradle(fs, buildGradle);

    var projProp = path.join(ctx.opts.projectRoot, 'platforms/android/project.properties');
    patchProjectProperties(fs, projProp);
  }

  patchConfigXml(fs, path, ctx.opts.projectRoot, ctx.opts.platforms);

  return deferral.promise;
};
