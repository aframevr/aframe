---
title: xr-mode-ui
type: components
layout: docs
parent_section: components
source_code: src/components/scene/xr-mode-ui.js
---

The xr-mode-ui component configures or disables the enter VR and AR buttons. Buttons only display if the browser supports the corresponding modes (AR or VR). The xr-mode-ui component applies only
to the [`<a-scene>` element][scene]. If we wish to simply toggle the UI, use CSS instead.

## Example

```html
<a-scene xr-mode-ui="enabled: false"></a-scene>
```

## Properties

| Property | Description | Default Value |
| - | - | - |
| enabled | Whether or not to display UI related to entering VR. | true |
| enterVRButton | Selector to a custom VR button. On click, the button will enter VR. | '' |
| enterVREnabled | If the VR button is displayed when applicable.| true |
| enterARButton | Selector to a custom AR button. On click, the button will enter AR. | '' |
| enterAREnabled | If the AR button is displayed when applicable. | true |
| XRMode | If the AR button (ar), VR button (vr), or both buttons will be displayed (xr). | vr |

### Specifying Custom Enter VR and AR Buttons

```html
<a-scene
  xr-mode-ui="enterVRButton: #myEnterVRButton; enterARButton: #myEnterARButton; XRMode: xr;">
  <!-- Style the button with images and/or custom CSS. -->
  <a id="myEnterVRButton" href="#"></a>
  <a id="myEnterARButton" href="#"></a>
</a-scene>
```

[scene]: ../core/scene.md
