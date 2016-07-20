---
title: vive-controls
type: components
layout: docs
parent_section: components
---

Interfaces with vive controls and maps Gamepad events to
vive controller buttons: trackpad, trigger, grip, menu and system
It loads a vive controller model and highlights the pressed buttons

## Example

```html
<a-entity vive-controls="hand: left"></a-entity>
```

## Value

| Property             | Description                         | Default Value |
|----------------------|-------------------------------------|---------------|
| buttonColor          | Buttons color                       | white         |
| buttonHighlightColor | Higlight buttons color              | yellow        |
| hand                 | The hand that will be tracked       | left          |
| model                | Is the vive model loaded            | true          |

## Events

| Event Name   | Description                                                                                 |
| ----------   | ----------------------------------------------|
| gripdown     | Grip button pressed
| gripup       | Grip button released
| menudown     | Menu button pressed
| menuup       | Menu button released
| systemdown   | System button pressed
| systemup     | System button released
| trackpadup   | Trackpad pressed
| tracpaddown  | Trackpad released

