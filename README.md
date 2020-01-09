<h1 align="center">A-Frame</h1>

<p align="center"><a href="https://aframe.io" target="_blank"><img width="480" alt="A-Frame" src="https://user-images.githubusercontent.com/674727/32120889-230ef110-bb0f-11e7-908c-76e39aa43149.jpg"></a></p>

<p align="center"><b>A web framework for building virtual reality experiences.</b></p>

<p align="center">
  <a href="https://travis-ci.org/aframevr/aframe"><img src="https://img.shields.io/travis/aframevr/aframe.svg?style=flat-square" alt="Build Status"></a>
  <a href="https://codecov.io/gh/aframevr/aframe">
    <img src="https://codecov.io/gh/aframevr/aframe/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="https://img.shields.io/npm/dt/aframe.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="https://img.shields.io/npm/v/aframe.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://npmjs.com/package/aframe">
    <img src="https://img.shields.io/npm/l/aframe.svg?style=flat-square" alt="License"></a>
  </a>
</p>

<div align="center">
  <a href="https://aframe.io">Site</a>
  &mdash;
  <a href="https://aframe.io/docs/">Docs</a>
  &mdash;
  <a href="https://aframe.io/school/">School</a>
  &mdash;
  <a href="https://aframe.io/slack-invite/">Slack</a>
  &mdash;
  <a href="https://aframe.io/blog/">Blog</a>
  &mdash;
  <a href="https://aframe.io/subscribe/">Newsletter</a>
</div>

## Examples

<a href="https://supermedium.com/supercraft">
  <img alt="Supercraft" target="_blank" src="https://user-images.githubusercontent.com/674727/41085457-f5429566-69eb-11e8-92e5-3210e4c6c4a0.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-painter/?url=https://ucarecdn.com/962b242b-87a9-422c-b730-febdc470f203/">
  <img alt="A-Painter" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531388/acfc3dda-156d-11e7-8563-5bd75252f70f.gif" height="190" width="32%">
</a>
<a href="https://supermedium.com">
  <img alt="Supermedium" target="_blank" src="https://user-images.githubusercontent.com/674727/37294616-7212cd20-25d3-11e8-9e7f-c0c61074f1e0.png" height="190" width="32%">
</a>
<a href="https://aframe.io/a-blast/">
  <img alt="A-Blast" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531440/0336e66e-156e-11e7-95c2-f2e6ebc0393d.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-saturday-night/">
  <img alt="A-Saturday-Night" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531477/44272daa-156e-11e7-8ef9-d750ed430f3a.gif" height="190" width="32%">
</a>
<a href="https://github.com/googlecreativelab/webvr-musicalforest">
  <img alt="Musical Forest by @googlecreativelab" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/25109861/b8e9ec48-2394-11e7-8f2d-ea1cd9df69c8.gif" height="190" width="32%">
</a>

*Find more examples on [the homepage](https://aframe.io), [A Week of A-Frame](https://aframe.io/blog/), and [WebVR Directory](https://webvr.directory).*

## Features

:eyeglasses: **Virtual Reality Made Simple**: A-Frame handles the 3D and WebVR
boilerplate required to get running across platforms including mobile, desktop,
Vive, and Rift just by dropping in `<a-scene>`.

:heart: **Declarative HTML**: HTML is easy to read and copy-and-paste. Since
A-Frame can be used from HTML, A-Frame is accessible to everyone: web
developers, VR enthusiasts, educators, artists, makers, kids.

:electric_plug: **Entity-Component Architecture**: A-Frame is a powerful
framework on top of three.js, providing a declarative, composable, reusable
entity-component structure for three.js. While A-Frame can be used from HTML,
developers have unlimited access to JavaScript, DOM APIs, three.js, WebVR, and
WebGL.

:zap: **Performance**: A-Frame is a thin framework on top of three.js.
Although A-Frame uses the DOM, A-Frame does not touch the browser layout
engine. Performance is a top priority, being battle-tested on highly
interactive WebVR experiences.

:globe_with_meridians: **Cross-Platform**: Build VR applications for Vive,
Rift, Daydream, GearVR, and Cardboard. Don't have a headset or controllers? No
problem! A-Frame still works on standard desktop and smartphones.

:mag: **Visual Inspector**: A-Frame provides a built-in visual 3D inspector
with a workflow similar to a browser's developer tools and interface similar to
Unity. Open up any A-Frame scene and hit `<ctrl> + <alt> + i`.

:runner: **Features**: Hit the ground running with A-Frame's built-in
components such as geometries, materials, lights, animations, models,
raycasters, shadows, positional audio, tracked controllers. Get even further
with community components such as particle systems, physics, multiuser, oceans,
mountains, speech recognition, or teleportation!

## Usage

### Example

Build VR scenes in the browser with just a few lines of HTML! To start playing
and publishing now, remix the starter example on:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe) [![Fork](https://user-images.githubusercontent.com/39342/52831020-d42dcb80-3087-11e9-833f-2d6191c69eb9.png)](https://repl.it/@dmarcos/aframe)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.0.3/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

With A-Frame's [entity-component
architecture](https://aframe.io/docs/1.0.3/introduction/entity-component-system.html), we can drop in community
components from the ecosystem (e.g., ocean, physics) and plug them into our
objects straight from HTML:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe-registry) [![Fork](https://user-images.githubusercontent.com/39342/52831020-d42dcb80-3087-11e9-833f-2d6191c69eb9.png)](https://repl.it/@dmarcos/aframe)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.0.3/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-particle-system-component@1.0.x/dist/aframe-particle-system-component.min.js"></script>
    <script src="https://unpkg.com/aframe-extras.ocean@%5E3.5.x/dist/aframe-extras.ocean.min.js"></script>
    <script src="https://unpkg.com/aframe-gradient-sky@1.0.4/dist/gradientsky.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-entity id="rain" particle-system="preset: rain; color: #24CAFF; particleCount: 5000"></a-entity>

      <a-entity id="sphere" geometry="primitive: sphere"
                material="color: #EFEFEF; shader: flat"
                position="0 0.15 -5"
                light="type: point; intensity: 5"
                animation="property: position; easing: easeInOutQuad; dir: alternate; dur: 1000; to: 0 -0.10 -5; loop: true"></a-entity>

      <a-entity id="ocean" ocean="density: 20; width: 50; depth: 50; speed: 4"
                material="color: #9CE3F9; opacity: 0.75; metalness: 0; roughness: 1"
                rotation="-90 0 0"></a-entity>

      <a-entity id="sky" geometry="primitive: sphere; radius: 5000"
                material="shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210"
                scale="-1 1 1"></a-entity>

      <a-entity id="light" light="type: ambient; color: #888"></a-entity>
    </a-scene>
  </body>
</html>
```

### Builds

To use the latest stable build of A-Frame, include [`aframe.min.js`](https://aframe.io/releases/1.0.3/aframe.min.js):

```js
<head>
  <script src="https://aframe.io/releases/1.0.3/aframe.min.js"></script>
</head>
```

To check out the stable and master builds, see the [`dist/` folder](dist/).

### npm

```sh
npm install --save aframe
# Or yarn add aframe
```

```js
require('aframe')  // e.g., with Browserify or Webpack.
```

## Local Development

```sh
git clone https://github.com/aframevr/aframe.git  # Clone the repository.
cd aframe && npm install  # Install dependencies.
npm start  # Start the local development server.
```

And open in your browser **[http://localhost:9000](http://localhost:9000)**.

### Generating Builds

```sh
npm run dist
```

## Questions

For questions and support, [ask on StackOverflow](https://stackoverflow.com/questions/ask/?tags=aframe).

## Stay in Touch

- To hang out with the community, [join the A-Frame Slack](https://aframe.io/slack-invite/).
- [Follow `A Week of A-Frame` on the A-Frame blog](https://aframe.io/blog).
- [Follow @aframevr on Twitter](https://twitter.com/aframevr).
- [Subscribe to the Newsletter](https://aframe.io/subscribe/).

And get in touch with the maintainers!

- [Diego Marcos](https://twitter.com/dmarcos)
- [Don McCurdy](https://twitter.com/donrmccurdy)
- [Kevin Ngo](https://twitter.com/andgokevin)

## Contributing

Get involved! Check out the [Contributing Guide](CONTRIBUTING.md) for how to get started.

## License


Apache License
                           Version 2.0, January 2004
                        https://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2019 Rolando Gopez Lacuata.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
