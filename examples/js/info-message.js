/* global AFRAME */
AFRAME.registerComponent('info-message', {
  schema: {
    htmlSrc: {type: 'selector'},
    startOpened: {default: false}
  },
  init: function () {
    var sceneEl = this.el.sceneEl;
    var messageEl = this.messageEl = document.createElement('div');
    var startOpened = this.data.startOpened;
    this.toggleInfoMessage = this.toggleInfoMessage.bind(this);

    messageEl.classList.add('a-info-message');
    messageEl.setAttribute('aframe-injected', '');

    var closeButtonEl = this.closeButtonEl = document.createElement('button');
    closeButtonEl.innerHTML = 'X';
    closeButtonEl.classList.add('a-close-button-info');
    closeButtonEl.onclick = this.toggleInfoMessage;

    this.createInfoButton(this.toggleInfoMessage);

    this.addStyles();
    sceneEl.appendChild(messageEl);

    this.messageEl.style.display = startOpened ? '' : 'none';
    this.infoButton.style.display = startOpened ? 'none' : '';
  },

  update: function () {
    var messageEl = this.messageEl;
    messageEl.innerHTML = this.data.htmlSrc.data;
    messageEl.appendChild(this.closeButtonEl);
  },

  addStyles: function () {
    var css =
      '.a-info-message{border-radius: 10px; position: absolute; width: 400px;' +
      'height: 250px; background-color: white; border: 3px solid rgba(0,0,0,.75);' +
      'bottom: 22px; left: 22px; color: rgb(51, 51, 51); padding: 20px 15px 0 15px;' +
      'font-size: 12pt; line-height: 20pt;}' +

      '.a-info-message a{border-bottom: 1px solid rgba(53,196,232,.15); color: #1497b8;' +
      'position: relative; text-decoration: none; transition: .05s ease;}' +

      '@media only screen and (max-width: 600px) {' +
      '.a-info-message {left: 20px; right: 20px; bottom: 60px; width: auto}}' +

      '.a-close-button-info{width: 25px; height: 25px; padding: 0;' +
      'top: 10px; right: 10px; position: absolute; color: white;' +
      'font-size: 12px; line-height: 12px; border: none; background-color: #ef2d5e;' +
      'border-radius: 5px; font-weight: medium}' +

      '.a-close-button-info:hover{background-color: #b32146; color: white}' +
      '.a-info-message-container {position: absolute; left: 80px; bottom: 20px;}' +
      '.a-info-message-button {background: rgba(0, 0, 0, 0.20) ' + this.infoMessageButtonDataURI + ' 50% 50% no-repeat;}' +
      '.a-info-message-button {background-size: 90% 90%; border: 0; bottom: 0; cursor: pointer; min-width: 58px; min-height: 34px; padding-right: 0; padding-top: 0; position: absolute; right: 0; transition: background-color .05s ease; -webkit-transition: background-color .05s ease; z-index: 9999; border-radius: 8px; touch-action: manipulation;}' +
      '.a-info-message-button:active, .a-info-message-button:hover {background-color: #ef2d5e;}';
    var style = document.createElement('style');

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName('head')[0].appendChild(style);
  },

  toggleInfoMessage: function () {
    var display = this.messageEl.style.display;
    this.infoButton.style.display = display;
    display = display === 'none' ? '' : 'none';
    this.messageEl.style.display = display;
  },

  createInfoButton: function (onClick) {
    var infoButton;
    var wrapper;

    // Create elements.
    wrapper = document.createElement('div');
    wrapper.classList.add('a-info-message-container');
    this.infoButton = infoButton = document.createElement('button');
    infoButton.className = 'a-info-message-button';
    infoButton.setAttribute('title', 'Information about this experience');
    // Insert elements.
    wrapper.appendChild(infoButton);
    infoButton.addEventListener('click', function (evt) {
      onClick();
      evt.stopPropagation();
    });
    this.el.sceneEl.appendChild(wrapper);
  },

  infoMessageButtonDataURI: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMYAAABvCAYAAAC3iL97AAAACXBIWXMAAAsTAAALEwEAmpwYAAAGTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTExLTE5VDEyOjMyOjQwLTA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTExLTE5VDEyOjMyOjQwLTA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0xMS0xOVQxMjozMjo0MC0wODowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjNGVjZjVjYy05Mzc0LTE0NGMtYTE3MS1lYTgwYTM1ODViZTIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpkYWRlNDQxZC03YmZhLTdkNDEtYjZkNC0zZmQyNmJmNDRmNmMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3Nzc5NWUxYi03MjAwLTRmNDYtYTM3Yi0xMDQ3M2FkMTlkZTMiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3Nzc5NWUxYi03MjAwLTRmNDYtYTM3Yi0xMDQ3M2FkMTlkZTMiIHN0RXZ0OndoZW49IjIwMjAtMTEtMTlUMTI6MzI6NDAtMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4yIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzRlY2Y1Y2MtOTM3NC0xNDRjLWExNzEtZWE4MGEzNTg1YmUyIiBzdEV2dDp3aGVuPSIyMDIwLTExLTE5VDEyOjMyOjQwLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDxwaG90b3Nob3A6VGV4dExheWVycz4gPHJkZjpCYWc+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iSU5GTyIgcGhvdG9zaG9wOkxheWVyVGV4dD0iSU5GTyIvPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOlRleHRMYXllcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+vO3K4AAABtVJREFUeJzt3cFrHGUcxvFvUpG9SLqCQcSDbP0DLPHQmwcjggfBQwRv0tIExJOXxIsIgmxvXjy0pSIIig0IIgiSQI9ekkM924Be1AS6tgU92fHwzmRnd9/szrwz77yz+z4f2CZpNrNvNvPs7zcz78wuJUlCDa4C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)'

});
