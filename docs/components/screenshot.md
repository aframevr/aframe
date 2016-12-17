---
title: screenshot
type: components
layout: docs
parent_section: components
---

The screenshot component lets us take screenshots with a keyboard shortcut
(`<ctrl> + <alt> +s`). The component can take 360&deg; captures
(`equirectangular`) or regular screenshots (`projection`). A-Frame attaches
this component to the scene by default so it's automatically available.

## Example

```html
<a-scene screenshot="projection: equirectangular"></a-scene>
```

## Properties

| Property   | Description                                                    | Default Value   |
|------------|----------------------------------------------------------------|-----------------|
| width      | The width in pixels of the screenshot taken.                   | 4096            |
| height     | The height in pixels of the screenshot taken.                  | 2048            |
| projection | The screenshot projection: `perspective` or `equirectangular`. | equirectangular |
