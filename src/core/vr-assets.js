/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  var proto = Object.create(
    HTMLElement.prototype, {
      createdCallback: {
        value: function() {
          this.attachEventListeners();
        }
      },

      attachEventListeners: {
        value: function() {
          var self = this;
          var assetLoaded = this.assetLoaded.bind(this);
          this.assetsPending = 0;
          traverseDOM(this);
          function traverseDOM(node) {
            // We should be checking for the prototype like this
            // if (VRNode.prototype.isPrototypeOf(node))
            // Safari and Chrome doesn't seem to have the proper
            // prototype attached to the node before the createdCallback
            // function is called. To determine that an element is a VR
            // related node we check if the tag has been registered as such
            // during the element registration. This is fragile. We have to
            // understand why the behaviour between firefox and the other browsers
            // is not consistent. Firefox is the only one that behaves as one
            // expects: The nodes have the proper prototype attached to them at
            // any time during their lifecycle.
            if (VRTags[node.tagName]) {
              attachEventListener(node);
              self.assetsPending++;
            }
            node = node.firstChild;
            while (node) {
              traverseDOM(node);
              node = node.nextSibling;
            }
          }
          function attachEventListener(node) {
            node.addEventListener('loaded', assetLoaded);
          }
        }
      },

      assetLoaded: {
        value: function() {
          this.assetsPending--;
          if (this.assetsPending === 0) {
            this.load();
          }
        }
      },

      load: {
        value: function() {
          // To prevent emmitting the loaded event more than once
          if (this.hasLoaded) { return; }
          var event = new Event('loaded');
          this.hasLoaded = true;
          this.dispatchEvent(event);
        }
      }
    }
  );

  // Registering element and exporting prototype
  module.exports = document.registerElement('vr-assets', { prototype: proto });

});})(typeof define==='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module==='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRAssets',this));