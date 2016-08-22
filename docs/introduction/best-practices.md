---
title: Best Practices
type: introduction
layout: docs
parent_section: introduction
order: 4
---

## VR Design

[leapmotion]: https://developer.leapmotion.com/assets/Leap%20Motion%20VR%20Best%20Practices%20Guidelines.pdf
[oculus]: https://developer.oculus.com/documentation/intro-vr/latest/concepts/bp_intro/

Designing for VR is different than designing for flat experiences. As a new
medium, there are new sets of best practices to follow, especially to maintain
user comfort and presence. This has been thoroughly written about so we defer
to these comprehensive guides:

- [Oculus Best Practices (for VR)][oculus]
- [Leap Motion VR Best Practices Guidelines][leapmotion]

Some things to note:

- The common golden rule is to never unexpectedly take control of the camera
  away from users.
- Units (such as for position) should be considered meters. This is because the
  WebVR API returns pose in meters which is fed into most camera controls. By considering
  units as meters, we achieve expected scale.

## Performance

[asm]: ../core/asset-management-system.md
[hardware]: ../guide/device-and-platform-support.md#hardware-specifications
[merge]: ../components/geometry.md#mergeto
[stats]: ../components/stats.md

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
- Generally, the fewer number of entities and lights in the scene, the better.
- Make sure your textures' resolutions are sized to powers of two (e.g.,
  256x256, 512x1024) in order to avoid the renderer having to resize the
  texture during runtime.

## A-Frame

[mixins]: ../core/mixins.md
[ecs]: ../core/index.md
[template]: https://github.com/ngokevin/aframe-template-component

Some best practices for the framework:

- Don't repeat yourself (**DRY**). Make use of [mixins][mixins] and [templating][template] to
  reduce the amount of copy-and-pasting and reduce the amount of HTML in your
  scene.
- Try to make use of the [entity-component-system framework][ecs]. Develop
  within components to encourage declarativeness and reusability.
