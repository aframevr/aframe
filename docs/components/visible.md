---
title: visible
type: components
layout: docs
parent_section: components
source_code: src/components/visible.js
examples: []
---

The visible component determines whether to render an entity. If set to
`false`, then the entity will not be visible nor drawn.

Visibility effectively applies to all children. If an entity's parent or
ancestor entity has visibility set to false, then the entity will also not be
visible nor draw.  It's a common pattern to create container entities that
contain an entire group of entities that you can flip on an off with `visible`.

## Example

```html
<a-entity visible="false"></a-entity>
```

## Value

| Value | Description                                                                            |
|-------|----------------------------------------------------------------------------------------|
| true  | The entity will be rendered and visible; the default value.                            |
| false | The entity will not be rendered nor visible. The entity will still exist in the scene. |

## Updating Visibility

[update]: ../introduction/javascript-events-dom-apis.md#updating-a-component-with-setattribute

It is slightly faster to update visibility at the three.js level versus [via
`.setAttribute`][update].

```js
// With three.js
el.object3D.visible = false;

// With .setAttribute.
el.setAttribute('visible', false);
```

Updates at the three.js level will still be reflected when doing
`entityEl.getAttribute('visible');`.

## Hiding Entity Until Texture Loaded

[event-set]: https://github.com/supermedium/superframe/tree/master/components/event-set

While we can do this with the [event-set][event-set] component, we can also do
this with the built-in animation component. Here's an example of updating
visibility on an event.

```html
<!-- Wait 1 second before showing the entity. -->
<a-entity
  animation="property: visible; to: true; startEvents: materialtextureloaded"></a-entity>
  material="src: #myTexture"
  visible="false">
```
