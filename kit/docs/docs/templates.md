# Templates

A-Frame provides a custom element to extend the native [HTML Templates](http://www.w3.org/TR/html-templates/).

Templates enable simple creation and reuse of encapsulated elements.

* [__Template definitions__](#templates-defining-templates) register a custom element that can be composed of child elements.
* [__Template instances__](#templates-using-templates) create an instance of the template's contents.

## Defining templates

Template definitions allow you to define default variable values.

The template definition is a specialized template that wraps its contents in the primitive `<a-object>` element and binds its attributes to values for string interpolation before an instance is created. One definition can be used to create multiple instances of the template's contents.

The template definition is a [type-extension custom element](http://www.w3.org/TR/custom-elements/#dfn-type-extension) that extends the built-in `<template>` element, so it must be written as `<template is="a-template">`.

You must use the `element` attribute to specify the name of the custom element to be registered. That is, if you create a `<template is="a-template" element="a-box">`, anywhere in your scene you will be able to create a `<a-box>`.

Inside a template definition, you can access any attributes passed from the template instance. Any attributes not passed will default to the values of the attributes defined in the template instances.

<a name="defining-templates-inline-example"></a>
You can create a new template with the following syntax:

```html
<template is="a-template"
          element="a-box"
          width="5"
          height="5"
          depth="5"
          color="gray">
  <a-object geometry="primitive: box;
                      width: ${width};
                      height: ${height};
                      depth: ${depth}"
            material="color: ${color}"></a-object>
</template>
```

Attributes do not necessarily have to be defined in the template definition to be used when creating (and re-rendering) the contents of the template instance:

```html
<template is="a-template" element="a-box">
  <a-object geometry="primitive: box;
                       width: ${width};
                       height: ${height};
                       depth: ${depth}"
             material="color: ${color}"></a-object>
</template>
```

<p class="warning">
  _Note:_ However, best practice is to always define the expected attributes (and provide defaults) when possible in your template definitions.
</p>

### Inline Templates

[See the above example.](#defining-templates-inline-example)

To define the template inline in your HTML document, place the `<template>` anywhere in the `<body>`.

[View example >](http://mozvr.github.io/aframe/examples/templates/boxes-inlined.html)

### Imported Templates

A-Frame uses [HTML Imports](http://www.w3.org/TR/html-imports/) to allow templates (and mixins) to be defined in separate HTML documents outside of the main document of your scene.

Imports are HTML documents that are linked as external resources from another HTML document. You can also nest imports — that is, include imports from imports.

[View example of imported template >](http://mozvr.github.io/aframe/examples/templates/templates/a-box.html)

That HTML document can then be referenced as an HTML Import:

```html
<link rel="import" src="box.html">
```

[View example scene >](http://mozvr.github.io/aframe/examples/templates/boxes-imported.html)

<p class="warning">
  _Note:_ As of this writing, Chrome is the only browser that natively supports HTML Imports. A-Frame ships with [a polyfill](https://github.com/webcomponents/webcomponentsjs/tree/master/src/HTMLImports) for all other browsers.
  <br><br>
  It works splendidly with the only caveat being that the document must be served with proper [Cross-Origin Resource Sharing (CORS) headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). For what it's worth, the free and awesome [GitHub Pages](https://pages.github.com/) enable CORS headers on all HTML documents.
</p>

## Using templates

Template instances allow you to create multiple instances from registered template definitions.

With both [inline templates](#templates-defining-templates-inline-templates) and [imported templates](#templates-defining-templates-imported-templates), if we have defined the template definition for a `<a-box>`, we can create multiple instances in our scene:

```html
<body>
  …
  <template is="a-template"
            element="a-box"
            width="5"
            height="5"
            depth="5"
            color="gray">
  <a-object geometry="primitive: box;
                      width: ${width};
                      height: ${height};
                      depth: ${depth}"
            material="color: ${color}"></a-object>
</template>

  <a-scene>
    <a-box color="hotpink" position="-10 0 0" scale=".5 .5 .5"></a-box>
    <a-box color="cyan" position="1 -3 0" rotation="25 -45 0"></a-box>
  </a-scene>
</body>
```

[View example >](http://mozvr.github.io/aframe/examples/templates/boxes-inlined.html)

## Sharing templates

If you'd like to share some A-Frame templates that you think would be useful for others building A-Frame scenes, feel free to simply open a pull request on the __[A-Frame GitHub repository](https://github.com/MozVR/aframe)__!

__[View templates on GitHub >](https://github.com/MozVR/aframe/tree/master/core/templates)__