var registerComponent = require('../core/component').registerComponent;
var GRADIOCLIENT = require('../lib/gradio');

/**
 * AI model loader.
 */
module.exports.Component = registerComponent('ai-model', {
  schema: {
    prompt: {type: 'string', default: 'robot'},
    api: {type: 'string', oneOf: ['perflow']},
    key: {type: 'string', default: ''}
  },

  init: function () {
    this.generateAndRender(this.data.prompt);
  },

  update: function () {

  },

  generateAndRender: async function generateAndRender (prompt) {
    var modelEl = document.createElement('a-entity');
    modelEl.setAttribute('position', '0 1.6 -2');
    modelEl.setAttribute('rotation', '0 180 0');
    var app = await GRADIOCLIENT('hansyan/perflow-triposr', {});
    var result = await app.predict(
        '/render',
        (await app.predict('/generate', [prompt, '0'])).data
    );
    console.log('Model URL: ' + result.data[0].url);
    modelEl.setAttribute('obj-model', {obj: result.data[0].url});
    this.el.sceneEl.appendChild(modelEl);
  }
});
