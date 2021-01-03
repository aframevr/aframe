---
title: <a-text>
type: primitives
layout: docs
parent_section: primitives
source_code: src/extras/primitives/primitives/a-text.js
---

[text]: ../components/text.md

Wraps the [text component][text].

## Example

```html
<a-text value="Hello, World!"></a-text>
```

## Attributes

| Attribute      | Component Mapping  |
|----------------|--------------------|
| align          | text.align         |
| alpha-test     | text.alphaTest     |
| anchor         | text.anchor        |
| baseline       | text.baseline      |
| color          | text.color         |
| font           | text.font          |
| font-image     | text.fontImage     |
| height         | text.height        |
| letter-spacing | text.letterSpacing |
| line-height    | text.lineHeight    |
| opacity        | text.opacity       |
| shader         | text.shader        |
| side           | text.side          |
| tab-size       | text.tabSize       |
| transparent    | text.transparent   |
| value          | text.value         |
| white-space    | text.whiteSpace    |
| width          | text.width         |
| wrap-count     | text.wrapCount     |
| wrap-pixels    | text.wrapPixels    |
| z-offset       | text.zOffset       |

## Usage Notes
Text positioned behind the camera will not be visible by default. One solution is to rotate it by 180 degrees on the y-axis. This also solves the problem of text behind the camera being rendered backwards. 
```html
<a-text value="behind camera" position=" 0 0 2" rotation="0 180 0"></a-text>
```
## Limitations

To interact with the text via raycaster or cursor, we need to add geometry like a plane to the text.

```html
<a-text value="Now Interactable" geometry="primitive:plane"></a-text>
```
