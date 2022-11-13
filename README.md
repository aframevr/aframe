<h1 align="center">A-Frame</h1>

<p align="center"><a href="https://aframe.io" target="_blank"><img width="480" alt="A-Frame" src="https://user-images.githubusercontent.com/674727/32120889-230ef110-bb0f-11e7-908c-76e39aa43149.jpg"></a></p>

<p align="center"><b>가상 현실 경험을 만들기 위한 웹 프레임워크.</b></p>

<p align="center">
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
  <a href="https://aframe.io">사이트</a>
  &mdash;
  <a href="https://aframe.io/docs/">문서</a>
  &mdash;
  <a href="https://aframe.io/school/">School</a>
  &mdash;
  <a href="https://aframevr.slack.com/join/shared_invite/zt-f6rne3ly-ekVaBU~Xu~fsZHXr56jacQ">Slack</a>
  &mdash;
  <a href="https://aframe.io/blog/">블로그</a>
  &mdash;
  <a href="https://aframe.io/subscribe/">뉴스레터</a>
</div>

## 예제

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

[홈페이지](https://aframe.io), [주간 A-Frame](https://aframe.io/blog/), [WebVR Directory](https://webvr.directory) 에서 더 많은 예제를 찾아보세요.

## 특징

:eyeglasses: **가상현실을 쉽게 제작**: 그냥 `<script>` 태그와 `<a-scene>` 태그를 넣으세요.
A-Frame은 3D 보일러 플레이트, VR 세팅, 기본적인 컨트롤을 대신 해줍니다. 설치도, 빌드도 필요 없습니다.
:eyeglasses: **Virtual Reality Made Simple**: A-Frame handles the 3D and WebVR
boilerplate required to get running across platforms including mobile, desktop, Vive, and Rift just by dropping in `<a-scene>`.

:heart: **선언적인 HTML**: HTML은 읽고, 이해하고, 복붙하기 쉽습니다.
HTML을 기반으로 만들어진 A-Frame은 웹 개발자, VR 애호가, 아티스트, 디자이너, 교육자, 제작자, 어린이 등 모두가 쉽게 시작할 수 있습니다.

:electric_plug: **Entity-Component 아키텍쳐**: A-Frame은 선언적, 구성적, 재사용 가능한 [entity-component 구조][ecs] 를 제공하는 [three.js] 프레임워크 입니다.
HTML을 기반으로 만들어졌다는건 팁들 중 빙산의 일각일 뿐, JavaScript, DOM API, three.js, WebVR, WebGL 에 무제한적으로 접근할 수 있습니다.

:zap: **성능**:  A-Frame은 three.js를 기반으로 제작된 가벼운 프레임워크 입니다.
A-Frame이 DOM을 사용하는동안, 해당 요소는 브라우저 레이아웃 엔진을 건드리지 않습니다.
성능은 가장 중요한 사항이며, 고도로 상호 작용하는 WebVR 경험에서 battle-test를 거쳤습니다.

:globe_with_meridians: **크로스 플랫폼 VR**: Vive, Rift, Windows Mixed Reality, Daydream, GearVR, 카드보드 각각의 모든 컨트롤러를 지원하는 VR 애플리케이션을 빌드하세요.
헤드셋이나 컨트롤러가 없으신가요? 문제 없습니다!
A-Frame은 데스크탑이나 스마트폰에서와 동일하게 작동합니다.

:mag: **시각적 편집기**: A-Frame은 브라우저의 개발자 도구나 Unity와 유사한 인터페이스를 갖춘 편리한 내장 [시각적 3D 편집기][inspector] 를 제공합니다.
아무 A-Frame scene을 연 뒤, `<ctrl> + <alt> + i` 또는 `<ctrl> + <option> + i` 를 눌러보세요.

:runner: **기능**: geometry, material, 빛, 애니메이션, 모델, raycaster, 그림자, 위치 오디오, 글자, 컨트롤 같은 A-Frame의 핵심 컴포넌트들은 대부분의 메이저 헤드셋을 지원합니다.
환경, 상태, 파티클 시스템, 물리 엔진, 멀티 유저, 바다, 텔레포트, 슈퍼 핸드, 증강 현실 등 수백개의 커뮤니티로부터 더 많은 컴포넌트를 얻을 수 있습니다!

## 사용법

### 예제

몇 줄의 HTML만을 작성해도 VR scene을 브라우저에 구축할 수 있습니다!
지금 당장 실행해보고 게시해보고 싶다면, 이 시작 예제를 remix 해보세요:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe) [![Fork](https://user-images.githubusercontent.com/39342/52831020-d42dcb80-3087-11e9-833f-2d6191c69eb9.png)](https://repl.it/@dmarcos/aframe)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
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

A-Frame의 [entity-component 아키텍쳐](https://aframe.io/docs/1.3.0/introduction/entity-component-system.html) 를 이용하여, 커뮤니티에서 에코시스템(바다, 물리 엔진 등)을 HTML에서 사용하는 코드:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe-registry) [![Fork](https://user-images.githubusercontent.com/39342/52831020-d42dcb80-3087-11e9-833f-2d6191c69eb9.png)](https://repl.it/@dmarcos/aframe)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-particle-system-component@1.0.x/dist/aframe-particle-system-component.min.js"></script>
    <script src="https://unpkg.com/aframe-extras.ocean@%5E3.5.x/dist/aframe-extras.ocean.min.js"></script>
    <script src="https://unpkg.com/aframe-gradient-sky@1.3.0/dist/gradientsky.min.js"></script>
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

### 빌드

A-Frame의 stable 빌드를 [`aframe.min.js`](https://aframe.io/releases/1.3.0/aframe.min.js) 이용하는 코드:

```js
<head>
  <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
</head>
```

stable 및 master 빌드를 확인하려면 [`dist/` 경로](dist/) 를 참고하세요.

### npm

```sh
npm install --save aframe
# Or yarn add aframe
```

```js
require('aframe')  // e.g., with Browserify or Webpack.
```

## 로컬에서 개발하기

```sh
git clone https://github.com/aframevr/aframe.git  # Clone the repository.
cd aframe && npm install  # Install dependencies.
npm start  # Start the local development server.
```

그리고 브라우저에서 **[http://localhost:9000](http://localhost:9000)** 에 들어가세요.

### 빌드하기

```sh
npm run dist
```

## 질문하기

도움이 필요하시면, [StackOverflow](https://stackoverflow.com/questions/ask/?tags=aframe) 에 질문을 남기세요.

## 연락하기

- 커뮤니티에 참여하시려면, [A-Frame Slack에 참여](https://aframevr.slack.com/join/shared_invite/zt-f6rne3ly-ekVaBU~Xu~fsZHXr56jacQ) 하세요.
- [`주간 A-Frame` 및 A-Frame 블로그](https://aframe.io/blog) 를 팔로우 하세요.
- [트위터 계정 @aframevr 을 팔로우 하세요](https://twitter.com/aframevr).
- [뉴스레터를 구독하세요](https://aframe.io/subscribe/).

그리고 메인테이너들의 소식을 접하실 수 있습니다!

- [Diego Marcos](https://twitter.com/dmarcos)
- [Don McCurdy](https://twitter.com/donrmccurdy)
- [Kevin Ngo](https://twitter.com/andgokevin)

## 기여하기

기여를 해보시려면 [가이드](CONTRIBUTING.md) 를 확인하세요!

[멋진 디자인의 A-Frame 티셔츠를 구입하여](https://cottonbureau.com/products/a-frame-og#/9479538/tee-men-standard-tee-vintage-black-tri-blend-s) 개발을 지원할 수도 있습니다.

## 라이선스

이 프로그램은 무료 소프트웨어이며 [MIT License](LICENSE) 에 따라 배포됩니다.
