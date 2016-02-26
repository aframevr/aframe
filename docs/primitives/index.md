---
title: Introduction
section_title: Primitives
type: primitives
layout: docs
parent_section: docs
order: 1
section_order: 2
---

Primitives are concise, semantic building blocks blocks that wrap A-Frame's underlying [entity-component](../core/) system. A-Frame ships with a handful of built-in primitives for common use cases such as `<a-cube>`, `<a-model>`, and `<a-sky>`. These primitives are to help people get started with using A-Frame. To uncover the full composability and extensibility of A-Frame, dive down into the underlying [entity-component system](../core/).

Using primitives, to create a red cube that's 3 meters wide, we can write:

```html
<a-cube width="3" color="red"></a-cube>
```

... instead of the more verbose entity-component equivalent:

```html
<a-entity geometry="primitive: box; width: 3" material="color: red"></a-entity>
```

Under the hood, `<a-cube>` is wrapping `<a-entity>` in a custom element, and mapping the HTML `width` attribute to the underlying `geometry` component's width property.

Primitives are designed to enable developers to start building A-Frame scenes without having to learn A-Frame's full entity-component system. By being semantic and concise, they also improve the readability of our markup.

Primitives and entity-component instances can be freely mixed within an A-Frame scene. Entities with components are useful when developers need to go beyond primitives and tap into the deeper power and flexibility of A-Frame's built-in components, which include [material](../components/material.html), [geometry](../components/geometry.html), [light](../components/light.html), and [more](../components/material.html).

Entities can also be very useful for __grouping elements__ (primitives or otherwise):

```html
<a-entity id="tree" position="30 12 86">
  <a-sphere color="green" radius="0.5" position="0 1.5 0"></a-sphere>
  <a-cylinder color="brown" radius="0.2" height="1" position="0 0.5 0"></a-cylinder>
</a-entity>
```

Primitives work with animations also. To create a cube that spins endlessly, we can write:

```html
<a-cube color="yellow">
  <a-animation attribute="rotation" from="0 0 0" to="0 360 0" repeat="indefinite" easing="linear"></a-animation>
</a-cube>
```

Adding components directly to primitives to extend their behavior is currently not supported, however, and will lead to unpredictable results.
