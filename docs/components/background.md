---
title: background
type: components
layout: docs
parent_section: components
source_code: src/components/background.js
examples: []
---

The background component sets a basic color background of a scene that is more
performant than `a-sky` since geometry is not created. There are no undesired
frustum culling issues when `a-sky` is further than the far plane of the
camera. There are no unexpected occlusions either with far objects that might
be behind of the sphere geometry of `a-sky`.

## Example

The example below sets the background color to red and use lighting estimation for AR.

```html
<a-scene background="color: red"></a-scene>
```

## Properties

| Property                   | Description                                               | Default Value   |
|----------------------------|-----------------------------------------------------------|-----------------|
| color                      | Color of the scene background.                            | black           |
| transparent                | Background is transparent. The color property is ignored. | false           |
