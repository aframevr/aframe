---
title: Entity-Component-System Pattern
section_title: Core
type: core
layout: docs
parent_section: docs
order: 1
section_order: 2
---

A-Frame is based on an __[entity-component-system pattern](https://en.wikipedia.org/wiki/Entity_component_system)__, a pattern common in game development that emphasizes composability over inheritance:

- An **entity** is a general-purpose object in the scene that, by itself, does nothing.
- A **component** is a reusable module that is attached to an entity to provide appearance, behavior, and/or functionality.
- A **system** manages components of its type.

Components are plug-and-play for objects. They let us build complex entities with rich behavior by plugging different reusable components into the sockets on the entity. Contrast this to traditional inheritance where if we want extend an object, we would have to manually create a new class to do so.

If we are to bring virtual reality to the web, we should adopt established patterns from 3D and game development. The entity-component-system pattern is A-Frame's key differentiator from previous 3D markup specifications.

## Concept

As an abstract example, imagine a car is an entity:

- We can add a `color` component which affects the color of the car.
- We can add an `engine` component which has properties such as "horsepower" or "weight" which affect the speed of the car.
- We might add a `tire` component which has properties such as "grip" which affects the traction of the car.

These components would be able to be mixed and matched and even be used with other vehicles such as airplanes, motorcycles, or boats (where we wouldn't specify a `tire` component).

## Composition

Taking the pattern to A-Frame:

- An entity is represented via an HTML element (i.e., `<a-entity>`).
- A component is represented via an HTML attribute.
- Component **properties** are represented by values defined via an HTML attribute.

For example, to *compose* a tomato-colored sphere starting with an entity, we can attach the [geometry][geometry] and [material][material] components. Since the components take multiple properties, we define the property values using an inline-style syntax:

```html
<a-entity geometry="primitive: sphere; radius: 1.5"
          material="color: tomato; metalness: 0.7"></a-entity>
```

From there, we can attach more and more components to add whatever appearance, behavior, or funtionality we want. Attach the [light component][light] to have it emit light. Attach the [sound component][sound] to have it play sound. Attach the [physics component][physics] to have it be affected by gravity and collision detection:

![Composing an Entity][composegif]

We can even attach third-party components that other people have created. If someone writes a component that enables a mesh to explode, or a component that enables the mesh to use a canvas as its material texture, we could just drop the component into our A-Frame experience and use it immediately in HTML. The entity-component-system pattern enables great flexibility and extensibility.

[composegif]: http://i.imgur.com/0UIZFgs.gifv
[geometry]: ../components/geometry.html
[light]: ../components/light.html
[material]: ../components/material.html
[physics]: https://github.com/ngokevin/aframe-physics-components]
[sound]: ../components/sound.html
