/*
 *Usage:
 *        <a-entity  wearable="el: #leftHand; class: foo"></a-entity>
 *        <a-entity id="leftHand">
 *          <a-entity class="foo" position="0 0 0" rotation="0 0 0" scale="0 0 0"></a-entity>
 *        <a-entity>
 *
 * NOTE: you can hint different position/rotation-offsets by adding controller-specific entities to the target:
 *
 *        <a-entity id="leftHand">
 *          <a-entity class="foo" position="0 0 0" rotation="0 0 0" scale="0 0 0"></a-entity>
 *          <a-entity class="foo hand-tracking-controls" position="0 0 0" rotation="0 0 0" scale="0 0 0"></a-entity>
 *        <a-entity>
 *
 * The controllernames are hinted by the 'controllermodelready' event:
 *
 *  'hand-tracking-controls',
 *  'meta-touch-controls',
 *  'valve-index-controls',
 *  'logitech-mx-ink-controls',
 *  'windows-motion-controls',
 *  'hp-mixed-reality-controls',
 *  'generic-tracked-controller-controls',
 *  'pico-controls',
 *  (and more in the future)
 */

AFRAME.registerComponent('wearable', {
  schema:{
    el: {type:"selector"},
    class: {type:"string"}
  }, 
  init: function(){
    if( !this.data.el ) return console.warn(`wearable.js: cannot find ${this.data.el}`)
    this.controllers = {}
    this.remember()
    this.data.el.addEventListener('controllermodelready',  this.bindPlaceHolders.bind(this,["controllermodelready"]) )
    this.data.el.addEventListener('controllerconnected',   this.bindPlaceHolders.bind(this,["controllerconnected"] ) )
  },

  bindPlaceHolders: function(type,e){
    let controllerName = e.detail.name
    let selector       =  `.${this.data.class}.${controllerName}`
    let placeholder    = this.data.el.querySelector(selector) || this.data.el.querySelector(`${this.data.class}`)
    if( !placeholder ) return console.warn("wearable.js: could not find placeholder to attach to")
    this.attachPlaceHolder(type,e,placeholder, controllerName)
  },

  attachPlaceHolder: function(type, el, placeholder, controllerName){
    this.el.object3DMap = {} // unsync THREE <-> AFRAME entity
    placeholder.object3D.add( this.obj )
    if( controllerName != 'hand-tracking-controls' ){
      // re-add for controller-models which don't re-add children ('meta-touch-controls' e.g.)
      if( this.data.el.getObject3D("mesh") ){
        this.data.el.getObject3D("mesh").add(placeholder.object3D)
      }
    }
    // these are handled by the placeholder entity
    this.obj.position.set(0,0,0);
    this.obj.rotation.set(0,0,0);
    this.obj.scale.set(1,1,1);
  },

  detach: function(){
    this.el.setObject3D( this.obj.uuid, this.obj )
    this.el.object3D.position.copy( this.position )
    this.el.object3D.rotation.copy( this.rotation )
    this.el.object3D.scale.copy( this.scale )
  },

  remember: function(){
    this.obj      = this.el.object3D
    this.position = this.el.object3D.position.clone()
    this.rotation = this.el.object3D.rotation.clone()
    this.scale    = this.el.object3D.scale.clone()
    this.parent   = this.el.object3D.parent
  }

})

