---
title: Positioning
type: guide
layout: docs
parent_section: guide
order: 4
show_guide: true
---

To move an element or change its relative size, you can add attributes for position, rotation, and scale.

```html
<a-cube position="0 0 0" rotation="0 0 0" scale="1 1 1"></a-cube>
```

In the A-Frame coordinate system, +X can be roughly thought of as "right", +Y is "up", and "+Z" is towards the default camera. In 3D graphics this is called a [right-handed cartesian coordinate system](https://wikipedia.org/wiki/Cartesian_coordinate_system), with Y-axis up.

Distances in A-Frame are defined in meters. When designing a scene for virtual reality it is very important to consider the real world scale of the objects we create. A cube with `height="100"` may look fairly ordinary on our laptop screen, but in virtual reality we will perceive it as a massive 100 meter tall monolith.

Rotations in A-Frame are defined in degrees:

```html
<a-cube rotation="180 45 90"></a-cube>
```
