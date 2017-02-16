---
title: Introduction
section_title: Primitives
type: primitives
layout: docs
parent_section: docs
order: 1
section_order: 5
---

[component]: ../core/component.md
[entity]: ../core/entity.md

Primitives are [entities][entity] that:

- Have a semantic name (e.g., `<a-box>`)
- Have a preset assemblage of components
- Have default component property values
- Map HTML attributes to [component][component] properties

Primitives abstract the core API to:

- Pre-compose useful components together with prescribed defaults
- Act as a shorthand for complex-but-common types of entities (e.g., `<a-sky>`)
- Provide a familiar interface with HTML attributes mapping to only a single value

[prefab]: http://docs.unity3d.com/Manual/Prefabs.html

They are sort of like [Prefabs in Unity][prefab]. Some literature on the
entity-component-system pattern refer to these as *assemblages*.

<!--toc-->

## Example

Below is an assortment of primitives in use:

```html
<a-scene>
  <!-- Using the asset management system for caching. -->
  <a-assets>
    <a-asset-item id="fox-obj" src="fox.obj"></a-asset-item>
    <a-asset-item id="fox-mtl" src="fox.mtl"></a-asset-item>
    <img id="texture" src="texture.png">
    <video id="video" src="video.mp4"></video>
  </a-assets>

  <a-camera fov="80"><a-cursor></a-cursor></a-camera>
  <a-box src="#texture" depth="2" height="5" width="1"></a-box>
  <a-image src="fireball.jpg"></a-image>
  <a-video src="#video"></a-video>
  <a-sky color="#432FA0"></a-sky>
</a-scene>
```

## Primitives are Entities

[animations]: ../core/animations.md
[mixins]: ../core/mixins.md

Since every primitive extends `<a-entity>`s, primitives can do the same things
as entities such as:

- Positioning, rotating, and scaling
- Attaching [components][component] and [mixins][mixins]
- Applying [animations][animations]

For example, let's take `<a-box>` primitive, and say someone writes a
third-party physics component. We can attach it to `<a-box>` just as we would
with any entity:

```html
<a-box color="red" physics="mass: 2.4"></a-box>
```

## How They Work

To create a wide red box using the primitives API, we could write:

```html
<a-box color="red" width="3"></a-box>
```

Which ends up expanding to:

```html
<a-entity geometry="primitive: box; width: 3" material="color: red"></a-entity>
```

Under the hood, we see that primitives *extend* `<a-entity>` as a custom
element while providing some defaults. It defaults the `geometry.primitive`
property to `box`. And it *maps* (i.e., proxies) the HTML `width` attribute to
the underlying `geometry.width` property and the HTML `color` attribute to the
underlying `material.color` property.

## Register a Primitive

We can compose and register our own primitives (i.e., register an element) for
other people to easily use.

For example, here is what the registration looks like for `<a-box>` primitive:

```js
var extendDeep = AFRAME.utils.extendDeep;

// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('a-box', extendDeep({}, meshMixin, {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    geometry: {primitive: 'box'}
  },

  // Defined mappings from HTML attributes to component properties (using dots as delimiters). If we set `depth="5"` in HTML, then the primitive will automatically set `geometry="depth: 5"`.
  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
}));
```

[aframe-extras]: https://github.com/donmccurdy/aframe-extras

For example, Don McCurdy's [aframe-extras][aframe-extras] creates `<a-ocean>`
primitive using his ocean component:

```js
AFRAME.registerPrimitive('a-ocean', {
  // Attaches the ocean component by default.
  // And smartly makes the ocean parallel to the ground.
  defaultComponents: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0}
  },

  // Maps HTML attributes to his ocean component's properties.
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});
```

Then we'd be able to create oceans using basic HTML syntax with little configuration needed:

```html
<a-ocean color="aqua" depth="100" width="100"></a-ocean>
```
