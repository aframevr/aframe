---
title: debug
type: components
layout: docs
parent_section: components
---

The debug component enables component-to-DOM serialization.

## Example

```html
<a-scene debug></a-scene>
```

## Component-to-DOM Serialization

By default, for performance reasons, A-Frame does not update the DOM with
component data. If we open the browser's DOM inspector, we will see that many
entities will have only the component name visible:

```html
<a-entity geometry material position rotation></a-entity>
```

The component data is stored internally. Updating the DOM takes CPU time for
converting component data, which is stored internally, to strings. However,
when we want to see the DOM update for debugging purposes, we can attach the
`debug` component to the scene. Components will check whether the `debug`
component is enabled before trying to serialize to the DOM. Then we will be
able to view component data in the DOM:

```html
<a-entity geometry="primitive: box" material="color: red" position="1 2 3" rotation="0 180 0"></a-entity>
```

Make sure that this component is not active in production.

### Manually Serializing to DOM

[cftd]: ../core/component.md#flushtodom
[eftd]: ../core/entity.md#flushtodom-recursive

To manually serialize to DOM, use [`Entity.flushToDOM`][eftd] or
[`Component.flushToDOM`][cftd].
