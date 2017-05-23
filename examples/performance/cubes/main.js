/* global AFRAME */
AFRAME.registerComponent('main', {
  init: function () {
    var urlParams = this.getUrlParams();
    var defaultNumObjects = 5000;
    var numObjects = urlParams.numobjects || defaultNumObjects;
    this.cubeDistributionWidth = 100;
    for (var i = 0; i < numObjects; i++) {
      var cubeEl = document.createElement('a-entity');

      if (urlParams.component) {
        cubeEl.setAttribute(urlParams.component, '');
      }
      cubeEl.setAttribute('position', this.getRandomPosition());
      cubeEl.setAttribute('geometry', {primitive: 'box'});
      cubeEl.setAttribute('material', {color: this.getRandomColor(), shader: 'flat'});
      this.el.sceneEl.appendChild(cubeEl);
    }
  },

  getUrlParams: function () {
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
  },

  getRandomPosition: function () {
    var cubeDistributionWidth = this.cubeDistributionWidth;
    return {
      x: Math.random() * cubeDistributionWidth - cubeDistributionWidth / 2,
      y: Math.random() * cubeDistributionWidth - cubeDistributionWidth / 2,
      z: Math.random() * cubeDistributionWidth - cubeDistributionWidth
    };
  },

  getRandomColor: function () {
    return '#' + ('000000' + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
  }
});
