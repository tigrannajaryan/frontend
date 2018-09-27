const fs = require('fs');
const path = require('path');

const webpackutil = module.exports = {}

// Ionic cache busting solution inspired by:
// https://gist.github.com/meirmsn/9b37d6c500654b9a487e0c0a72583ef2
// https://gist.github.com/haydenbr/7df417a8678efc404c820c61b6ffdd24
// https://github.com/ionic-team/ionic-app-scripts/issues/201
// https://forum.ionicframework.com/t/bundled-files-and-cache-busting-lazy-loading/109114/9
// https://survivejs.com/webpack/optimizing/adding-hashes-to-filenames/
// https://webpack.js.org/guides/caching/

/**
 * Extract hash value from the file name. Searches for the file in the specified
 * directory. The file must have a name in the form fileName.hash.fileType
 * @param {*} buildDirPath directory to search for the file
 * @param {*} fileName The beginning of the file name, e.g. 'main'
 * @param {*} fileType The ending of the file name, e.g. 'js'
 */
webpackutil.extractHashFromFileName = function(buildDirPath, fileName, fileType) {
  const result = fs.readdirSync(buildDirPath).filter(file => {
    return file.startsWith(fileName) && file.endsWith(fileType) && (file.indexOf('map') === -1)
  })[0];
  return result.split('.')[1];
}

/**
 * Add hash to css file name and update the file name in the content.
 * @param {*} buildDir directory whe the file is located
 * @param {*} indexContent index.html content to update
 * @param {*} fileName name of the file to update
 * @returns updated index.html content
 */
webpackutil.addHashToCssFileName = function(buildDir, indexContent, fileName) {
  console.log('Hashifying file',fileName);
  hash = webpackutil.extractHashFromFileName(buildDir, fileName, 'css');

  let match = '(<link href="build/' + fileName + '.*.css" rel="stylesheet">)';
  console.log('Seaching for',match);
  let regexp = indexContent.match(match)[0];
  const replace = '<link href="build/' + fileName + '.' + hash + '.css" rel="stylesheet">)';
  return indexContent.replace(regexp, replace);
}

/**
 * Add hash to js file name and update the file name in the content.
 * @param {*} buildDir directory whe the file is located
 * @param {*} indexContent index.html content to update
 * @param {*} fileName name of the file to update
 * @returns updated index.html content
 */
webpackutil.addHashToJsFileName = function(buildDir, indexString, fileName) {
  console.log('Hashifying file',fileName);
  hash = webpackutil.extractHashFromFileName(buildDir, fileName, 'js');

  let match = '(<script src="build/' + fileName + '.*.js"></script>)';
  let regexp = indexString.match(match)[0];
  const replace = '<script src="build/' + fileName + '.' + hash + '.js"></script>';
  return indexString.replace(regexp, replace);
}

/**
 * Hashify main.css file name.
 * Renames the file from main.css to main.<md5 hash>.css
 * @param {*} buildDir directory where main.css is.
 */
webpackutil.hashifyMainCss = function(buildDir) {
  const mainCss = path.join(buildDir, 'main.css');
  const fileString = fs.readFileSync(mainCss).toString();
  const md5 = md5(fileString);
  const newMainCss = path.join(buildDir, `main.${md5}.css`);
  console.log(`Renaming ${mainCss} to ${newMainCss}`);
  fs.renameSync(mainCss, newMainCss);
}

webpackutil.hashifyFileNames = function(rootDir) {
  console.log('Hashifying file names in directory',rootDir);

  var wwwRootDir = path.resolve(rootDir, 'www');
  var buildDir = path.join(wwwRootDir, 'build');
  var indexPath = path.join(wwwRootDir, 'index.html');

  // TODO: hashify main.css file name. Currently cannot find a good way to do it
  // because we use compiler.done webpack hook to trigger hashifying and
  // that hook is called before main.css is created.
  // webpackutil.hashifyMainCss(buildDir);

  let indexHtmlContent = fs.readFileSync(indexPath).toString();

  indexHtmlContent = webpackutil.addHashToJsFileName(buildDir, indexHtmlContent, 'main');
  indexHtmlContent = webpackutil.addHashToJsFileName(buildDir, indexHtmlContent, 'vendor');

  // TODO: use later (see comment above about main.css):
  // indexHtmlContent = webpackutil.addHashToCssFileName(buildDir, indexHtmlContent, 'main');

  fs.writeFileSync(indexPath, indexHtmlContent);
  console.log('Hashifying finished');
}
