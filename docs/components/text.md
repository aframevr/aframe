---
title: text
type: components
layout: docs
parent_section: components
source_code: src/components/text.js
examples: []
---

The text component renders signed distance field (SDF) font text.

[exampleimage]: https://cloud.githubusercontent.com/assets/674727/22357731/f704544a-e3ee-11e6-8e6e-96c3c4e84958.png
![Example Image][exampleimage]

<!--toc-->

## Introduction

[three-bmfont-text]: https://github.com/Jam3/three-bmfont-text

Note that rendering text in 3D is hard. In 2D web development, text is the most
basic thing because the browser's renderer and layout engine handles
everything. In a 3D context, we don't have those luxuries. There are several
other different ways to render text in A-Frame including:

- [3D Text Geometry](https://www.npmjs.com/package/aframe-text-geometry-component)
- [HTML Materials (DOM-to-Canvas-to-Texture)](https://github.com/mayognaise/aframe-html-shader)
- Image Textures

As a default, we've selected SDF-based text to be included as a core component
due to its **relatively good performance and clarity**. This component uses
[mattdesl's `three-bmfont-text` library][three-bmfont-text]. The standard text
component has a long lineage, starting out as a community component and was
forked and improved several times before landing into A-Frame!

## Example

Here's a basic example of text defining just the content with not much other
configuration.

```html
<a-entity text="value: Hello World;"></a-entity>
```

See more examples to see configuration of alignments, anchors, baselines,
scaling, and auto-sizing.

[exampletext]: https://a-frobot.github.io/aframe/examples/test/text/index.html
[codetext]: https://github.com/aframevr/aframe/blob/master/examples/test/text/index.html
[exampleanchors]: https://a-frobot.github.io/aframe/examples/test/text/anchors.html
[codeanchors]: https://github.com/aframevr/aframe/blob/master/examples/test/text/anchors.html
[examplescenarios]: https://a-frobot.github.io/aframe/examples/test/text/scenarios.html
[codescenarios]: https://github.com/aframevr/aframe/blob/master/examples/test/text/scenarios.html
[examplesizes]: https://a-frobot.github.io/aframe/examples/test/text/sizes.html
[codesizes]: https://github.com/aframevr/aframe/blob/master/examples/test/text/sizes.html

- [Text Example][exampletext] ([code][codetext])
- [Text Anchors][exampleanchors] ([code][codeanchors])
- [Text Scenarios][examplescenarios] ([code][codescenarios])
- [Text Sizes][examplesizes] ([code][codesizes])

Open any of these example scenes, hit **`<ctrl> + <alt> + i`** to open the
Inspector, and play with all the possible values to see the effects instantly!

[textinspector]: https://cloud.githubusercontent.com/assets/674727/22358436/ea430ef4-e3f3-11e6-9dd9-e5e72e6e803a.png
![Inspecting Text][textinspector]

## Properties

[whitespace]: https://github.com/mattdesl/word-wrapper

| Property      | Description                                                                                                                                           | Default Value                     |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| align         | Multi-line text alignment (left, center, right).                                                                                                      | left                              |
| alphaTest     | Discard text pixels if alpha is less than this value.                                                                                                 | 0.5                               |
| anchor        | Horizontal positioning (left, center, right, align).                                                                                                  | center                            |
| baseline      | Vertical positioning (top, center, bottom).                                                                                                           | center                            |
| color         | Text color.                                                                                                                                           | white                             |
| font          | Font to render text, either the name of one of [A-Frame's stock fonts](#stock-fonts) or a URL to a font file                                          | default                           |
| fontImage     | Font image texture path to render text. Defaults to the `font`'s name with extension replaced to `.png`. Don't need to specify if using a stock font. | *derived from font name*          |
| height        | Height of text block.                                                                                                                                 | *derived from text size*          |
| letterSpacing | Letter spacing in pixels.                                                                                                                             | 0                                 |
| lineHeight    | Line height in pixels.                                                                                                                                | *derived from font file*          |
| opacity       | Opacity, on a scale from 0 to 1, where 0 means fully transparent and 1 means fully opaque.                                                            | 1.0                               |
| shader        | Shader used to render text.                                                                                                                           | sdf                               |
| side          | Side to render. (front, back, double)                                                                                                                 | front                             |
| tabSize       | Tab size in spaces.                                                                                                                                   | 4                                 |
| transparent   | Whether text is transparent.                                                                                                                          | true                              |
| **value**     | The actual content of the text. Line breaks and tabs are supported with `\n` and `\t`.                                                                | ''                                |
| whitespace    | How whitespace should be handled (i.e., normal, pre, nowrap). [Read more about whitespace][whitespace].                                               | normal                            |
| width         | Width in meters.                                                                                                                                      | *derived from geometry if exists* |
| wrapCount     | Number of characters before wrapping text (more or less).                                                                                             | 40                                |
| wrapPixels    | Number of pixels before wrapping text.                                                                                                                | *derived from wrapCount*          |
| zOffset       | Z-offset to apply to avoid Z-fighting if using with a geometry as a background.                                                                       | 0.001                             |

[threetextusage]: https://github.com/Jam3/three-bmfont-text#usage

The implementation is based on [mattdesl's three-bmfont-text][three-bmfont-text].
[Read more about the text properties][threetextusage].

## Events

| Event Name  | Description                                  |
|--- --- --- -|--- --- --- --- --- --- --- --- --- --- --- --|
| textfontset | Emitted when the font source has been loaded |

## Fonts

We can specify different fonts, although the process is not as simple as Web
Fonts. The text component defaults to `roboto` which uses a multi-channel
signed distance (MSDF) font. MSDF helps to preserve sharp corners and edges.

### Stock Fonts

Select from one of A-Frame's built-in fonts. These fonts will be loaded in from
over a CDN. If you want your application to work better offline, download these
fonts locally and point to them via a URL.

| Stock MSDF Fonts | URL                                          |
|------------------|----------------------------------------------|
| **roboto**       | https://cdn.aframe.io/fonts/Roboto-msdf.json |

| Stock SDF Fonts | URL                                              |
|-----------------|--------------------------------------------------|
| aileronsemibold | https://cdn.aframe.io/fonts/Aileron-Semibold.fnt |
| dejavu          | https://cdn.aframe.io/fonts/DejaVu-sdf.fnt       |
| exo2bold        | https://cdn.aframe.io/fonts/Exo2Bold.fnt         |
| exo2semibold    | https://cdn.aframe.io/fonts/Exo2SemiBold.fnt     |
| kelsonsans      | https://cdn.aframe.io/fonts/KelsonSans.fnt       |
| monoid          | https://cdn.aframe.io/fonts/Monoid.fnt           |
| mozillavr       | https://cdn.aframe.io/fonts/mozillavr.fnt        |
| sourcecodepro   | https://cdn.aframe.io/fonts/SourceCodePro.fnt    |

### Custom Fonts

Different fonts can be specified using the `font` and `fontImage` properties.

```html
<a-entity text="font: mozillavr; value: Via stock font name."></a-entity>
<a-entity text="font: https://cdn.aframe.io/fonts/mozillavr.fnt; value: Via URL."></a-entity>
<a-entity text="text: Hello World; font: ../fonts/DejaVu-sdf.fnt; fontImage: ../fonts/DejaVu-sdf.png"></a-entity>
```

If not specified, `fontImage` will be the `font`'s name, but with the extension
replaced to `.png`. For example, if the `font` path ends with `mozillavr.fnt`,
then the `fontImage` texture will default to `mozillavr.png`.

### Generating SDF Fonts

[hiero]: https://github.com/libgdx/libgdx/wiki/Hiero
[sdffonts]: https://github.com/libgdx/libgdx/wiki/Distance-field-fonts

On top of the stock fonts, we can generate SDF fonts using [Hiero][hiero], a
bitmap font packing tool. [See this guide for generating SDF fonts][sdffonts].

[msdfgen]: https://github.com/Chlumsky/msdfgen
[msdf-bmfont]: https://github.com/Jam3/msdf-bmfont

We can also generate MSDF fonts using [msdfgen] or [msdf-bmfont], although
these tools may be less mature. msdf-bmfont provides a friendlier wrapper
around that tool to generate MSDF font files from scalable TTF fonts

Below is an example comparing a font generated with Hiero, Arial Black, with
the SDF font, DejaVu:

[fontexampleimage]: http://i.imgur.com/iWtXHm5.png
![Arial Black vs. Deja Vu][fontexampleimage]

## Sizing

[position]: ./position.md
[scale]: ./scale.md

To change the size of the text, we can:

- Change the `width`.
- Change the `wrapCount` (roughly how many characters to fit inside the given width).
- Change `wrapPixels`.
- Change the [scale component][scale].
- [Position] the text closer or farther away.

[sizingimg]: https://cloud.githubusercontent.com/assets/674727/22358452/04528216-e3f4-11e6-8467-f03ac7f0e953.png
![Sizing][sizingimg]

Text can be wrapped by specifying width in A-Frame units.

### Auto-Scaling

The text component introduces special behavior when using alongside the
geometry component (e.g., a background plane) to fit. Note this only works with
2D-friendly geometries that define a width and height (i.e., `box`, `plane`).
The text can either be scaled, bounded, or aligned in relation to the geometry,
or the text can auto-scale the geometry to fit the text.

[geometryimg]: https://cloud.githubusercontent.com/assets/674727/22358470/218689d6-e3f4-11e6-9e00-62c9cb7867da.png
![Geometry Alignments][geometryimg]

#### Scaling Text to Fit Geometry

To have the text component's `width` property automatically scale to match the
geometry component's `width`, do not specify a `width` for the text component:

```html
<a-entity
  geometry="primitive: plane; width: 4; height: auto"
  material="color: blue"
  text="value: This text will be 4 units wide."></a-entity>
```

#### Scaling Geometry to Fit Text

To have the geometry automatically scale with the text, set the geometry
component's `width` and `height` properties to `auto`, and set the text
component's `width` as desired. In this example, the plane's `width` will be
set to 4 units, and its `height` will be set to match the actual height of the
text:

```html
<a-entity
  geometry="primitive: plane; height: auto; width: auto"
  material="color: blue"
  text="width: 4; value: This text will be 4 units wide."></a-entity>
```

Note that if neither `geometry` nor `text` specify a width, the text `width`
property will default to 1 unit (meter), and the geometry `width` property will
then become 1 unit as well.

```html
<a-entity
  geometry="primitive: plane"
  material="color: blue"
  text="value: 1-wide\ndefault."></a-entity>
```

## Limitations

The text component does not make use of all of the features of the
[`three-bmfont-text` library][three-bmfont-text] nor its sister modules.

[sdfsmooth]: https://lambdacube3d.wordpress.com/2014/11/12/playing-around-with-font-rendering/

Bitmap font rendering limits you to the characters included in the font
(*Unicode this is not*). SDF font rendering tends to produce smooth sharp edges
[though there are ways around this][sdfsmooth].

The generated text is not suitable for raycaster intersection testing. For raycaster or cursor detection it is necessary to use a geometry component along with the text component.

## Further Reading

If you are curious about the details of text rendering in WebGL, three.js, and
A-Frame, below are links to some background reading:

[mattdesl]: http://slides.com/mattdeslauriers/hacking-with-three-js#/7
[parris]: https://www.eventbrite.com/engineering/its-2015-and-drawing-text-is-still-hard-webgl-threejs/
[valve]: http://www.valvesoftware.com/publications/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf

- [`three-bmfont-text` documentation][three-bmfont-text]
- [*Hacking with three.js*][mattdesl]
- [*It's 2015 and drawing text is still hard (WebGL, ThreeJS)*][parris]
- [*Improved Alpha-Tested Magnification for Vector Textures and Special Effects*][valve]
