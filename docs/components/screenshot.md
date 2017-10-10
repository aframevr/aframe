---
title: screenshot
type: components
layout: docs
parent_section: components
source_code: src/components/scene/screenshot.js
examples: []
---

The screenshot component lets us take different types of screenshots with
keyboard shortcuts. A-Frame attaches this component to the scene by default so
we don't have to do anything to use the component.

## Shortcuts

### Equirectangular Screenshot

To take a 360&deg; (equirectangular) screenshot, press `<ctrl> + <alt> + <shift> + s`
on the keyboard.

![Equirectangular Screenshot](https://cloud.githubusercontent.com/assets/674727/22461640/ea408ea4-e75e-11e6-9f8e-7566c4542587.png)

### Perspective Screenshot

To take a normal (perspective) screenshot, press `<ctrl> + <alt> + s` on the
keyboard.

![Perspective Screenshot](https://cloud.githubusercontent.com/assets/674727/22461641/ea43c218-e75e-11e6-8c5e-84c0bd2d691b.png)

## Properties

| Property   | Description                                               | Default Value   |
|------------|-----------------------------------------------------------|-----------------|
| width      | The width in pixels of the screenshot taken.              | 4096            |
| height     | The height in pixels of the screenshot taken.             | 2048            |

## Methods

To take a screenshot programatically and get a canvas, call `getCanvas()`:

```js
// `screenshot.projection` property can be `equirectangular` or `perspective`.
document.querySelector('a-scene').components.screenshot.getCanvas('equirectangular');
```

To take a screenshot programmatically and automatically save the file, call `capture()`:

```js
document.querySelector('a-scene').components.screenshot.capture('perspective')
```
