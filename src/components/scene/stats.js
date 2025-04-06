import Stats from 'stats-gl';
import { registerComponent } from '../../core/component.js';

registerComponent('stats', {
  schema: {default: true},
  sceneOnly: true,
  init: function () {
    this.stats = new Stats();
    this.stats.init(this.el.renderer);
    document.body.append(this.stats.dom);
  },
  tick: function () {
    this.stats.update();
  }
});
