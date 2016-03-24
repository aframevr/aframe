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
    _rS('te').set(_scene.querySelectorAll('a-entity').length);
    _rS('lt').set(window.performance.getEntriesByName('render-started')[0].startTime.toFixed(0));
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
