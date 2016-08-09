window.aframeStats = function (scene) {
  var _rS = null;
  var _scene = scene;
  var _values = {
    te: {
      caption: 'Entities'
    },
    lt: {
      caption: 'Load Time'
    }
  };
  var _groups = [ {
    caption: 'A-Frame',
    values: [ 'te', 'lt' ]
  } ];

  function _update () {
    _rS('te').set(getEntitiesCount());
    _rS('lt').set(window.performance.getEntriesByName('render-started')[0].startTime.toFixed(0));
  }

  function getEntitiesCount () {
    var aframeElements = getAllTagMatches(_scene, /^a-/i);
    var assetEl = _scene.querySelector('a-assets');
    var count;

    aframeElements.filter(function (el) {
      return el.tagName !== 'a-animation';
    });
    count = aframeElements.length;
    if (assetEl) {
      count -= getAllTagMatches(assetEl, /^a-/i).length + 1;
    }
    return count;
  }

  function getAllTagMatches (element, regEx) {
    return Array.prototype.slice.call(element.querySelectorAll('*')).filter(function (el) {
      return el.tagName.match(regEx);
    });
  }

  function _start () {}

  function _end () {}

  function _attach (r) {
    _rS = r;
  }

  return {
    update: _update,
    start: _start,
    end: _end,
    attach: _attach,
    values: _values,
    groups: _groups,
    fractions: []
  };
};

if (typeof module === 'object') {
  module.exports = {
    aframeStats: window.aframeStats
  };
}
