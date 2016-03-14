---
title: <a-cursor>
type: primitives
layout: docs
parent_section: primitives
order: 7
---

The cursor primitive places a reticle or crosshair to add clicking and interactivity with the scene. It is an entity that prescribes the [cursor component](../components/cursor.md) and a default ring-shaped geometry. The cursor is usually placed as a child of the camera.

Read the [cursor component documentation](../components/cursor.md) for detailed information about how the cursor works and how to use the cursor.

## Example

```html
<a-scene>
  <a-camera>
    <a-cursor></a-cursor>
  </a-camera>

  <a-box></a-box>
</a-scene>
```

## Attributes

| Attribute    | Component Mapping  | Default Value |
|--------------|--------------------|---------------|
| fuse         | cursor.fuse        | false         |
| max-distance | cursor.maxDistance | 1000          |
| timeout      | cursor.timeout     | 1500          |
