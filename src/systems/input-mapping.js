/* global AFRAME */
var registerSystem = require('../core/system').registerSystem;

AFRAME.currentMapping = 'default';
AFRAME.inputMappings = {};

/**
 * Input Mapping component for A-Frame.
 */
module.exports.System = registerSystem('input-mapping', {
  schema: {},

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  mappings: {},
  mappingsPerControllers: {},
  _handlers: {},

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var self = this;

    this.keyboardHandler = this.keyboardHandler.bind(this);

    this.sceneEl.addEventListener('inputmappingregistered', function () {
      // @todo React to dynamic input mappings after the controllers has been registered
    });

    // Controllers
    this.sceneEl.addEventListener('controllerconnected', function (event) {
      self.updateControllersListeners(event);
    });

    // Keyboard
    this.addKeyboardListeners();
  },

  addKeyboardListeners: function () {
    document.addEventListener('keyup', this.keyboardHandler);
    document.addEventListener('keydown', this.keyboardHandler);
    document.addEventListener('keypress', this.keyboardHandler);
  },

  removeKeyboardListeners: function () {
    document.removeEventListener('keyup', this.keyboardHandler);
    document.removeEventListener('keydown', this.keyboardHandler);
    document.removeEventListener('keypress', this.keyboardHandler);
  },

  updateControllersListeners: function (event) {
    if (!AFRAME.inputMappings) {
      console.warn('controller-mapping: No mappings defined');
      return;
    }

    for (var mappingName in AFRAME.inputMappings) {
      var mapping = AFRAME.inputMappings[mappingName];
      var controllerType = event.detail.name;

      if (!this.mappingsPerControllers[controllerType]) {
        this.mappingsPerControllers[controllerType] = {};
      }

      var mappingsPerController = this.mappingsPerControllers[controllerType];

      var commonMappings = mapping.common;
      if (commonMappings) {
        this.updateMappingsPerController(commonMappings, mappingsPerController, mappingName);
      }

      var controllerMappings = mapping[controllerType];
      if (controllerMappings) {
        this.updateMappingsPerController(controllerMappings, mappingsPerController, mappingName);
      } else {
        console.warn('controller-mapping: No mappings defined for controller type: ', controllerType);
      }
    }

    // Create the listener for each event
    this.removeControllersListeners();

    for (var eventName in mappingsPerController) {
      var key = controllerType + '->' + eventName;
      if (!this._handlers[key]) {
        var handler = function (event) {
          var mapping = mappingsPerController[event.type];
          var mappedEvent = mapping[AFRAME.currentMapping] ? mapping[AFRAME.currentMapping] : mapping.default;
          if (mappedEvent) {
            event.detail.target.emit(mappedEvent, event.detail);
          }
        };
        event.detail.target.addEventListener(eventName, handler);
        this._handlers[key] = handler;
      }
    }
  },

  keyboardHandler: function (event) {
    var mappings = AFRAME.inputMappings[AFRAME.currentMapping];

    if (mappings && mappings.keyboard) {
      mappings = mappings.keyboard;
      var key = event.keyCode === 32 ? 'Space' : event.key;
      var keyEvent = (key + '_' + event.type.substr(3)).toLowerCase();
      var mapEvent = mappings[keyEvent];
      if (mapEvent) {
        this.sceneEl.emit(mapEvent);
      }
    }
  },

  updateMappingsPerController: function (mappings, mappingsPerController, mappingName) {
    // Generate a mapping for each controller: (Eg: vive-controls.triggerdown.default.paint)
    for (var eventName in mappings) {
      var mapping = mappings[eventName];
      if (!mappingsPerController[eventName]) {
        mappingsPerController[eventName] = {};
      }
      mappingsPerController[eventName][mappingName] = mapping;
    }
  },

  removeControllersListeners: function () {
    for (var controllerType in this.mappingsPerControllers) {
      var mappingPerController = this.mappingsPerControllers[controllerType];
      for (var eventName in mappingPerController) {
        var key = controllerType + '->' + eventName;
        this.sceneEl.removeEventListener(eventName, this._handlers[key]);
      }
    }

    this._handlers = {};
    this.mappingsPerControllers = {};
  }

});

AFRAME.registerInputMappings = function (mappings, override) {
  if (override || Object.keys(AFRAME.inputMappings).length === 0) {
    AFRAME.inputMappings = mappings;
  } else {
    for (var mappingName in mappings) {
      var mapping = mappings[mappingName];
      if (!AFRAME.inputMappings[mappingName]) {
        AFRAME.inputMappings[mappingName] = mapping;
        continue;
      }

      for (var controllerName in mapping) {
        var controllerMapping = mapping[controllerName];
        if (!AFRAME.inputMappings[mappingName][controllerName]) {
          AFRAME.inputMappings[mappingName][controllerName] = controllerMapping;
          continue;
        }

        for (var eventName in controllerMapping) {
          AFRAME.inputMappings[mappingName][controllerName][eventName] = controllerMapping[eventName];
        }
      }
    }
  }

  for (var i = 0; i < AFRAME.scenes.length; i++) {
    AFRAME.scenes[i].emit('inputmappingregistered');
  }
};

if (AFRAME.DEFAULT_INPUT_MAPPINGS) {
  AFRAME.registerInputMappings(AFRAME.DEFAULT_INPUT_MAPPINGS);
}
