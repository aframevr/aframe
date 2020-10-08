/* global AFRAME */
AFRAME.registerComponent('button', {
  schema: {
    label: {default: 'label'},
    width: {default: 0.50},
    toggable: {default: false}
  },
  init: function () {
    var el = this.el;
    var labelEl = this.labelEl = document.createElement('a-entity');

    this.color = '#c96f47';
    this.hoverColor = '#0cc6b8';

    el.setAttribute('geometry', {
      primitive: 'box',
      width: this.data.width,
      height: 0.12,
      depth: 0.02
    });

    el.setAttribute('material', {color: this.color});
    el.setAttribute('pressable', '');

    labelEl.setAttribute('position', '0 0 0.01');
    labelEl.setAttribute('text', {
      value: this.data.label,
      color: 'white',
      align: 'center'
    });

    labelEl.setAttribute('scale', '1.5 1.5 1.5');
    this.el.appendChild(labelEl);

    this.bindMethods();

    el.addEventListener('mouseenter', this.onPressedStarted);
    el.addEventListener('mouseleave', this.onPressedEnded);
  },

  bindMethods: function () {
    this.onPressedStarted = this.onPressedStarted.bind(this);
    this.onPressedEnded = this.onPressedEnded.bind(this);
  },

  update: function (oldData) {
    if (oldData.label !== this.data.label) {
      this.labelEl.setAttribute('text', 'value', this.data.label);
    }
  },

  onPressedStarted: function () {
    this.el.setAttribute('material', {color: this.hoverColor});
  },

  onPressedEnded: function () {
    this.el.setAttribute('material', {color: this.color});
  }
});
