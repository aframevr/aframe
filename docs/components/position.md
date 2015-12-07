title: "Position"
category: component
---

The position component defines where an entity is placed in the scene's world
space. It takes an XYZ coordinate as three space-delimited numbers. All
entities inherently have the position component.

```html
<a-entity position="0 1 -1"></a-entity>
```

A-Frame uses a right-handed coordinate system where the negative Z-axis extends
into the screen. The table below assumes looking down the negative Z-axis from the origin:

| Value | Description                                                  | Default Value |
|-------|--------------------------------------------------------------|----------------
| x     | Negative X axis extends left. Positive X Axis extends right. | 0             |
| y     | Negative Y axis extends up. Positive Y Axis extends down.    | 0             |
| z     | Negative Z axis extends in. Positive Z Axis extends out.     | 0             |
