---
title: device-orientation-permission-ui
type: components
layout: docs
parent_section: components
source_code: src/components/scene/device-orientation-permission-ui.js
---

Starting with Safari on iOS 13 browsers require sites to be served over `https` and request user permission to access DeviceOrientation events. This component presents a permission dialog for the user to grant or deny access.
The device-orientation-permission-ui component applies only to the [`<a-scene>` element][scene]

To configure the style of the dialog one can redefine the associated css styles. To change the colors of the allow, deny and ok buttons:

```css
.a-dialog-allow-button {
  background-color: red;
}

.a-dialog-deny-button {
  background-color: blue;
}

.a-dialog-ok-button {
   background-color: green;
 }
```

The dialog can also be disabled all together if you prefer to handle the permissions workflow differently.

## Example

```html
<a-scene device-orientation-permission-ui="enabled: false"></a-scene>
```

## Properties

| Property      | Description                                                         | Default Value |
|---------------|---------------------------------------------------------------------|---------------|
| enabled       | Whether or not to display the dialog when required                  | true          |
| denyButtonText       | Deny button text                 | English text       |
| allowButtonText       | Allow button text                 | English text       |
| cancelButtonText       | Cancel button text                 | English text       |
| deviceMotionMessage       | Message in dialog requesting user permission to enable the Device Motion API.                 | English text       |
| mobileDesktopMessage       | Message displayed in modal requesting user to switch to mobile browsing mode.                  | English text          |
| httpsMessage       | Message requesting user to switch to HTTPS.                  | English text          |


## Events

| Event Name                           | Description                                                                                |
|--------------------------------------|--------------------------------------------------------------------------------------------|
| deviceorientationpermissiongranted   | User has granted access to DeviceOrientation events                                        |
| deviceorientationpermissionrejected  | User or browser has denied access to DeviceOrientation events                              |
| deviceorientationpermissionrequested | Application has requested permission to access DeviceOrientation events                    |

[scene]: ../core/scene.md
