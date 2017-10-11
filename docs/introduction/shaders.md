---
title: "Shaders"
type: introduction
layout: docs
parent_section: introduction
order: 8.775
examples: []
---

[shaders]: ../components/material.md#register-a-custom-shader-material
[shadertoy]: https://github.com/ngokevin/aframe-shadertoy-gallery
[shaderfrog]: https://github.com/chenzlabs/aframe-import-shaderfrog
Shaders are a powerful technique to implement visual effects.

A-Frame provides support for custom shaders as discussed [here][shaders].

![5093034e-97f2-40dc-8cb9-28ca75bfd75b-8043-00000dbc2e00268d](https://cloud.githubusercontent.com/assets/1848368/24825516/abb98abe-1bd4-11e7-8262-93d3efb6056f.gif) 

![b19320eb-802a-462a-afcd-3d0dd9480aee-861-000004c2a8504498](https://cloud.githubusercontent.com/assets/1848368/24825518/b52e5bf6-1bd4-11e7-8eb2-9a9c1ff82ce9.gif)

In addition, there are components developed by the A-Frame developer community
that allow the use of existing shaders from repositories such as [ShaderToy][shadertoy] and [ShaderFrog][shaderfrog].

Note however that these shaders can be quite demanding in terms of
computational and graphics power, and some more complex shaders may not function 
well on lower-performance devices such as smartphones.
