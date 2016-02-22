---
title: "Rotation"
type: components
layout: docs
parent_section: components
order: 12
---

The `rotation` component defines the orientation of an entity. It takes the roll (`x`), pitch (`y`), and yaw (`z`) as three space-delimited numbers indicating degrees of rotation. All entities inherently have the `rotation` component.

```html
<a-entity rotation="45 90 180"></a-entity>
```

A-Frame uses a right-handed coordinate system. When aligning our right hand's thumb with a positive axis, our hand will curl in the positive direction of rotation.

| Value | Description                       |
|-------|-----------------------------------|
| x     | Roll; rotation about the X-axis.  |
| y     | Pitch; rotation about the Y-axis. |
| z     | Yaw; rotation about the Z-axis.   |
