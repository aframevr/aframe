window.aframeStats = function (scene) {
  var _rS = null;
  var _scene = scene;
  var _values = {
    plt: {
      caption: 'Post(ms)'
    },
    pte: {
      caption: 'Scene(ms)'
    },
    te: {
      caption: 'Entities'
    },
    lt: {
      caption: 'Load Time'
    }
  };
  var _groups = [{
    caption: 'A-Frame - General',
    values: ['te', 'lt']
  }, {
    caption: 'A-Frame - Timings',
    values: ['plt', 'pte']
  }];

  function _update () {
    var renderStarted = window.performance.getEntriesByName('render-iteration-started')[0];
    var renderFinished = window.performance.getEntriesByName('render-iteration-finished')[0];
    var postStarted = window.performance.getEntriesByName('post-processing-started')[0];
    if (!this.averages) {
      this.averages = {
        sceneTime: 0,
        postTime: 0,
        count: 0
      };
    }

    var count = this.averages.count++ & 15;
    if (!count) {
      _rS('plt').set((this.averages.postTime / 16 || 0).toFixed(1));
      _rS('pte').set((this.averages.sceneTime / 16 || 0).toFixed(1));
      this.averages.sceneTime = 0;
      this.averages.postTime = 0;
    }
    this.averages.sceneTime += renderFinished && (postStarted || renderFinished).startTime - renderStarted.startTime;
    this.averages.postTime += postStarted ? renderFinished.startTime - postStarted.startTime : 0;

    _rS('te').set(_scene.querySelectorAll('a-entity').length);
    _rS('lt').set(window.performance.getEntriesByName('render-started')[0].startTime.toFixed(0));

    window.performance.clearMarks('render-iteration-started');
    window.performance.clearMarks('render-iteration-finished');
    window.performance.clearMarks('post-processing-started');
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
