---
title: Best Practices
type: guide
layout: docs
parent_section: guide
order: 6
---

## VR Design

Designing for VR is different than designing for flat experiences. As a new
medium, there are new sets of best practices to follow, especially to maintain
user comfort and presence. This has been thoroughly written about so we defer
to these comprehensive guides:

- [Oculus Best Practices (for VR)][oculus]
- [Leap Motion VR Best Practices Guidelines][leapmotion]

The common golden rule, however, is to never unexpectedly take control of the
camera away from users.

## Performance

Performance is critical in VR. A high framerate must be maintained in order for
users to be comfortable. Here are some ways to help improve performance of an
A-Frame scene:

- Use [recommended hardware specifications][hardware].
- Use the **[stats component][stats]** to keep an eye on various metrics (FPS,
  vertex and face count, geometry and material count, draw calls, number of entities.  We
  want to maximize FPS and minimize everything else.
- Make use of the **[asset management system][asm]** to benefit from browser
  caching and preloading. Trying to fetch assets while rendering is slower than
  fetching all assets before rendering.
- Look to make use of **[geometry merging][merge]** to limit draw calls when
  multiple geometries are sharing the same material.
- If using models, look to bake your lights into textures rather than relying
  on real-time lighting and shadows.
- Rather than using COLLADA or OBJ models, try using **[glTF][gltf]**, a more
  efficient 3D format. Note that glTF support in three.js is still very new so
  your mileage may vary.
- Generally, the fewer number of entities and lights in the scene, the better.

## A-Frame

And finally, some best practices for the framework:

- Don't repeat yourself (**DRY**). Make use of [mixins][mixins] and [templating][template] to
reduce the amount of copy-and-pasting and reduce the amount of HTML in your scene.
- Try to make use of the [entity-component-system framework][ecs]. It's what the
framework is all about! Develop within components to encourage declarativeness
and reusability.

[asm]: ../core/asset-management-system.md
[ecs]: ../core/index.md
[gltf]: https://github.com/xirvr/aframe-gltf
[hardware]: ../guide/device-and-platform-support.md#hardware-specifications
[leapmotion]: https://developer.leapmotion.com/assets/Leap%20Motion%20VR%20Best%20Practices%20Guidelines.pdf
[merge]: ../components/geometry.md#mergeto
[mixins]: ../components/mixins.md
[oculus]: https://developer.oculus.com/documentation/intro-vr/latest/concepts/bp_intro/
[stats]: ../components/stats.md
[template]: https://github.com/ngokevin/aframe-template-component
