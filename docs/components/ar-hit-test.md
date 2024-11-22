---
title: ar-hit-test
type: components
layout: docs
parent_section: components
source_code: src/components/scene/ar-hit-test.js
examples: []
---

[hit-test]: https://immersive-web.github.io/hit-test/

This component uses the WebXR hit-test API to position virtual objects in the real world. Remember to request the `hit-test` optional feature to allow it work.

You add it to the scene element and then when the user is in Augmented Reality if they tap on the screen or select with a controller it will work out where the user is pointing to in the real world and place a reticle there and fire events.

If you have set a target property to be an element it will automatically make the reticle to be the same size as the footprint of the target and then when the user selects the object will be telepoted there. It will also set the visible state of the object to true so you can hide the object until the user has placed it for the first time. The `hide-on-enter-ar` component is useful for that.

You can toggle this component's enabled state to not do any interactions until you are ready.

## Example

```html
<a-scene webxr="optionalFeatures:  hit-test;" ar-hit-test="target:#myobject;">
	<a-entity id="myobject"></a-entity>
```

## Properties

| Property       | Description                                                  | Default Value |
|----------------|--------------------------------------------------------------|---------------|
| target         | The object to move around.                                   | null          |
| enabled        | Whether to do hit-testing or not                             | true          |
| src            | Image to use for the reticle                                 | See: Assets   |
| type           | 'footprint' or 'map' footprint is the shape of the model     | "footprint"   |
| footprintDepth | Amount of the model used for the footprint, 1 is full height | 0.1           |
| mapSize        | If no target is set then this is the size of the map         | 0.5 0.5       |

## Events

| Event Name           | Description                                                  |
|----------------------|--------------------------------------------------------------|
| ar-hit-test-start    | The AR Hit Test system has managed start scanning            |
| ar-hit-test-achieved | The AR Hit Test system has managed to find a surface to start hit testing on |
| ar-hit-test-select   | The user has stopped positioning the detail contains the latest position, orientation and inputSource that was used |

## Assets

- [Default Reticle Map](data:image/webp;base64,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)

