---
title: Effects
type: core
layout: docs
parent_section: core
order: 5
source_code: src/core/scene/effect.js
examples: []
---

Effects are post processing special effects that are applied after the scene is renderered.
All the built-in effects are designed to work in both 2D and VR modes.

Effects are components applied to `<a-scene>` and there's a fixed order in wich the effects are applied regardless on when and how are applied to `<a-scene>`

The effects available are bloom, vignette, tint, noise, gamma, film and are named with the prefix `effect-`

<!--toc-->

## Example

```html
<a-scene effect-bloom effect-sepia background="color: black">
  <a-box color="white"></a-box>
</a-scene>
```

