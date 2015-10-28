var modules = {
  'vr-event': require('./vr-event'),
  'vr-template': require('./vr-template')
};

/**
 * Returns the filename of the main HTML import to load.
 */
function getHtmlFilename () {
  var scriptEl = document.querySelector('script[data-vr-components-html]');
  var htmlFilename;
  if (scriptEl) {
    htmlFilename = scriptEl.dataset.vrComponentsHtml;
  }
  if (!htmlFilename) {
    scriptEl = document.querySelector('script[src*="vr-components."]');
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
