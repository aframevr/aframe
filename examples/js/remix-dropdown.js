/* Adds a "Remix" dropdown to the gh-pages examples letting visitors open the
   current example on CodeSandbox or Krabbel. Injected into the published
   examples by scripts/preghpages.js. */
(function () {
  // Derive the example location (relative to the examples directory) from the
  // current URL, splitting it into the directory the remix services open and
  // the html filename. e.g. ".../examples/test/text/msdf2.html" ->
  // { dir: "test/text", file: "msdf2.html" }.
  // In prod the examples live under /examples/ (e.g. aframe.io/examples/ or
  // aframe.io/aframe/examples/); the local dev server serves the examples
  // directory as the web root, so fall back to the whole pathname.
  function getExampleLocation () {
    var pathname = window.location.pathname;
    var marker = '/examples/';
    var index = pathname.indexOf(marker);
    var rel = (index === -1 ? pathname : pathname.slice(index + marker.length)).replace(/^\//, '');
    var match = rel.match(/([^/]+\.html)$/);
    return {
      dir: rel.replace(/[^/]+\.html$/, '').replace(/\/$/, ''),
      file: match ? match[1] : ''
    };
  }

  function createMenuItem (label, href) {
    var item = document.createElement('a');
    item.classList.add('a-remix-menu-item');
    item.setAttribute('href', href);
    item.setAttribute('target', '_blank');
    item.setAttribute('rel', 'noopener');
    item.textContent = label;
    return item;
  }

  function addStyles () {
    var css =
      // Reposition the CodeSandbox "Open Sandbox" button to the top left so it
      // does not overlap the VR/AR enter buttons.
      'iframe[id^="sb__open-sandbox"]{inset: 16px auto auto 16px;}' +

      // Sit above the AR/VR enter buttons in the bottom right corner.
      '.a-remix-container{position: absolute; right: 20px; bottom: 70px; z-index: 9999;' +
      'font-size: 20px; line-height: 20px;' +
      'font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;}' +

      '.a-remix-button{cursor: pointer; padding: 0 10px; font-weight: bold; color: #666;' +
      'font-size: large; border: 3px solid #666; box-sizing: border-box; min-width: 58px; min-height: 38px;' +
      'border-radius: 8px; background-color: white;}' +

      '.a-remix-button:active, .a-remix-button:hover{border-color: #ef2d5e; color: #ef2d5e;}' +

      '.a-remix-menu{position: absolute; right: 0; bottom: 40px; min-width: 200px;' +
      'background-color: white; border: 3px solid #666; border-radius: 8px;' +
      'overflow: hidden;}' +

      '.a-remix-menu-item{display: block; padding: 10px 15px; color: rgb(51, 51, 51);' +
      'text-decoration: none; font-size: 11pt; line-height: 20pt;}' +

      '.a-remix-menu-item:hover{background-color: #ef2d5e; color: white;}';
    var style = document.createElement('style');

    style.appendChild(document.createTextNode(css));
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  function init () {
    addStyles();

    // Don't show the button when the example is already running inside a remix
    // service preview (CodeSandbox *.csb.app, Krabbel *.krabbel.fun).
    if (/\.(csb\.app|krabbel\.fun)$/.test(window.location.hostname)) { return; }

    var loc = getExampleLocation();
    if (!loc) { return; }

    // Point at the directory, adding a file parameter for non-index.html pages
    // so the specific example file is opened. The leading slash is URL-encoded
    // (CodeSandbox expects %2F).
    var fileParam = (loc.file && loc.file !== 'index.html') ? '?file=' + encodeURIComponent('/' + loc.file) : '';
    var treePath = 'tree/gh-pages/examples/' + loc.dir + fileParam;
    var codesandboxUrl = 'https://codesandbox.io/p/sandbox/github/aframevr/aframe/' + treePath;
    var krabbelUrl = 'https://krabbel.dev/github/aframevr/aframe/' + treePath;

    var menu = document.createElement('div');
    menu.classList.add('a-remix-menu');
    menu.style.display = 'none';
    menu.appendChild(createMenuItem('Remix on CodeSandbox', codesandboxUrl));
    menu.appendChild(createMenuItem('Remix on Krabbel', krabbelUrl));

    var button = document.createElement('button');
    button.classList.add('a-remix-button');
    button.setAttribute('title', 'Remix this example');
    button.textContent = 'REMIX';
    button.addEventListener('click', function (evt) {
      evt.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? '' : 'none';
    });

    // Close the menu when clicking elsewhere.
    document.addEventListener('click', function () { menu.style.display = 'none'; });

    var container = document.createElement('div');
    container.classList.add('a-remix-container');
    container.appendChild(menu);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
