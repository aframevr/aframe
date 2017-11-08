---
title: debug
type: components
layout: docs
parent_section: components
source_code: src/components/scene/debug.js
---

The debug component enables component-to-DOM serialization.

## Example

```html
<a-scene debug></a-scene>
```

## Component-to-DOM Serialization

By default, for performance reasons, A-Frame does not update the DOM with
component data. This also means mutation observers will not fire. If we open
the browser's DOM inspector, we will see only the component names (and not the
values) are visible.

```html
<a-entity geometry material position rotation></a-entity>
```

A-Frame stores the component data in memory. Updating the DOM takes CPU time
for converting internal component data to strings. If we want to see the DOM
update for debugging purposes, we can attach the `debug` component to the
scene. Components will check for an enabled `debug` component before trying to
serialize to the DOM. Then we will be able to view component data in the DOM:

```html
<a-entity geometry="primitive: box" material="color: red" position="1 2 3" rotation="0 180 0"></a-entity>
```

Make sure that this component is not active in production.

### Manually Serializing to DOM

[cftd]: ../core/component.md#flushtodom
[eftd]: ../core/entity.md#flushtodom-recursive

To manually serialize to DOM, use [`Entity.flushToDOM`][eftd] or
[`Component.flushToDOM`][cftd]:

```js
document.querySelector('a-entity').components.position.flushToDOM();  // Flush a component.
document.querySelector('a-entity').flushToDOM();  // Flush an entity.
document.querySelector('a-entity').flushToDOM(true);  // Flush an entity and its children.
document.querySelector('a-scene').flushToDOM(true);  // Flush every entity.
```
