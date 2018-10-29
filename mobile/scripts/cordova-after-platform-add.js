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

module.exports = function (ctx) {
  console.log('cordova-after-platform-add.js hook starting');

  // make sure android platform is part of build
  if (ctx.opts.platforms.indexOf('android') < 0) {
    return;
  }
  var fs = ctx.requireCordovaModule('fs'),
    path = ctx.requireCordovaModule('path'),
    deferral = ctx.requireCordovaModule('q').defer();

  var buildGradle = path.join(ctx.opts.projectRoot, 'platforms/android/build.gradle');

  patchBuildGradle(fs, buildGradle);

  return deferral.promise;
};
