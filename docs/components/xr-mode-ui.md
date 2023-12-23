---
title: xr-mode-ui
type: components
layout: docs
parent_section: components
source_code: src/components/scene/xr-mode-ui.js
---

The xr-mode-ui component allows configuring and disabling of UI such as the enter VR / AR button, compatibility
modal, and orientation modal for mobile. The xr-mode-ui component applies only
to the [`<a-scene>` element][scene]. If we wish to simply toggle the UI, use CSS instead.


## Example

```html
<a-scene xr-mode-ui="enabled: false"></a-scene>
```

## Properties

| Property                | Description                                                         | Default Value | One of |
|-------------------------|---------------------------------------------------------------------|---------------|--------|
| `cardboardModeEnabled`  | Enables the now deprecated cardboard mode.                          | `false`       | -
| `enabled`               | Whether or not to display UI related to entering VR.                | `true`        | -
| `enterVRButton`         | Selector to a custom VR button. On click, the button will enter VR. | `''`          | -
| `enterVREnabled`        | If the VR button is displayed when applicable.                      | `true`        | -
| `enterARButton`         | Selector to a custom AR button. On click, the button will enter AR. | `''`          | -
| `enterAREnabled`        | If the AR button is displayed when applicable.                      | `true`        | -
| `XRMode`                | If the AR button, VR button, or both buttons will be displayed.     | `vr`          | `ar`, `vr`, `xr`

### Specifying a Custom Enter VR Button

Display only a custom Enter VR button when VR is supported. A custom AR button will not be displayed.

```html
<a-scene
  xr-mode-ui="enterVRButton: #myEnterVRButton;">
  <!-- Style the button with images and/or custom CSS. -->
  <a id="myEnterVRButton" href="#"></a>
</a-scene>
```

### Specifying a Custom Enter AR Button

Display only a custom Enter AR button when AR is supported. A custom VR button will not be displayed.

```html
<a-scene
  xr-mode-ui="enterARButton: #myEnterARButton; XRMode: ar;">
  <!-- Style the button with images and/or custom CSS. -->
  <a id="myEnterARButton" href="#"></a>
</a-scene>
```

### Specifying Custom Enter VR and Enter AR Buttons

Display a custom Enter VR Button when VR is supported and a custom Enter AR button when AR is supported.

```html
<a-scene
  xr-mode-ui="enterVRButton: #myEnterVRButton; enterARButton: #myEnterARButton; XRMode: xr;">
  <!-- Style the buttons with images and/or custom CSS. -->
  <a id="myEnterVRButton" href="#"></a>
  <a id="myEnterARButton" href="#"></a>
</a-scene>
```
> ( i ) This is similar to the behavior of the `vr-mode-ui` component that the `xr-mode-ui` component replaced in A-Frame 1.5.0.

[scene]: ../core/scene.md
