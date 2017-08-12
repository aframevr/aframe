---
title: line
type: components
layout: docs
parent_section: components
source_code: src/components/line.js
examples: []
---

[threeline]: https://threejs.org/docs/#api/objects/Line

The line component draws a line given a start coordinate and end coordinate
using [`THREE.Line`][threeline].

[laser-controls]: ./laser-controls.md
[raycaster]: ./raycaster.md

The [raycaster component][raycaster] uses the line component for its `showLine`
property, which is then used by the [laser-controls component][laser-controls].

## Example

```html
<a-entity line="start: 0, 1, 0; end: 2 0 -5; color: red"
          line__2="start: -2, 4, 5; end: 0 4 -3; color: green"></a-entity>
```

Note an entity can have multiple lines. The line mesh is set as `line` or
`line__<ID>` in the entity's `object3DMap`:

```js
console.log(el.getObject3D('line'));
console.log(el.getObject3D('line__2'));
```

## Properties

| Property | Description                   | Default Value |
|----------|-------------------------------|---------------|
| start    | Start point coordinate.       | 0, 0, 0       |
| end      | End coordinate.               | 0, 0, 0       |
| color    | Line color.                   | #74BEC1       |
| opacity  | Line opacity.                 | 1             |
| visible  | Whether the material visible. | true          |
