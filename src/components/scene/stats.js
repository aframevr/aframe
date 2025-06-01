import Stats from 'stats-gl';
import { registerComponent } from '../../core/component.js';

var HIDDEN_CLASS = 'a-hidden';

registerComponent('stats', {
  schema: {default: true},

  sceneOnly: true,

  init: function () {
    this.stats = new Stats();
    this.stats.init(this.el.renderer);
    document.body.append(this.stats.dom);
  },

  tick: function () {
    if (this.data) {
      this.stats.update();
    }
  },

  update: function () {
    if (!this.stats) { return; }
    return (!this.data) ? this.hide() : this.show();
  },

  remove: function () {
    this.stats.dom.remove();
  },

  hide: function () {
    this.stats.dom.classList.add(HIDDEN_CLASS);
  },

  show: function () {
    this.stats.dom.classList.remove(HIDDEN_CLASS);
  }
});
