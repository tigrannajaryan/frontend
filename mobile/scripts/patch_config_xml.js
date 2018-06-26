var fs = require('fs');
var xml2js = require('xml2js');

var appName = (process.env.IOS_APP_NAME || '').trim();

if (!appName) {
  console.log('IOS_APP_NAME is not set; skipping config.xml patching.');
  process.exit(0);
}

var buildNumber = (process.env.IOS_BUILD_NUMBER || '0').trim();
var appDescription = (process.env.IOS_APP_DESCRIPTION || '').trim();
var iosAppBundleId = (process.env.IOS_APP_BUNDLE_ID || '').trim();


// Read config.xml
fs.readFile('config.xml', 'utf8', function(err, data) {
  console.log('Going to patch config.xml\n--------------------------\n');
  console.log('iOS / Android Build Number: ', buildNumber);
  console.log('iOS / Android App Name: ', appName);
  console.log('iOS / Android App Description: ', appDescription);
  console.log('iOS Bundle ID: ', iosAppBundleId);
  console.log('\n--------------------------\n');

  if(err) {
    return console.log(err);
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

    // set iOS and Android build versions
    obj['widget']['$']['ios-CFBundleVersion'] = buildNumber;
    obj['widget']['$']['android-versionCode'] = buildNumber;

    // set iOS bundle id
    obj['widget']['$']['id'] = iosAppBundleId;

    // set name and descripition
    obj['widget']['name'] = appName;
    obj['widget']['description'] = appDescription;

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
