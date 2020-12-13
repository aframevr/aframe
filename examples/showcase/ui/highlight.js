/* global AFRAME */
AFRAME.registerComponent('highlight', {
  init: function () {
    let buttonEls = this.buttonEls = this.el.querySelectorAll('.menu-button');
    let backgroundEl = document.querySelector('#background');
    this.onClick = this.onClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.reset = this.reset.bind(this);
    backgroundEl.addEventListener('click', this.reset);
    for (let i = 0; i < buttonEls.length; ++i) {
      buttonEls[i].addEventListener('mouseenter', this.onMouseEnter);
      buttonEls[i].addEventListener('mouseleave', this.onMouseLeave);
      buttonEls[i].addEventListener('click', this.onClick);
    }
  },

  onClick: function (evt) {
    evt.target.pause();
    evt.target.setAttribute('material', 'color', '#046de7');
    this.el.addState('clicked');
    evt.target.object3D.scale.set(1.2, 1.2, 1.2);
  },

  onMouseEnter: function (evt) {
    let buttonEls = this.buttonEls;
    evt.target.setAttribute('material', 'color', '#046de7');
    for (let i = 0; i < buttonEls.length; ++i) {
      if (evt.target === buttonEls[i]) { continue; }
      buttonEls[i].setAttribute('material', 'color', 'white');
    }
  },

  onMouseLeave: function (evt) {
    if (this.el.is('clicked')) { return; }
    evt.target.setAttribute('material', 'color', 'white');
  },

  reset: function () {
    let buttonEls = this.buttonEls;
    for (let i = 0; i < buttonEls.length; ++i) {
      this.el.removeState('clicked');
      buttonEls[i].play();
      buttonEls[i].emit('mouseleave');
    }
  }
});
