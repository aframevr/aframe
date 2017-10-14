/* global AFRAME */
var registerSystem = require('../core/system').registerSystem;

var inputMappings = {};

/**
 * Input Mapping system
 */
module.exports.System = registerSystem('input-mapping', {
  mappings: {},
  mappingsPerControllers: {},
  loadedControllers: [],

  init: function () {
    var self = this;

    this.keyboardHandler = this.keyboardHandler.bind(this);

    this.sceneEl.addEventListener('inputmappingregistered', function () {
      self.removeControllersListeners();
      for (var i = 0; i < self.loadedControllers.length; i++) {
        var controllerObj = self.loadedControllers[i];
        self.updateControllersListeners(controllerObj);
      }
    });

    // Controllers
    this.sceneEl.addEventListener('controllerconnected', function (event) {
      var controllerObj = {
        name: event.detail.name,
        hand: event.detail.component.data.hand,
        element: event.detail.target,
        handlers: {}
      };
      self.loadedControllers.push(controllerObj);

      self.updateControllersListeners(controllerObj);
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

  removeControllerListeners: function (controller) {
    for (var eventName in controller.handlers) {
      var handler = controller.handlers[eventName];
      controller.element.removeEventListener(eventName, handler);
    }
    controller.handlers = {};
  },

  updateControllersListeners: function (controllerObj) {
    this.removeControllerListeners(controllerObj);

    if (!inputMappings) {
      console.warn('controller-mapping: No mappings defined');
      return;
    }

    var mappingsPerController = this.mappingsPerControllers[controllerObj.name] = {};

    // Create the listener for each event
    for (var mappingName in inputMappings) {
      var mapping = inputMappings[mappingName];

      var commonMappings = mapping.common;
      if (commonMappings) {
        this.updateMappingsPerController(commonMappings, mappingsPerController, mappingName);
      }

      var controllerMappings = mapping[controllerObj.name];
      if (controllerMappings) {
        this.updateMappingsPerController(controllerMappings, mappingsPerController, mappingName);
      } else {
        console.warn('controller-mapping: No mappings defined for controller type: ', controllerObj.name);
      }
    }

    for (var eventName in mappingsPerController) {
      var handler = function (event) {
        var mapping = mappingsPerController[event.type];
        var mappedEvent = mapping[AFRAME.currentMapping] ? mapping[AFRAME.currentMapping] : mapping.default;
        if (mappedEvent) {
          event.detail.target.emit(mappedEvent, event.detail);
        }
      };

      controllerObj.element.addEventListener(eventName, handler);
      controllerObj.handlers[eventName] = handler;
    }
  },

  keyboardHandler: function (event) {
    var mappings = inputMappings[AFRAME.currentMapping];

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
    for (var i = 0; i < this.loadedControllers.length; i++) {
      var controller = this.loadedControllers[i];
      this.removeControllerListeners(controller);
    }
    this.mappingsPerControllers = {};
  }
});

module.exports.registerInputMappings = function (mappings, override) {
  if (override || Object.keys(inputMappings).length === 0) {
    inputMappings = mappings;
  } else {
    for (var mappingName in mappings) {
      var mapping = mappings[mappingName];
      if (!inputMappings[mappingName]) {
        inputMappings[mappingName] = mapping;
        continue;
      }

      for (var controllerName in mapping) {
        var controllerMapping = mapping[controllerName];
        if (!inputMappings[mappingName][controllerName]) {
          inputMappings[mappingName][controllerName] = controllerMapping;
          continue;
        }

        for (var eventName in controllerMapping) {
          inputMappings[mappingName][controllerName][eventName] = controllerMapping[eventName];
        }
      }
    }
  }

  for (var i = 0; i < AFRAME.scenes.length; i++) {
    AFRAME.scenes[i].emit('inputmappingregistered');
  }
};
