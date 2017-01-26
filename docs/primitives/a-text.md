---
parent_section: primitives
---

[text]: ../components/text.md
The a-text primitive renders bitmap and signed distance field font text using the [text][text] component.

## Properties

| Property       | Component Map      |                        Description                      |     Default Value     |
|:--------------:|:------------------:|:-------------------------------------------------------:|:---------------------:|
| align          | text.align         | Multi-line text alignment (left, center, right).        | left                  |
| alpha-test     | text.alphaTest     | Discard text pixels if alpha is less than this.         | 0.5                   |
| anchor         | text.anchor        | Horizontal positioning (left, center, right, align).    | center                |
| baseline       | text.baseline      | Vertical positioning (top, center, bottom).             | center                |
| color          | text.color         | Text color.                                             | #000 (which is black) |
| font           | text.font          | Font file to render text. (stock names; or .fnt URL)    | default               |
| font-image     | text.fontImage     | Font image to render text. (from font, or override)     | undefined (from font) |
| height         | text.height        | Height of text block.                                   | undefined (from text) |
| letter-spacing | text.letterSpacing | The letter spacing, in pixels.                          | 0                     |
| line-height    | text.lineHeight    | The line height, in pixels.                             | undefined (from font) |
| opacity        | text.opacity       | Opacity (0 = fully transparent, 1 = fully opaque)       | 1.0                   |
| shader         | text.shader        | Shader to render text. (modifiedsdf, sdf, basic, msdf)  | modifiedsdf           |
| side           | text.side          | Side to render. (front, back, double)                   | front                 |
| tabSize        | text.tabSize       | Tab size, in spaces.                                    | 4                     |
| transparent    | text.transparent   | Should text be transparent?                             | true                  |
| value          | text.value         | The text to render.                                     |                       |
| whitespace     | text.whitespace    | How should whitespace be handled? (normal, pre, nowrap) | normal                |
| width          | text.width         | Width (default = geometry width, DEFAULT_WIDTH if none) |                       |
| wrap-count     | text.wrapCount     | Wrap after this many font characters (more or less).    | 40                    |
| wrap-pixels    | text.wrapPixels    | Wrap after this many pixels.                            | undefined (wrapCount) |
| z-offset       | text.zOffset       | Z offset to apply to avoid Z-fighting.                  | 0.001                 |

More details on these properties [here](https://github.com/Jam3/three-bmfont-text#usage).

Explanation of whitespace (formerly 'mode') property [here](https://github.com/mattdesl/word-wrapper).

## Usage

Write some text:

```html
<a-entity text="text: Hello World;"></a-entity>
```

To change the size of the text, increase width, decrease wrapCount (roughly how many characters to fit inside the given width) or wrapPixels,
use the [scale](https://aframe.io/docs/master/components/scale.html) component or position the text closer or further away.

Text can be wrapped by specifying width in A-Frame units.

## Custom Fonts

A guide for generating SDF fonts can be found [here](https://github.com/libgdx/libgdx/wiki/Distance-field-fonts);
here is an example comparing [Arial Black and DejaVu](http://i.imgur.com/iWtXHm5.png). 
Bitmap fonts also work, but do not look nearly as good.

Different fonts can be specified with the 'font' and 'fontImage' properties.

```html
<a-entity text="text: Hello World; font:../fonts/DejaVu-sdf.fnt; fontImage:../fonts/DejaVu-sdf.png">
</a-entity>
```

## Limitations

This component does not make use of all of the features of [three-bmfont-text](https://github.com/Jam3/three-bmfont-text) and its sister modules.

Bitmap font rendering limits you to the characters included in the font (Unicode this is not). 
SDF font (in particular) tends to smooth sharp edges though [there are ways around this](https://lambdacube3d.wordpress.com/2014/11/12/playing-around-with-font-rendering/).

#### Additional Information

If you are interested in text rendering in WebGL/ThreeJS/A-Frame and want to learn more,
reading the documentation for [three-bmfont-text](https://github.com/Jam3/three-bmfont-text) is recommended. 

Here are some additional resources:

- ['It’s 2015 and drawing text is still hard (WebGL, ThreeJS)' by Parris Khachi](https://www.eventbrite.com/engineering/its-2015-and-drawing-text-is-still-hard-webgl-threejs/)
- [Valve's original paper](http://www.valvesoftware.com/publications/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf)
- ['Hacking with THREE.js' by Matt DesLauriers](http://slides.com/mattdeslauriers/hacking-with-three-js#/13)
