/**
 * Update `material.map` given `data.src`. For standard and flat shaders.
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
module.exports.updateMap = function (shader, data) {
  var el = shader.el;
  var material = shader.material;
  var src = data.src;

  if (src) {
    if (src === shader.textureSrc) { return; }
    // Texture added or changed.
    shader.textureSrc = src;
    el.sceneEl.systems.texture.loadTexture(src, {src: src, repeat: data.repeat}, setMap);
    return;
  }

  // Texture removed.
  if (!material.map) { return; }
  setMap(null);

  function setMap (texture) {
    material.map = texture;
    material.needsUpdate = true;
    handleTextureEvents(el, texture);
  }
};

/**
 * Emit event on entities on texture-related events.
 *
 * @param {Element} el - Entity.
 * @param {object} texture - three.js Texture.
 */
function handleTextureEvents (el, texture) {
  if (!texture) { return; }

  el.emit('material-texture-loaded', {src: texture.image, texture: texture});

  // Video events.
  if (texture.image.tagName !== 'VIDEO') { return; }
  texture.image.addEventListener('loadeddata', function emitVideoTextureLoadedDataAll () {
    el.emit('material-video-loadeddata', {src: texture.image, texture: texture});
  });
  texture.image.addEventListener('ended', function emitVideoTextureEndedAll () {
    // Works for non-looping videos only.
    el.emit('material-video-ended', {src: texture.image, texture: texture});
  });
}
module.exports.handleTextureEvents = handleTextureEvents;
