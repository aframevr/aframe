/* global AFRAME */
AFRAME.registerComponent('page-turn', {
  schema: {direction: {default: 'forward', oneOf: ['forward', 'backward']}},
  init: function () {
    this.pages = ['panel1', 'panel2', 'ghibli', 'bunny'];
    this.turnPage = this.turnPage.bind(this);
    this.el.addEventListener('click', this.turnPage);
  },

  turnPage: function () {
    var previousSrcEl;
    var srcEl;
    var layerEl = document.querySelector('[layer]');
    var pageNumber = this.pages.indexOf(layerEl.getAttribute('layer', 'src').src.id);
    pageNumber = this.data.direction === 'forward' ? pageNumber + 1 : pageNumber - 1;
    if (pageNumber < 0 || pageNumber === this.pages.length) { return; }
    layerEl.setAttribute('layer', 'src', '#' + this.pages[pageNumber]);
    srcEl = document.querySelector('#' + this.pages[pageNumber]);
    if (srcEl.tagName === 'VIDEO') { srcEl.play(); }
    if (previousSrcEl && previousSrcEl.tagName === 'VIDEO') { previousSrcEl.pause(); }
  }
});
