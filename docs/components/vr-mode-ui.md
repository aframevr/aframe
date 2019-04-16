---
title: vr-mode-ui
type: components
layout: docs
parent_section: components
source_code: src/components/scene/vr-mode-ui.js
---

The vr-mode-ui component allows disabling of UI such as an Enter VR button, compatibility
modal, and orientation modal for mobile. The vr-mode-ui component applies only
to the [`<a-scene>` element][scene]. If we wish to simply toggle the UI, use CSS instead.

## Example

```html
<a-scene vr-mode-ui="enabled: false"></a-scene>
```

## Properties

| Property      | Description                                                         | Default Value |
|---------------|---------------------------------------------------------------------|---------------|
| enabled       | Whether or not to display UI related to entering VR.                | true          |
| enterVRButton | Selector to a custom VR button. On click, the button will enter VR. | ''            |

### Specifying a Custom Enter VR Button

```html
<a-scene vr-mode-ui="enterVRButton: #myEnterVRButton">
  <!-- Style the button with images or whatever. -->
  <a id="myEnterVRButton" href="#"></a>
</a-scene>
```

[scene]: ../core/scene.md
