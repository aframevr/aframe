/* global AFRAME */
AFRAME.registerComponent('button', {
  init: function () {
    var buttonContainerEl = this.buttonContainerEl = document.createElement('div');
    var buttonEl = this.buttonEl = document.createElement('button');
    var style = document.createElement('style');
    var css =
      '.a-button-container {box-sizing: border-box; display: inline-block; height: 34px; padding: 0;;' +
      'bottom: 20px; width: 150px; left: calc(50% - 75px); position: absolute; color: white;' +
      'font-size: 12px; line-height: 12px; border: none;' +
      'border-radius: 5px}' +
      '.a-button {cursor: pointer; padding: 0px 10px 0 10px; font-weight: bold; color: #666; border: 3px solid #666; box-sizing: border-box; vertical-align: middle; max-width: 200px; border-radius: 10px; height: 34px; background-color: white; margin: 0;}' +
      '.a-button:hover {border-color: #ef2d5e; color: #ef2d5e}';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);

    buttonContainerEl.classList.add('a-button-container');
    buttonEl.classList.add('a-button');
    buttonEl.addEventListener('click', this.onClick.bind(this));

    buttonContainerEl.appendChild(buttonEl);

    this.el.sceneEl.appendChild(buttonContainerEl);
    buttonEl.innerHTML = 'NEXT PAINTING';
  },

  onClick: function () {

  }
});
