var modules = {
  'primitives': require('./primitives'),
  'a-event': require('./a-event'),
  'a-template': require('./a-template')
};

/**
 * Returns the filename of the main HTML import to load.
 */
function getHtmlFilename () {
  var scriptEl = document.querySelector('script[data-aframe-html]');
  var htmlFilename;
  if (scriptEl) {
    // NOTE: Not using `dataset` for IE <= 10 compatibility.
    htmlFilename = scriptEl.getAttribute('data-aframe-html');
  }
  if (!htmlFilename) {
    scriptEl = document.querySelector('script[src*="aframe."]');
    if (scriptEl) {
      htmlFilename = scriptEl.getAttribute('src').replace('.js', '.html');
    }
  }
  return htmlFilename;
}

/**
 * Injects a single HTML import containing all the HTML templates.
 */
function injectHtmlImport () {
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = getHtmlFilename();
  document.head.appendChild(link);
}

injectHtmlImport();

module.exports = modules;
