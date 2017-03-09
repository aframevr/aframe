---
title: vr-mode-ui
type: components
layout: docs
parent_section: components
---

The vr-mode-ui component toggles UI such as an Enter VR button, compatibility
modal, and orientation modal for mobile. The vr-mode-ui component applies only
to the [`<a-scene>` element][scene].

## Example

```html
<a-scene vr-mode-ui="enabled: false"></a-scene>
```

## Properties

| Property | Description                                          | Default Value |
|----------|------------------------------------------------------|---------------|
| enabled  | Whether or not to display UI related to entering VR. | true          |

[scene]: ../core/scene.md
