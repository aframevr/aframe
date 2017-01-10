---
title: screenshot
type: components
layout: docs
parent_section: components
---

The screenshot component lets us take different types of screenshots by using
keyboard shortcuts. A-Frame attaches this component to the scene by default so
it's automatically available.

To take a normal (perspective) screenshot, use the keyboard shortcut (`<ctrl> + <alt>
+s`).

To take a 360&deg; (equirectangular) screenshot, use the keyboard shortcut
(`<ctrl> + <alt> + <shift> +s`).

## Example

Unless we wish to customize the screenshot, explicitly setting the screenshot
component is not needed since it's already attached to the scene by default.
Otherwise, here's an example:

```html
<a-scene screenshot="projection: perspective"></a-scene>
```

## Properties

| Property   | Description                                                    | Default Value   |
|------------|----------------------------------------------------------------|-----------------|
| width      | The width in pixels of the screenshot taken.                   | 4096            |
| height     | The height in pixels of the screenshot taken.                  | 2048            |
| projection | The screenshot type: `perspective` or `equirectangular`.       | equirectangular |
