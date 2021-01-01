/* global AFRAME */
AFRAME.registerComponent('info-message', {
  schema: {
    htmlSrc: {type: 'selector'},
    startOpened: {default: false},
    width: {default: 400},
    height: {default: 320}
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
    messageEl.addEventListener('click', function (evt) { evt.stopPropagation(); });
  },

  update: function () {
    var messageEl = this.messageEl;
    messageEl.innerHTML = this.data.htmlSrc.data;
    messageEl.appendChild(this.closeButtonEl);
  },

  addStyles: function () {
    var css =
      '.a-info-message{border-radius: 10px; position: absolute; width: ' + this.data.width + 'px;' +
      'height: ' + this.data.height + 'px; background-color: white; border: 3px solid rgba(0,0,0,0.65);' +
      'bottom: 22px; left: 22px; color: rgb(51, 51, 51); padding: 20px 15px 0 15px;' +
      'font-size: 11pt; line-height: 20pt; z-index: 9999}' +

      '.a-info-message a{border-bottom: 1px solid rgba(53,196,232,.15); color: #1497b8;' +
      'position: relative; text-decoration: none; transition: .05s ease;}' +

      '@media only screen and (min-width: 1200px) {' +
      '.a-info-message {font-size: 12pt}}' +

      '@media only screen and (max-width: 600px) {' +
      '.a-info-message {left: 20px; right: 20px; bottom: 60px; width: auto}}' +

      '@media only screen and (max-height: 600px) {' +
      '.a-info-message {left: 20px; bottom: 20px; height: 250px}}' +

      '.a-close-button-info{width: 25px; height: 25px; padding: 0;' +
      'top: 10px; right: 10px; position: absolute; color: white;' +
      'font-size: 12px; line-height: 12px; border: none; background-color: #ef2d5e;' +
      'border-radius: 5px; font-weight: medium}' +

      '.a-close-button-info:hover{background-color: #b32146; color: white}' +
      '.a-info-message-container {position: absolute; left: 100px; bottom: 20px;}' +
      '.a-info-message-button {background: rgba(0, 0, 0, 0.35) ' + this.infoMessageButtonDataURI + ' 50% 50% no-repeat;}' +
      '.a-info-message-button {background-size: 92% 90%; border: 0; bottom: 0; cursor: pointer; min-width: 78px; min-height: 34px; padding-right: 0; padding-top: 0; position: absolute; right: 0; transition: background-color .05s ease; -webkit-transition: background-color .05s ease; z-index: 9999; border-radius: 8px; touch-action: manipulation;}' +
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
    if (display === 'none') {
      this.el.emit('infomessageclosed');
    } else {
      this.el.emit('infomessageopened');
    }
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

  infoMessageButtonDataURI: 'url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMyIgZGF0YS1uYW1lPSJMYXllciAzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iNjIiIHZpZXdCb3g9IjAgMCAxNTAgNjIiPjxwYXRoIGQ9Ik0xMzgsMEgxMkExMi4wMzUsMTIuMDM1LDAsMCwwLDAsMTJWNTBBMTIuMDM1LDEyLjAzNSwwLDAsMCwxMiw2MkgxMzhhMTIuMDM1LDEyLjAzNSwwLDAsMCwxMi0xMlYxMkExMi4wMzUsMTIuMDM1LDAsMCwwLDEzOCwwWk0zNi4yMTIsNDYuMDQzSDI5di0zMGg3LjIxMlptMzAuODQzLDBINTkuODY0TDQ5LjIzMiwyNy4zNzVWNDYuMDQzSDQydi0zMGg3LjIzMkw1OS44NDMsMzQuNzExVjE2LjA0M2g3LjIxMlpNOTMuMDcsMjEuNjI3SDgwLjIzNHY2LjlIOTEuOXY1LjU2M0g4MC4yMzRWNDYuMDQzSDczdi0zMEg5My4wN1pNMTIzLjQsMzEuNjY1YTE3LjgsMTcuOCwwLDAsMS0xLjYzNyw3LjgxMiwxMi4xMDgsMTIuMTA4LDAsMCwxLTQuNjUyLDUuMjMyLDEyLjk1MSwxMi45NTEsMCwwLDEtNi44NywxLjgzNCwxMy4xMzgsMTMuMTM4LDAsMCwxLTYuODM4LTEuNzcyLDEyLjA4MSwxMi4wODEsMCwwLDEtNC42NTItNS4wNjZBMTcuMjgxLDE3LjI4MSwwLDAsMSw5NywzMi4xNDF2LTEuN2ExNy44NTksMTcuODU5LDAsMCwxLDEuNjI3LTcuODIyLDEyLjA2NywxMi4wNjcsMCwwLDEsNC42NjItNS4yMzMsMTMuOCwxMy44LDAsMCwxLDEzLjc0OS0uMDIxLDEyLjI4OSwxMi4yODksMCwwLDEsNC42NzMsNS4xOTEsMTcuMzYyLDE3LjM2MiwwLDAsMSwxLjY4OSw3LjcxOVoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTEwLjIsMjEuMjQxcS01LjQ3MSwwLTUuNzgyLDguMjA2bC0uMDIsMi4yMThhMTMuMDQ3LDEzLjA0NywwLDAsMCwxLjQ3MSw2LjgxNyw0LjgxMSw0LjgxMSwwLDAsMCw0LjM3MiwyLjM4Myw0Ljc1Miw0Ljc1MiwwLDAsMCw0LjI0OC0yLjM0MUExMi42OTEsMTIuNjkxLDAsMCwwLDExNiwzMS43ODlWMzAuNHEwLTQuNS0xLjUtNi44MjhBNC44MjEsNC44MjEsMCwwLDAsMTEwLjIsMjEuMjQxWiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==)'

});
