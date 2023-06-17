---
title: windows-motion-controls
type: components
layout: docs
parent_section: components
source_code: src/components/windows-motion-controls.js
examples: []
---

[trackedcontrols]: ./tracked-controls.md

The windows-motion-controls component interfaces with any spatial controllers exposed through
Windows Mixed Reality as Spatial Input Sources (such as Motion Controllers). 
It wraps the [tracked-controls component][trackedcontrols] while adding button
mappings, events, and a controller model that highlights applies position/rotation transforms 
to the pressed buttons (trigger, grip, menu, thumbstick, trackpad) and moved axes (thumbstick and trackpad.)

## Example

```html
<a-entity windows-motion-controls="hand: left"></a-entity>
<a-entity windows-motion-controls="hand: right"></a-entity>
```

## Value

| Property             | Description                                                                                       | Default Value  |
|----------------------|---------------------------------------------------------------------------------------------------|----------------|
| hand                 | The hand that will be tracked (i.e., right, left).                                                | right          |
| pair                 | Which pair of controllers, if > 2 are connected.                                                  | 0              |
| model                | Whether the controller model is loaded.                                                           | true           |


## Events

| Event Name             | Description                                     |
| ----------             | -----------                                     |
| thumbstickdown         | Thumbstick button pressed.                      |
| thumbstickup           | Thumbstick button released.                     |
| thumbstickchanged      | Thumbstick button changed.                      |
| thumbstickmoved        | Thumbstick axis moved.                          |
| triggerdown            | Trigger pressed.                                |
| triggerup              | Trigger released.                               |
| triggerchanged         | Trigger changed.                                |
| gripdown               | Grip button pressed.                            |
| gripup                 | Grip button released.                           |
| gripchanged            | Grip button changed.                            |
| menudown               | Menu button pressed.                            |
| menuup                 | Menu button released.                           |
| menuchanged            | Menu button changed.                            |
| trackpaddown           | Trackpad pressed.                               |
| trackpadup             | Trackpad released.                              |
| trackpadchanged        | Trackpad button changed.                        |
| trackpadmoved          | Trackpad axis moved.                            |
| controllermodelready   | The model file is loaded and completed parsing. |

## Assets

TBC.
