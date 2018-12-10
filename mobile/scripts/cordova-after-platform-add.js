var xml2js;
try {
  xml2js = require('../client/node_modules/xml2js');
} catch (err) {
  xml2js = require('../stylist/node_modules/xml2js');
}

function patchBuildGradle(
  fs, fname,
  // swap jcenter() and maven repositories. maven must come before jcenter
  // This is required because certain libraries do not exist in jcenter, they
  // are in maven and build fails if repositories that contain them are listed
  // in the wrong order.
  re = /(allprojects {\n\s+repositories {\n)(\s+jcenter\(\))\n(\s+maven {\n\s+url ".*"\n\s+})(\n\s+})/gim,
  result = '$1$3\n$2$4'
  ) {

  console.log('cordova-after-platform-add.js: patching', fname);

  var data = fs.readFileSync(fname, 'utf-8');

  var newValue = data.replace(re, result);

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

    var googleServicesBuildGradle = path.join(ctx.opts.projectRoot, 'platforms/android/cordova-support-google-services/android-build.gradle');
    patchBuildGradle(
      fs, buildGradle,
      // use maven { url "https://maven.google.com" } jcenter() mavenLocal()
      // intead of jcenter() mavenCentral()
      /(buildscript \{\n\s+repositories \{\n)(\s+)(jcenter\(\))\n(\s+mavenCentral\(\))/gim,
        '$1$2maven { url "https://maven.google.com" }\n$2$3\n$2mavenLocal()'
    );

    var projProp = path.join(ctx.opts.projectRoot, 'platforms/android/project.properties');
    patchProjectProperties(fs, projProp);
  }

  return deferral.promise;
};
