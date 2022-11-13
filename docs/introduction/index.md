---
title: 소개
section_title: 소개
type: introduction
layout: docs
order: 1
parent_section: docs
section_order: 1
installation: true
examples:
  - title: Hello, World!
    src: https://glitch.com/edit/#!/aframe?path=index.html
---

[three.js]: https://threejs.org

## 시작하기

[glitch]: http://glitch.com/~aframe

A-Frame은 아무것도 설치되지 않은 HTML에서도 개발을 할 수 있습니다.
A-Frame을 시작해보는 가장 좋은 방법은, 무료로 즉시 배포가 가능한 온라인 코드 에디터 **[Glitch에서 첫 예제를 remix][glitch]** 해보는 것 입니다.
아니면, `.html` 파일을 만들고, `<head>` 태그에 A-Frame을 추가해보세요:

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

[Installation]: ./installation.md
[school]: https://aframe.io/school/

[설치][Installation] 페이지에서는, A-Frame을 시작하기 위한 추가 예제를 제공합니다.
[A-Frame School][school] 에서 단계적인 수업을 통해 A-Frame을 학습해보세요.

## A-Frame 이란?

[github]: https://github.com/aframevr/
[comunity]: https://aframe.io/community/

![A-Frame](https://cloud.githubusercontent.com/assets/674727/25392020/6f011d10-298c-11e7-845e-c3c5baebd14d.jpg)

:a:-Frame은 Virtual Reality(VR) 을 위한 웹 프레임워크 입니다.
HTML을 기반으로 제작되어 아주 쉽고, 단순히 3D Scene 그래프나 마크업 언어가 아니라 [three.js] 를 이용해 만든 선언적, 확장성, 합성 가능한 구조의 강력한 Entity-Component 프레임워크 입니다.

A-Frame은 VR 컨텐츠를 손쉽게 개발하기 위해 Mozilla 에서 처음 만들었지만, 지금은 [Supermedium](https://supermedium.com) 의 공동 제작자들이 관리하고 있습니다.
[독립적인 오픈소스 프로젝트][github] 인 A-Frame은, [가장 큰 VR 커뮤니티][community] 중 하나로 성장하였습니다.

A-Frame은 Vive, Rift, Windows Mixed Reality, Daydream, GearVR, Cardboard, Oculus Go 깉은 VR 헤드셋 및 Argumented Reality(AR)을 지원합니다.
전체 스펙트럼을 지원하지만, 포지셔닝 트래킹과 컨트롤러를 적극 활용한
360&deg; 컨텐츠를 기반으로 상호작용 가능한 몰입형 VR 경험에 초점을 맞춰서 개발되었습니다.

<div class="docs-introduction-examples">
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
</div>

## 특징

:eyeglasses: **VR을 쉽게**: 그냥 `<script>` 태그와 `<a-scene>` 태그를 넣으세요.
A-Frame은 3D 보일러 플레이트, VR 세팅, 기본적인 컨트롤을 대신 해줍니다. 설치도, 빌드도 필요 없습니다.

:heart: **선언적인 HTML**: HTML은 읽고, 이해하고, 복붙하기 쉽습니다.
HTML을 기반으로 만들어진 A-Frame은 웹 개발자, VR 애호가, 아티스트, 디자이너, 교육자, 제작자, 어린이 등 모두가 쉽게 시작할 수 있습니다.

:electric_plug: **Entity-Component 아키텍쳐**: A-Frame은 선언적, 구성적, 재사용 가능한 [entity-component 구조][ecs] 를 제공하는 [three.js] 프레임워크 입니다.
HTML을 기반으로 만들어졌다는건 팁들 중 빙산의 일각일 뿐, JavaScript, DOM API, three.js, WebVR, WebGL 에 무제한적으로 접근할 수 있습니다.

:globe_with_meridians: **크로스 플랫폼 VR**: Vive, Rift, Windows Mixed Reality, Daydream, GearVR, 카드보드 각각의 모든 컨트롤러를 지원하는 VR 애플리케이션을 빌드하세요.
헤드셋이나 컨트롤러가 없으신가요? 문제 없습니다!
A-Frame은 데스크탑이나 스마트폰에서와 동일하게 작동합니다.

[ecs]: ./entity-component-system.md

[A-Painter]: https://github.com/aframevr/a-painter
[Tilt Brush]: https://www.tiltbrush.com/

:zap: **성능**:  A-Frame은 WebVR에 최적화되어 있습니다.
A-Frame이 DOM을 사용하는동안, 해당 요소는 브라우저 레이아웃 엔진을 건드리지 않습니다.
3D 오브젝트의 업데이트는 모두 메모리에서 처리되며, 약간의 garbage와 오버헤드를 발생시킬 뿐입니다.
A-Frame으로 만들어진 가장 인터렉티브한 대규모 WebVR 애플리케이션이 90fps로 원활하게 실행되었습니다.

[inspector]: ./visual-inspector-and-dev-tools.md

:mag: **시각적 편집기**: A-Frame은 편리한 내장 [시각적 3D 편집기][inspector] 를 제공합니다.
*아무* A-Frame scene을 연 뒤, `<ctrl> + <alt> + i` 또는 `<ctrl> + <option> + i` 를 누르면 여기저기를 날아다닐 수 있습니다!

![Inspector](https://cloud.githubusercontent.com/assets/674727/25377018/27be9cce-295b-11e7-9098-3e85ac1fe172.gif)

[augmented reality]: https://github.com/jeromeetienne/AR.js#augmented-reality-for-the-web-in-less-than-10-lines-of-html
[environment]: https://github.com/supermedium/aframe-environment-component
[multiuser]: https://github.com/networked-aframe/networked-aframe
[oceans]: https://github.com/n5ro/aframe-extras/tree/master/src/primitives
[particle systems]: https://github.com/IdeaSpaceVR/aframe-particle-system-component
[physics]: https://github.com/n5ro/aframe-physics-system
[state]: https://npmjs.com/package/aframe-state-component
[super hands]: https://github.com/wmurphyrd/aframe-super-hands-component
[teleportation]: https://github.com/fernandojsg/aframe-teleport-controls

:runner: **컴포넌트**: geometry, material, 빛, 애니메이션, 모델, raycaster, 그림자, 위치 오디오, 글자, 컨트롤 같은 A-Frame의 핵심 컴포넌트들은 대부분의 메이저 헤드셋을 지원합니다.
[환경][environment], [상태][state], [파티클 시스템][particle systems], [물리 엔진][physics], [멀티 유저][multiuser], [바다][oceans], [텔레포트][teleportation], [슈퍼 핸드][super hands], [증강 현실][augmented reality] 등 수백개의 커뮤니티로부터 더 많은 컴포넌트를 얻을 수 있습니다!

:earth_americas: **입증되고 확장 가능한**: A-Frame은 Google, Disney, Samsung, Toyota, Ford, Chevrolet, Amnesty
International, CERN, NPR, Al Jazeera, The Washington Post, NASA 등의 회사에서 사용되었습니다. Google, Microsoft, Oculus, Samsung 에서는 A-Frame에 기여했습니다.

## 당장 시작해보세요!

[Discord]: https://supermedium.com/discord
[slack]: https://aframevr.slack.com/join/shared_invite/zt-f6rne3ly-ekVaBU~Xu~fsZHXr56jacQ

A-Frame이 처음이라면, 이렇게 시작해보세요:

1. A-Frame의 업데이트와 팁 및 주요 커뮤니티 프로젝트 소식을 받을 수 있게 [뉴스레터를 구독](https://aframe.io/subscribe/) 하세요.

2. 문서를 읽어보세요. [Glitch](https://glitch.com/~aframe) 는 예제를 실행해보기 위한 좋은 Playground 입니다.

3. [Discord][Discord] 와 [Slack][slack] 에 참여하시고, 궁금한게 있다면 [StackOverflow에서 검색 및 질문](http://stackoverflow.com/questions/ask/?tags=aframe) 을 하면 누군가가 대답해줄거에요!

4. 프로젝트를 온라인에 공유해주시면 [뉴스레터](https://aframe.io/subscribe/) 와 [블로그](https://aframe.io/blog/) 에 공유할 수 있도록 노력하곘습니다!

그리고 JavaScript와 [three.js](https://threejs.org/) 에 대한 기초를 익히는게 많은 도움이 될거에요. 즐거운 시간 되세요!
