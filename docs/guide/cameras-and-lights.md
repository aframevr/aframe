---
title: Adding cameras and lights
type: guide
layout: docs
parent_section: guide
order: 6
show_guide: true
---


Every A-Frame scene comes with a default camera and lights. We do this to make it fast and easy to start creating new scenes. The default camera and lights do not appear in your source markup, but they're added to your scene when it loads in the browser. Use your browser's Dev Tools to view the page source, and you'll see that they've been added.

The default camera is positioned at `0 1.8 4`. This ensures that you can start adding objects into your scene without worrying about positioning and see them immediately. If the default camera position was `0 0 0`, we'd add a cube to our scene and not see it, because we'd be _inside_ it. The default field of view is `80°`, which closely matches what we see in the virtual-reality headset.

There are two default lights:

1. White ambient light.
2. White directional light, intensity `0.2`, position `-1 2 1`.

To override these defaults, add a `<a-camera>` or `<a-light>` to your scene. When your site is loaded in the browser, A-Frame will see that you've manually added your own camera or light, and will not inject the defaults.

The camera primitive comes with several useful attributes. For example:

```html
<a-camera wasd-controls-enabled="false"></a-camera>
```

The full list of camera primitive attributes is [here](../primitives/a-camera.html).

__Note: A-Frame does not currently support multiple cameras and switching between them, but an [issue](https://github.com/aframevr/aframe-core/issues/635) is filed for this useful functionality.__

The light primitive also comes with several useful properties. There are several types of lights in A-Frame.

```html
<a-light type="ambient"></a-light>
<a-light type="directional"></a-light>
<a-light type="hemisphere"></a-light>
<a-light type="point"></a-light>
<a-light type="spot"></a-light>
```

The attributes differ based on the type of light used. The full list of light primitive attributes is defined in the [documentation](../docs/).
