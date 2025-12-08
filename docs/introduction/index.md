<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Интерактив: Компьютерные устройства (A-Frame)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  <!-- (опционально) physics / ar libs можно подключить при необходимости -->
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .hint {
      position: fixed; left: 10px; top: 10px;
      background: rgba(255,255,255,0.9); padding: 8px 12px; border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 10;
    }
  </style>
</head>
<body>
  <div class="hint">Наведите/кликните на объект. Нажмите "Start quiz" внизу сцены.</div>

  <a-scene background="color: #eef2f5" embedded>
    <!-- Ассеты (если будут модели) -->
    <a-assets>
      <!-- примеры моделей/текстур можно добавить сюда -->
    </a-assets>

    <!-- Пол -->
    <a-plane rotation="-90 0 0" width="12" height="12" color="#c7e7d6"></a-plane>

    <!-- Объекты: монитор, системник, клавиатура, мышь -->
    <a-box id="monitor" class="device clickable" position="-2 1 -4" depth="0.3" height="1.2" width="1.6" color="#1f77b4"></a-box>
    <a-box id="case" class="device clickable" position="0 0.9 -4" depth="0.8" height="1.6" width="0.8" color="#7f8c8d"></a-box>
    <a-box id="keyboard" class="device clickable" position="2 0.2 -3.5" depth="0.2" height="0.05" width="1.4" color="#ffffff"></a-box>
    <a-sphere id="mouse" class="device clickable" position="2.8 0.3 -3.2" radius="0.15" color="#d35400"></a-sphere>

    <!-- Текст всплывающего окна -->
    <a-entity id="infoText" text="value: Нажмите на устройство; color: #111; width: 4; align: center"
              position="0 2 -3"></a-entity>

    <!-- Кнопка для запуска викторины (простая 3D кнопка) -->
    <a-box id="startQuiz" position="0 0.4 -2" depth="0.1" height="0.2" width="0.8" color="#2ecc71" class="clickable">
      <a-entity position="0 0 0.06" text="value: Start quiz; align:center; width:1.2; color: #fff"></a-entity>
    </a-box>

    <!-- Камера и курсор -->
    <a-entity camera position="0 1.6 2">
      <a-entity 
        cursor="fuse: false; rayOrigin: mouse"
        raycaster="objects: .clickable"
        position="0 0 -0.8"
        geometry="primitive: ring; radiusInner: 0.005; radiusOuter: 0.01">
      </a-entity>
    </a-entity>
  </a-scene>

  <!-- Сценарий: обработчики и логика -->
  <script>
    // Словарь с описаниями
    const info = {
      monitor: "Монитор — устройство отображения информации. Основные характеристики: диагональ, разрешение.",
      case: "Системный блок (корпус) — здесь находятся материнская плата, процессор, оперативная память и накопители.",
      keyboard: "Клавиатура — устройство ввода символов и команд.",
      mouse: "Мышь — устройство позиционирования/ввода, позволяет указывать объекты на экране."
    };

    // Устанавливаем обработчики кликов для устройств
    document.querySelectorAll('.device').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('id');
        const textEntity = document.getElementById('infoText');
        textEntity.setAttribute('text', 'value', info[id]);
        // краткая визуальная реакция
        const original = el.getAttribute('color');
        el.setAttribute('animation__color', 'property: material.color; to: #ffff00; dur: 200; dir: alternate; loop: 1');
        setTimeout(() => {
          el.removeAttribute('animation__color');
          el.setAttribute('material', 'color', original);
        }, 400);
      });
    });

    // Викторина: простой пример — 2 вопроса
    const quizQuestions = [
      { q: "Где находится процессор?", a: "case" },
      { q: "Что отображает изображение?", a: "monitor" }
    ];
    let quizIndex = 0;
    let score = 0;

    document.getElementById('startQuiz').addEventListener('click', () => {
      // Показать первый вопрос
      askQuestion();
    });

    function askQuestion() {
      if (quizIndex >= quizQuestions.length) {
        // конец викторины
        document.getElementById('infoText').setAttribute('text', 'value', 'Викторина завершена. Результат: ' + score + '/' + quizQuestions.length);
        return;
      }
      const q = quizQuestions[quizIndex];
      document.getElementById('infoText').setAttribute('text', 'value', 'Вопрос: ' + q.q + '\nВыберите правильный объект.');
      
      // Временно ставим обработчики на выбор (временное решение — один раз)
      const devices = document.querySelectorAll('.device');
      devices.forEach(d => {
        const handler = function() {
          if (d.getAttribute('id') === q.a) {
            score++;
            d.setAttribute('material', 'color', '#2ecc71');
          } else {
            d.setAttribute('material', 'color', '#e74c3c');
          }
          // короткая пауза, затем переход к следующему
          setTimeout(() => {
            // сброс цветов
            document.querySelector('#monitor').setAttribute('material', 'color', '#1f77b4');
            document.querySelector('#case').setAttribute('material', 'color', '#7f8c8d');
            document.querySelector('#keyboard').setAttribute('material', 'color', '#ffffff');
            document.querySelector('#mouse').setAttribute('material', 'color', '#d35400');
            devices.forEach(dev => dev.removeEventListener('click', handler));
            quizIndex++;
            askQuestion();
          }, 600);
        };
        d.addEventListener('click', handler);
      });
    }
  </script>
</body>
</html>

