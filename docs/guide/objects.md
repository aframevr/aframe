---
title: Adding objects
type: guide
layout: docs
parent_section: guide
order: 3
show_guide: true
---

A-Frame comes with convenient primitives for common use cases such as videos, models, images, and skies. Primitives include:

```html
<a-cube>
<a-plane>
<a-sphere>
<a-image>
<a-sky>
```

The full list of available primitives is available in the [Primitives documentation](../../docs/primitives/).

Each primitive has unique attributes. We can specify the width, depth, and height of a cube, for example, or the source of a 3D model:

```html
<a-cube width="4" depth="2" height="20"></a-cube>
<a-model src="tree.dae" scale="1 1 1"></a-model>
<a-cylinder radius="5" open-ended="true"></a-cylinder>
<a-videosphere src="sunset.mp4" autoplay="true"></a-videosphere>
```

Under the hood, primitives are concise and convenient wrappers around A-Frame's powerful underlying entity-component system. Components include geometry, materials, raycaster, controls, and more. 

To learn more about primitives, see the [Primitives overview](../../docs/primitives/). To start working with entities and components, see the [Entity/Component documentation](../core/).
