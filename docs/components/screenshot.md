---
title: screenshot
type: components
layout: docs
parent_section: components
---

Take screenshots of the scene using a keyboard shortcut (ctrl+alt+s).
It can be configured to either take 360&deg; captures (`equirectangular`)
or regular screenshots (`projection`). The screenshot component only applies to the [`<a-scene>` element][scene].

## Example

```html
<a-entity screenshot="projection: equirectangular"></a-entity>
```

## Properties

| Property     | Description                                                | Default Value   |
|--------------|------------------------------------------------------------|-----------------|
| width        | The width in pixels of the screenshot taken.               | 4096            |
| height       | The height in pixels of the screenshot taken.              | 2048            |
| projection   | The screenshot projection: perspective or equirectangular  | equirectangular |

[scene]: ../core/scene.md
