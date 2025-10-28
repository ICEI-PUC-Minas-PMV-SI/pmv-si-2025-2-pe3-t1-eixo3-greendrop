document.addEventListener('DOMContentLoaded', () => {
  if (window.__greendropBgAnimated) return;
  window.__greendropBgAnimated = true;

  const svgContainer = document.getElementById('falling-items-svg');
  if (!svgContainer) {
    console.debug('BG animation: container não encontrado, página sem animação.');
    return;
  }

  const svgNS  = 'http://www.w3.org/2000/svg';
  const XLINK  = 'http://www.w3.org/1999/xlink';

  const NUM_ITEMS = 20; // quantidade de folhas/gotas
  const COLORS    = ['#4CAF50', '#8BC34A', '#388E3C', '#66BB6A', '#A5D6A7'];

  const fallingItems = [];

  function makeUse(shapeId) {
    const useEl = document.createElementNS(svgNS, 'use');
    useEl.setAttributeNS(XLINK, 'href', shapeId);
    useEl.setAttribute('href', shapeId);
    return useEl;
  }

  function createFallingItem() {
    const isLeaf  = Math.random() > 0.3;
    const shapeId = isLeaf ? '#leaf' : '#greendrop';
    const useEl   = makeUse(shapeId);

    const item = {
      el: useEl,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - 100,
      scale: 0.3 + Math.random() * 0.4,
      opacity: 0.2 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      fallSpeed: 0.5 + Math.random() * 1.5,
      sway: {
        amplitude: 20 + Math.random() * 40,
        speed: 0.01 + Math.random() * 0.02,
        offset: Math.random() * 100
      },
      rotation: {
        angle: Math.random() * 360,
        speed: -1 + Math.random() * 2
      }
    };

    item.el.setAttribute('fill', item.color);
    item.el.style.opacity = item.opacity;
    svgContainer.appendChild(item.el);
    return item;
  }

  for (let i = 0; i < NUM_ITEMS; i++) {
    fallingItems.push(createFallingItem());
  }
  fallingItems.forEach(item => {
    const swayX = Math.sin(item.sway.offset) * item.sway.amplitude;
    item.el.setAttribute(
      'transform',
      `translate(${item.x + swayX}, ${item.y}) scale(${item.scale}) rotate(${item.rotation.angle})`
    );
  });

  function animate() {
    for (const item of fallingItems) {
      item.y += item.fallSpeed;
      item.sway.offset += item.sway.speed;
      const swayX = Math.sin(item.sway.offset) * item.sway.amplitude;
      item.rotation.angle += item.rotation.speed;

      item.el.setAttribute(
        'transform',
        `translate(${item.x + swayX}, ${item.y}) scale(${item.scale}) rotate(${item.rotation.angle})`
      );

      if (item.y > window.innerHeight + 100) {
        item.y = -100;
        item.x = Math.random() * window.innerWidth;
      }
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    for (const item of fallingItems) {
      if (item.x > window.innerWidth) {
        item.x = Math.random() * window.innerWidth;
      }
      if (item.y > window.innerHeight + 200) {
        item.y = Math.random() * window.innerHeight - 100;
      }
    }
  });
});
