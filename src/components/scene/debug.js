import { registerComponent as register } from '../../core/component.js';

export var Component = register('debug', {
  schema: {default: true},
  sceneOnly: true
});
