---
title: Introduction
section_title: Primitives
type: primitives
layout: docs
parent_section: docs
order: 1
section_order: 4
---

Primitives alias A-Frame [entities](../core/entity.md) and map HTML attributes to [component](../core/component.md) properties. They are a convenience layer on top of the core API and are meant to:

- Ease us into the concept of the [entity-component-system](../core/) pattern.
- Provide a more familiar interface with HTML attributes mapping to only a single value.
- Pre-compose useful components together with prescribed defaults to create semantic building blocks out-of-the-box.

A-Frame ships with a handful of primitives for common use cases such as displaying basic geometric primitives, 3D models, and media assets.

## Example

Here is an assortment of various primitives in use:

```html
<a-scene>
  <!-- Using the asset management system for better performance. -->
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
  <a-obj-model src="#fox-obj" mtl="#fox-mtl"></a-obj-model>
  <a-sky color="#432FA0"></a-sky>
</a-scene>
```

## How They Work

To create a wide red box using the primitives API, we could write:

```html
<a-box color="red" width="3"></a-box>
```

Once attached, this will expand to:

```html
<a-box color="red" width="3" geometry="primitive: box; width: 3" material="color: red"></a-box>
```

Thus, it is equivalent to:

```html
<a-entity geometry="primitive: box; width: 3" material="color: red"></a-entity>
```

Under the hood, we see that primitives *extend* `<a-entity>` as a custom element while providing some defaults. It defaults the `geometry.primitive` property to `box`. And it *maps* (i.e., proxies) the HTML `width` attribute to the underlying `geometry.width` property and the HTML `color` attribute to the underlying `material.color` property.

## Primitives are Entities

Since primitives extends `<a-entity>`s, operations that can be done upon entities can be done upon primitives. These operations include:

- Positioning, rotating, and scaling
- Attaching additional [components](../core/component.md) to define additional appearance, behavior, or functionality
- Applying [animations](../core/animation.md)
- Specifying [mixins](../core/mixin.md)

## Primitives are Helpers

Note that primitives are a helper layer on top of A-Frame's core API. Thus it is still extremely valuable to grasp the following:

- How the rest of the system works under the hood
- How to compose and configure components onto entities
- How to use the asset management system

If you haven't already, we heavily recommend skimming through the rest of the documentation.

## Reading the Documentation for Individual Primitives

The following documentation pages for individual primitive elements will:

- Describe what the primitive does in practice
- Describe roughly how the primitive is composed
- Describe which component properties the attributes proxy the value to (e.g., `color` maps to `material.color`, meaning the `color` property of the [material component](../components/material.md))
- Describe any techniques or caveats

A lot of the primitives represent geometric meshes (i.e., shapes with an appearance). Thus, many of them inherit the common [mesh attributes](./mesh-attributes.md). So while attributes such as `color` or `src` are not listed in the attributes table for primitives such as [`<a-box>`](./a-box.md) or [`<a-plane>`](./a-plane.md), they are there. Remember to refer to common mesh attributes table when noted.
