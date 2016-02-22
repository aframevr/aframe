---
title: Getting Started
section_title: Guide
type: guide
layout: docs
order: 1
parent_section: docs
section_order: 1
show_guide: true
---

A-Frame is a framework for creating virtual reality web experiences that work across desktop, mobile, and the Oculus Rift.

There are several ways to get started with A-Frame:

* [Boilerplate (starter kit)](installation.html#Boilerplate_Starter_Kit)
* [npm package](installation.html#npm)
* [CDN-hosted JS file](installation.html#Standalone_Downloads)
* [example scene on CodePen](http://codepen.io/team/mozvr/pen/BjygdO?editors=100)

See __[Installation](installation.html)__ for details. 

To start an A-Frame scene, we import the [A-Frame JavaScript file](https://aframe.io/releases/latest/aframe.min.js), and add an `<a-scene>` element. Every A-Frame object—from cubes to entities to animations—need to be placed within an `<a-scene></a-scene>`.

```html
<!doctype html>
<html>
  <head>
    <title>My first VR site</title>
    <script src="https://aframe.io/releases/latest/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
    </a-scene>
  </body>
</html>
```

Our A-Frame scene is ready to start adding objects to! Let's start with a simple cube.

```html
<!doctype html>
<html>
  <head>
    <title>My first VR site</title>
    <script src="https://aframe.io/releases/latest/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-cube></a-cube>
    </a-scene>
  </body>
</html>
```

When we open our scene in the browser, we can see the cube!
