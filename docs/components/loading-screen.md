---
title: loading-screen
type: components
layout: docs
parent_section: components
examples: []
---

The loading screen component configures the loading screen visual style.

To configure the style of the loader title bar one can redefine
`.a-loader-title` style. The example below sets the text color to red:

```css
 .a-loader-title {
   color: red;
 }
```

The title text is set to whatever is in `document.title` or `<title></title>`.

## Example

The example below sets the background color to black and dots color to red.

```html
<a-scene loading-screen="dotsColor: red; backgroundColor: black"></a-scene>
```

## Properties

| Property        | Description                                               | Default Value |
|-----------------|-----------------------------------------------------------|---------------|
| dotsColor       | Loader dots color.                                        | white         |
| backgroundColor | Loader background color.                                  | #24CAFF       |
| enabled         | Enables / Disables the loading screen.                    | true          |
