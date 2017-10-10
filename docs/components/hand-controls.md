---
title: hand-controls
type: components
layout: docs
parent_section: components
source_code: src/components/hand-controls.js
examples: []
---

[tracked]: ./tracked-controls.md
[vive]: ./vive-controls.md
[oculustouch]: ./oculus-touch-controls.md
[daydream]: ./daydream-controls.md

The hand-controls component provides tracked hands (using a prescribed model)
with animated gestures. hand-controls wraps the [vive-controls][vive] and
[oculus-touch-controls][oculustouch] which in turn wrap the [tracked-controls
component][tracked]. By specifying just `hand-controls`, we have something that
works well with both Vive and Rift. The component gives extra events and
handles hand animations and poses.

## Example

```html
<a-entity id="leftHand" hand-controls="left"></a-entity>
<a-entity id="rightHand" hand-controls="right"></a-entity>
```

## Values

| Value | Description                                      |
|-------|--------------------------------------------------|
| left  | The entity will track the left hand controller.  |
| right | The entity will track the right hand controller. |

## Events

| Event Name    | Description                                                    |
| ----------    | -----------                                                    |
| gripdown      | The hand is closed into a fist without thumb raised.           |
| gripup        | The hand is no longer closed into a fist without thumb raised. |
| pointup       | The hand is touching or pressing the trigger only.             |
| pointdown     | The hand is no longer touching or pressing the trigger only.   |
| thumbup       | The hand is closed into a fist with thumb raised.              |
| thumbdown     | The hand is no longer closed into a fist with thumb raised.    |
| pointingstart | The hand is pointing with index finger without thumb raised.   |
| pointingend   | The hand is no longer pointing without thumb raised.           |
| pistolstart   | The hand is pointing with index finger and thumb raised.       |
| pistolend     | The hand is no longer pointing with thumb raised.              |

## Assets

- [Left hand model](https://cdn.aframe.io/controllers/oculus-hands/v2/leftHand.json)
- [Right hand model](https://cdn.aframe.io/controllers/oculus-hands/v2/rightHand.json)
