/* global AFRAME */
AFRAME.registerComponent('button', {
  init: function () {
    var buttonContainerEl = this.buttonContainerEl = document.createElement('div');
    var buttonWristEl = this.buttonWristEl = document.createElement('button');
    var buttonPalmEl = this.buttonPalmEl = document.createElement('button');

    var style = document.createElement('style');
    var css =
      '.a-button-container {box-sizing: border-box; display: inline-block; height: 34px; padding: 0;;' +
      'bottom: 20px; width: 200px; left: calc(50% - 75px); position: absolute; color: white;' +
      'font-size: 20px; line-height: 20px; border: none;' +
      'border-radius: 5px}' +
      '.a-button {cursor: pointer; padding: 0px 10px 0 10px; font-weight: bold; color: #666; border: 3px solid #666; box-sizing: border-box; vertical-align: middle; max-width: 200px; border-radius: 10px; height: 40px; background-color: white; margin: 0; margin-right: 10px;}' +
      '.a-button:hover {border-color: #ef2d5e; color: #ef2d5e}' +
      '.a-button.selected {color: white; background-color: #ef2d5e; border-color: #ef2d5e}';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);

    buttonContainerEl.classList.add('a-button-container');

    buttonPalmEl.classList.add('a-button');
    buttonPalmEl.classList.add('selected');
    buttonPalmEl.addEventListener('click', this.onClick.bind(this));
    buttonContainerEl.appendChild(buttonPalmEl);

    buttonWristEl.classList.add('a-button');
    buttonWristEl.addEventListener('click', this.onClick.bind(this));
    buttonContainerEl.appendChild(buttonWristEl);

    this.el.sceneEl.appendChild(buttonContainerEl);
    buttonWristEl.innerHTML = 'WRIST';
    buttonPalmEl.innerHTML = 'PALM';
  },

  onClick: function (evt) {
    if (evt.target === this.buttonPalmEl) {
      this.el.querySelector('[hand-menu]').setAttribute('hand-menu', 'location', 'palm');
      this.buttonPalmEl.classList.add('selected');
      this.buttonWristEl.classList.remove('selected');
    } else {
      this.el.querySelector('[hand-menu]').setAttribute('hand-menu', 'location', 'wrist');
      this.buttonPalmEl.classList.remove('selected');
      this.buttonWristEl.classList.add('selected');
    }
  }
});
