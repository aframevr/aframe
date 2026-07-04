---
title: <a-material>
type: primitives
layout: docs
parent_section: primitives
source_code: src/core/a-material.js
---

[assets]: ../core/asset-management-system.md
[material]: ../components/material.md
[shaders]: ../components/material.md#built-in-materials

The material asset element defines a reusable material within the [asset
management system][assets]. The material (and its textures) is created during
scene loading and the same `THREE.Material` instance can then be shared by any
number of entities through the [material component][material]'s `material`
property or through the `material` property type.

Sharing a single material instance saves memory, avoids duplicate shader
compilations and texture uploads at runtime, and reduces material switching
in the renderer.

## Example

```html
<a-scene>
  <a-assets>
    <img id="wood-texture" src="wood.png">
    <a-material id="wood" src="#wood-texture" roughness="0.8"></a-material>
    <a-material id="red" shader="flat" color="red"></a-material>
  </a-assets>

  <!-- Both boxes share the exact same THREE.Material instance. -->
  <a-box position="-1 1 -3" material="material: #wood"></a-box>
  <a-box position="1 1 -3" material="material: #wood"></a-box>
  <a-sphere position="0 2 -3" material="material: #red"></a-sphere>
</a-scene>
```

## Attributes

The `shader` attribute selects the shader to create the material with (e.g.,
`standard`, `flat` or any registered custom shader), defaulting to
`standard`. All other attributes follow the [material component][material]
base properties and the properties of the selected [shader][shaders], defined
as individual HTML attributes:

```html
<a-material id="hologram" shader="flat" color="#08f" opacity="0.5"
            side="double" transparent="true"></a-material>
```

Attribute names are matched case-insensitively against the schema, so
camelCase properties can be written as-is or hyphen-free lowercase (e.g.,
`normalMap` or `normalmap`).

Changing an attribute after creation updates the shared material for every
entity using it. The `shader` attribute cannot be changed after creation.

## Referencing a Material

Entities reference the material asset via the material component's `material`
property:

```html
<a-entity geometry="primitive: box" material="material: #wood"></a-entity>
```

When the `material` property is set, all other material component properties
are ignored; the material is entirely defined by the `<a-material>` asset.
Removing the reference (e.g., `el.setAttribute('material', 'material', '')`)
makes the entity manage its own material again.

Components can also declare a property of type `material` in their schema to
receive the `THREE.Material` instance directly:

```js
AFRAME.registerComponent('my-component', {
  schema: {
    highlightMaterial: {type: 'material'}
  },
  update: function () {
    // this.data.highlightMaterial is a THREE.Material or null.
  }
});
```

```html
<a-entity my-component="highlightMaterial: #red"></a-entity>
```

## Lifecycle

The scene waits for `<a-material>` elements (including their textures) to
load before rendering, like other assets. Removing the `<a-material>` element
from the DOM disposes the material and its textures.
