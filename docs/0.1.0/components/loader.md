---
title: "Loader"
type: components
layout: docs
parent_section: components
order: 6
---

The `loader` component defines the appearance of the entity by loading in a 3D model.

Note that this component may be subject to change due to design decisions and [support landing](https://github.com/aframevr/aframe-core/issues/532) for the [GLTF format](https://www.khronos.org/gltf).

```html
<a-entity loader="src: monster.dae; format: collada"></a-entity>
```

| Property  | Description                                               |
|-----------|-----------------------------------------------------------|
| format    | Format of the 3D model asset (either `collada` or `obj`). |
| src       | URL to a 3D asset.                                        |
