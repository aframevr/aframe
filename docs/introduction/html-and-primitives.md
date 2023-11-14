---
title: "HTML & Primitives"
type: introduction
layout: docs
order: 4
examples: []
---

[component]: ../core/component.md
[entity]: ../core/entity.md

[dom]: https://developer.mozilla.org/docs/Web/API/Document_Object_Model
[html]: https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML/Getting_started

This section will go over the concepts of A-Frame's primitive elements and
their relation to the entity-component framework. If you're looking for a guide
on using HTML and primitives, [check out the *Building a Basic Scene*
guide](../guides/building-a-basic-scene.md).

<!--toc-->

## HTML

A-Frame is based on top of [HTML][html] and [the DOM][dom] using a polyfill for
Custom Elements. HTML is the building block of the Web, providing one of the
most accessible computing languages around. There are no installations or build
steps required, creating with HTML involves just text in an HTML file and
opening the HTML file in a browser. Since most of the Web was built on top of
HTML, most existing tools and libraries work with A-Frame including React,
Vue.js, Angular, d3.js, and jQuery.

![HTML Scene](https://user-images.githubusercontent.com/674727/52090525-79b04d80-2566-11e9-993f-7a8b19ca25b1.png)

If you don't have too much experience with HTML, no problem! It's fairly easy
to pick up and perhaps even easier to grasp than 2D HTML. Once you pick up the
general structure or syntax of HTML (opening tag, attributes, closing tag),
then you're good to go! [Read an introduction to HTML on MDN][html].

![HTML](https://user-images.githubusercontent.com/6694476/27047689-94689672-4fc6-11e7-9cf5-828a508c6522.jpg)

## Primitives

While the HTML layer looks basic, HTML and the DOM are only the outermost
abstraction layer of A-Frame. Underneath, A-Frame is an entity-component
framework for three.js that is exposed declaratively.

A-Frame provides a handful of elements such as `<a-box>` or `<a-sky>` called
*primitives* that wrap the entity-component pattern to make it appealing for
beginners. At the bottom of the documentation navigation sidebar, we can see
every primitive that A-Frame provides out of the box. Developers can create
their own primitives as well.

## Example

Below is the *Hello, WebVR* example that uses a few basic primitives. A-Frame
provides primitives to create meshes, render 360&deg; content, customize the
environment, place the camera, etc.

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

### Under the Hood

Primitives act as a convenience layer (i.e., syntactic sugar) primarily for
newcomers. Keep in mind for now that primitives are `<a-entity>`s under the
hood that:

- Have a semantic name (e.g., `<a-box>`)
- Have a preset bundle of components with default values
- Map or proxy HTML attributes to [component][component] data

[assemblage]: http://vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript
[prefab]: http://docs.unity3d.com/Manual/Prefabs.html

Primitives are similar to [prefabs in Unity][prefab]. Some literature on the
entity-component-system pattern refer to them as [assemblages][assemblage].
They abstract the core entity-component API to:

- Pre-compose useful components together with prescribed defaults
- Act as a shorthand for complex-but-common types of entities (e.g., `<a-sky>`)
- Provide a familiar interface for beginners since A-Frame takes HTML in a new direction

Under the hood, this `<a-box>` primitive:

```html
<a-box color="red" width="3"></a-box>
```

represents this entity-component form:

```html
<a-entity geometry="primitive: box; width: 3" material="color: red"></a-entity>
```

`<a-box>` defaults the `geometry.primitive` property to `box`. And the
primitive maps the HTML `width` attribute to the underlying `geometry.width`
property as well as the HTML `color` attribute to the underlying
`material.color` property.

## Attaching Components to Primitives

[animations]: ../core/animations.md
[mixins]: ../core/mixins.md

Primitives are just `<a-entity>`s under the hood. This means primitives have
the same API as entities such as positioning, rotating, scaling, and attaching
components.

### Example

Let's attach community physics components to primitives. We include the source
for [Don McCurdy's
`aframe-physics-system`](https://github.com/n5ro/aframe-physics-system) and attach
the physics components via HTML attributes:

> :warning: **If you are using A-Frame 1.5.0 or later**: [`aframe-physics-system`](https://github.com/donmccurdy/aframe-physics-system)
> and you're having issues, make sure you're using THREE.BufferGeometry, not  the
> [now-deprecated THREE.Geometry](https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401).
> Recent versions of three.js rename generators such as PlaneBufferGeometry to just [PlaneGeometry](https://threejs.org/docs/#api/en/geometries/PlaneGeometry),
> but support the old name as an alias. More info on [this GitHub issue](https://github.com/n5ro/aframe-physics-system/issues/187).

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-physics-system@1.5.0/dist/aframe-physics-system.min.js"></script>
  </head>
  <body>
    <a-scene physics>
      <a-box position="-1 4 -3" rotation="0 45 0" color="#4CC3D9" dynamic-body></a-box>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4" static-body></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

## Registering a Primitive

We can register our own primitives (i.e., register an element) using
`AFRAME.registerPrimitive(name, definition)`. `name` is a string and must contain a dash (i.e. `'a-foo'`). `definition` is a JavaScript
object defining these properties:

| Property          | Description                                                                                                                                                                                                                                                                               | Example                          |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| defaultComponents | Object specifying default components of the primitive. The keys are the components' names and the values are the components' default data.                                                                                                                                                | `{geometry: {primitive: 'box'}}`
| mappings          | Object specifying mapping between HTML attribute name and component property names. Whenever the HTML attribute name is updated, the primitive will update the corresponding component property. The component property is defined using a dot syntax `${componentName}.${propertyName}`. | `{depth: 'geometry.depth', height: 'geometry.height', width: 'geometry.width'}`

### Example

For example, below is A-Frame's registration for the `<a-box>` primitive:

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

  // Defined mappings from HTML attributes to component properties (using dots as delimiters).
  // If we set `depth="5"` in HTML, then the primitive will automatically set `geometry="depth: 5"`.
  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
}));
```

[aframe-extras]: https://github.com/donmccurdy/aframe-extras

For example, Don McCurdy's [`aframe-extras`][aframe-extras] package includes an
`<a-ocean>` primitive that wraps his `ocean` component. Here is the definition
for `<a-ocean>`.

```js
AFRAME.registerPrimitive('a-ocean', {
  // Attaches the `ocean` component by default.
  // Defaults the ocean to be parallel to the ground.
  defaultComponents: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0}
  },

  // Maps HTML attributes to the `ocean` component's properties.
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});
```

With the `<a-ocean>` primitive registered, we'd be able to create oceans using
a line of traditional HTML:

```html
<a-ocean color="aqua" depth="100" width="100"></a-ocean>
```
