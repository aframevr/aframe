---
title: Entity
type: core
layout: docs
parent_section: core
order: 2
---

Entities in A-Frame are defined using the `<a-entity>` element. As described in the [entity-component architecture overview](../core/), entities are general purpose objects (e.g., to create a player, monster, sky, or cube). They inherently have a position, rotation, and scale in the scene. After they are defined, components, which add appearance, behavior, and functionality, are attached to the entities to give them life.

## Properties

### `components`

Data of registered components.

### `sceneEl`

Reference to the scene element.

## API Methods

### `emit (name)`

Emits a DOM event.

### `getAttribute (attr)`

If `attr` is the name of a registered component, `getAttribute` returns only the component data defined in the HTML as an object. `getAttribute` for components is the partial form of `getComputedAttribute` since the returned component data does not include applied mixins or defaults.

If `attr` is not the name of a registered component, `getAttribute` behaves as it normally does.

### `getComputedAttribute (attr)`

Similar to `getAttribute` but for components, returns all component data *including* applied mixins and defaults. An analog to `getComputedStyle`.

### `setAttribute (attr, value, componentAttrValue)`

If `attr` is the name of a registered component, `setAttribute` *set*s (not update) component data given that `value` is an object.

If `value` is the name of a component attribute, and `componentAttrValue` is specified, then `setAttribute` *updates* the component for that one value.

```js
entityEl.setAttribute('material', {color: 'crimson'});  // Set material data.
entityEl.setAttribute('material', 'color', 'crimson');  // Update material color.
```

If `attr` is not the name of a registered component, `setAttribute` behaves as it normally does.

### `removeAttribute (attr)`

If `attr` is the name of a registered component, `removeAttribute` also detaches the component from the entity by invoking the component's `remove` method.

## Events

| Event Name       | Description                              |
|------------------|------------------------------------------|
| componentchanged | Entity has been modified by a component. |
| loaded           | Entity has loaded.                       |
