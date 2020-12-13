window.aframeStats = function (scene) {
  let _rS = null;
  let _scene = scene;
  let _values = {
    te: {
      caption: 'Entities'
    },
    lt: {
      caption: 'Load Time'
    }
  };
  let _groups = [ {
    caption: 'A-Frame',
    values: [ 'te', 'lt' ]
  } ];

  function _update () {
    _rS('te').set(getEntityCount());
    if (window.performance.getEntriesByName) {
      _rS('lt').set(window.performance.getEntriesByName('render-started')[0].startTime.toFixed(0));
    }
  }

  function getEntityCount () {
    let elements = _scene.querySelectorAll('*');
    Array.prototype.slice.call(elements).filter(function (el) {
      return el.isEntity;
    });
    return elements.length;
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
