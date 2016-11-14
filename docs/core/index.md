---
title: Entity-Component-System
section_title: Concepts and API
type: core
layout: docs
parent_section: docs
order: 1
section_order: 3
---

[ecs]: https://wikipedia.org/wiki/Entity_component_system

A-Frame is an **[entity-component-system][ecs]** (ECS) framework. The ECS
pattern is a pattern common in game development that favors composability over
traditional inheritance and hierarchy:

[entity]: ./entity.md
[component]: ./component.md
[system]: ./systems.md

- An [entity][entity] is a general-purpose object that inherently does and renders nothing.
- A [component][component] is a reusable module that we plug into entities to
  provide appearance, behavior, and/or functionality. They are plug-and-play
  for objects.
- A [system][system] provides global scope, services, and management to classes of components.

ECS lets us build complex entities with rich behavior by plugging different
reusable components into the sockets on the entity. Contrast this to
traditional inheritance where if we want to extend an object, we would have to
manually create a new class to do so.

ECS grants developers the key to permissionless innovation. Developers can
write, share, and plug in components that extend new features or iterate upon
existing features.

<!--toc-->

## Concept

As an abstract example, imagine a car is an entity:

- We can add a `color` component which affects the color of the car.
- We can add an `engine` component which has properties such as "horsepower" or
  "weight" which affect the speed of the car.
- We might add a `tire` component which has properties such as "grip" which
  affects the traction of the car.

We can mix and match components and even use them to create new types of
vehicles such as airplanes, motorcycles, or boats (where we wouldn't specify a
`tire` component).

## Composition

With this pattern, A-Frame represents:

- an entity as an HTML element (i.e., `<a-entity>`).
- a component as an HTML attribute.
- component **properties** as values defined by an HTML attribute.

[geometry]: ../components/geometry.md
[material]: ../components/material.md

For example, to *compose* a tomato-colored sphere starting with an entity, we
can attach the [geometry][geometry] and [material][material] components. Since
the components take multiple properties, we define the property values using an
inline-style syntax:

```html
<a-entity geometry="primitive: sphere; radius: 1.5"
          material="color: tomato; metalness: 0.7"></a-entity>
```

[light]: ../components/light.md
[physics]: https://github.com/ngokevin/aframe-physics-components
[sound]: ../components/sound.md

From there, we can attach more and more components to add whatever appearance,
behavior, or funtionality we want. Attach the [light component][light] to have
it emit light. Attach the [sound component][sound] to have it play sound.
Attach the [physics component][physics] to affect the entity with gravity and
collision detection:

[composegif]: https://i.imgur.com/0UIZFgs.gif

![Composing an Entity][composegif]

We can even attach third-party components that other people have created. If
someone writes a component that enables a mesh to explode, or a component that
enables the mesh to use a canvas as its material texture, we could just drop
the component into our A-Frame experience and use it immediately in HTML. The
entity-component-system pattern enables great flexibility and extensibility.
