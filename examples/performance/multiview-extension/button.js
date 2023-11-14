/* global AFRAME */
AFRAME.registerComponent('button', {
  init: function () {
    var buttonContainerEl = this.buttonContainerEl = document.createElement('div');
    var buttonEl = this.buttonEl = document.createElement('button');
    var style = document.createElement('style');
    var urlParams = getUrlParams();
    var css =
      '.a-change-button-container {box-sizing: border-box; display: inline-block; height: 34px; padding: 0;;' +
      'bottom: 20px; left: 20px; position: absolute; color: white;' +
      'font-size: 12px; line-height: 12px; border: none;' +
      'border-radius: 5px}' +
      '.a-change-button {cursor: pointer; padding: 0px 10px 0 10px; font-weight: bold; color: #666; border: 3px solid #666; box-sizing: border-box; vertical-align: middle; max-width: 200px; border-radius: 10px; height: 34px; background-color: white; margin: 0;}' +
      '.a-change-button:hover {border-color: #ef2d5e; color: #ef2d5e}';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);

    buttonContainerEl.classList.add('a-change-button-container');
    buttonEl.classList.add('a-change-button');
    buttonEl.addEventListener('click', this.onClick.bind(this));

    buttonContainerEl.appendChild(buttonEl);

    this.el.sceneEl.appendChild(buttonContainerEl);

    if (urlParams.multiview && urlParams.multiview === 'on') {
      buttonEl.innerHTML = 'DISABLE MULTIVIEW';
    } else {
      buttonEl.innerHTML = 'ENABLE MULTIVIEW';
    }
  },

  onClick: function () {
    var params;
    var currentParams = getUrlParams();
    if (currentParams.multiview && currentParams.multiview === 'on') {
      params = '?multiview=off';
    } else {
      params = '?multiview=on';
    }
    window.location = window.location.pathname + params;
  }
});

var currentParams = getUrlParams();
var sceneEl = document.querySelector('a-scene');
if (currentParams.multiview && currentParams.multiview === 'on') {
  sceneEl.setAttribute('renderer', 'multiviewStereo: true');
}

function getUrlParams () {
  var match;
  var pl = /\+/g;  // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
  var query = window.location.search.substring(1);
  var urlParams = {};

  match = search.exec(query);
  while (match) {
    urlParams[decode(match[1])] = decode(match[2]);
    match = search.exec(query);
  }
  return urlParams;
}
