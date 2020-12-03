/* global AFRAME */
AFRAME.registerComponent('page-turn', {
  schema: {direction: {default: 'forward', oneOf: ['forward', 'backward']}},
  init: function () {
    this.pages = ['panel', 'ghibli', 'bunny'];
    this.turnPage = this.turnPage.bind(this);
    this.el.addEventListener('click', this.turnPage);
    this.layerEl = document.querySelector('[layer]');
  },

  tick: function () {
    var direction = this.data.direction;
    var pageNumber = this.pages.indexOf(this.layerEl.getAttribute('layer', 'src').src.id);
    this.el.object3D.visible = direction === 'forward' && pageNumber !== this.pages.length - 1 ||
      direction === 'backward' && pageNumber !== 0;
  },

  turnPage: function () {
    var layerEl = this.layerEl;
    var srcEl;
    var pageNumber = this.pages.indexOf(layerEl.getAttribute('layer', 'src').src.id);
    var previousSrcEl = layerEl.getAttribute('layer', 'src').src;
    pageNumber = this.data.direction === 'forward' ? pageNumber + 1 : pageNumber - 1;
    if (pageNumber < 0 || pageNumber === this.pages.length) { return; }
    layerEl.setAttribute('layer', 'src', '#' + this.pages[pageNumber]);
    srcEl = document.querySelector('#' + this.pages[pageNumber]);
    if (srcEl.tagName === 'VIDEO') { srcEl.play(); }
    if (previousSrcEl && previousSrcEl.tagName === 'VIDEO') { previousSrcEl.pause(); }
  }
});
