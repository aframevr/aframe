title: "Entity"
category: element
---

Entities in A-Frame are defined using the ```<a-entity>``` element.

## Properties

### components

Data of registered components.

### sceneEl

Reference to the scene element.

## API Methods

### emit (name)

Emits a DOM event.

### getAttribute (attr)

If `attr` is the name of a registered component, `getAttribute` only
returns the component data defined in the HTML as an object. `getAttribute`
for components is the partial form of `getComputedAttribute` since the returned
component data does not include applied mixins or defaults.

If `attr` is not the name of a registered component, `getAttribute` behaves as
normal.

### getComputedAttribute (attr)

Similar to `getAttribute`, but for components, returns all component data
*including* applied mixins and defaults. An analog to `getComputedStyle`.

### setAttribute (attr, value, componentAttrValue)

If `attr` is the name of a registered component, `setAttribute` *set*s (not
update) component data given that `value` is an object.

If `value` is the name of a component attribute, and `componentAttrValue` is
specified, then `setAttribute` *updates* the component for that one value.

```js
entityEl.setAttribute('material', { color: 'crimson' });  // Set material data.
entityEl.setAttribute('material', 'color', 'crimson');  // Update material color.
```

If `attr` is not the name of a registered component, `setAttribute` behaves as
normal.

### removeAttribute (attr)

If `attr` is the name of a registered component, `removeAttribute` also
detaches the component from the entity by invoking the component's `remove`
method.

## Events

| Event Name | Description        |
|------------|---------------------
| loaded     | Entity has loaded. |
