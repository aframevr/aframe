title: "Rotation"
category: component
---

The rotation component defines the orientation of an entity. It takes the roll
(X), pitch (Y), and yaw (Z) as three space-delimited numbers indicating degrees
of rotation. All entities inherently have the rotation component.

```html
<a-entity rotation="45 90 180"></a-entity>
```

A-Frame uses a right-handed coordinate system. When aligning our right hand's
thumb with with a positive axis, our hand will curl in the positive direction
of rotation.

| Value | Description                      |
|-------|-----------------------------------
| x     | Rotation about the X-axis. Roll  |
| y     | Rotation about the Y-axis. Pitch |
| z     | Rotation about the Z-axis. Yaw   |
