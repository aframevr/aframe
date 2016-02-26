---
title: Entity-Component System
section_title: Core
type: core
layout: docs
parent_section: docs
order: 1
section_order: 3
---

A-Frame is based on an __[entity-component system](https://en.wikipedia.org/wiki/Entity_component_system)__, a pattern common in game development that emphasizes composability:

- An **entity** is a general-purpose object in the scene (e.g., player, enemy, tree, sky).
- A **component** consists of properties that modifies the behavior or functionality of an entity.

An entity can have multiple components, and an entity's behavior can be changed at runtime by adding, removing, or modifying components. As we will see below, this will provide great flexibility over traditional inheritance patterns.

## Analogy

As an abstract example, imagine a car is an entity:

- We can add a `color` component which affects the color of the car.
- We can add an `engine` component which has properties such as "horsepower" or "weight" which affect the speed of the car.
- We might add a `tire` component which has properties such as "grip" which affects the traction of the car.

These components would be able to be mixed and matched and even be used with other vehicles such as airplanes, motorcycles, or boats (where we wouldn't specify a `tire` component).

## Usage

In A-Frame:

- Entities are HTML elements (i.e., `<a-entity>`).
- Components are HTML attributes that are set on the entity.
- Component properties are defined by using a CSS-like syntax.

For example, to create a pink cube, which requires the `geometry` and `material` components:

```html
<a-entity geometry="primitive: box; depth: 1; height: 1; width: 1"
          material="color: pink"></a-entity>
```

For web developers, the syntax might seem new, or even odd, but the composability makes it powerful to be able to customize entities in the system. Perhaps we want our cube to give off light; we can simply add the `light` component:

```html
<a-entity geometry="primitive: box; depth: 1; height: 1; width: 1"
          material="color: pink"
          light="intensity: 2"></a-entity>
```

Perhaps we want our cube to also emit a sound. We can add the [`sound` component](sound.html). And we want to move the cube a little, we can use the [`position` component](../components/position.html).

```html
<a-entity geometry="primitive: box; depth: 1; height: 1; width: 1"
          material="color: pink"
          light="intensity: 2"
          position="-1 5 0"
          sound="src: dangerzone.mp3; volume: 2"></a-entity>
```

We see that components make it very easy to compose entities with mixtures of behavior and functionality and everyone can write their own components to modify entities however they desire. For example, someone might write a `vibrate` component that makes the entity vibrate regardless of which kind of entity it is. Although it might seem verbose, it provides a core foundation for abstraction.
