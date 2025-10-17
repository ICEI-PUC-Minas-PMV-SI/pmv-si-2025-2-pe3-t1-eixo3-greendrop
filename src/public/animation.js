const svgContainer = document.getElementById("falling-items-svg");
const svgNS = "http://www.w3.org/2000/svg";

const NUM_ITEMS = 40; // Reduzi um pouco para não poluir muito o fundo
const COLORS = ["#4CAF50", "#8BC34A", "#388E3C", "#66BB6A", "#A5D6A7"];
let fallingItems = [];

function createFallingItem() {
    const isLeaf = Math.random() > 0.3;
    const shapeId = isLeaf ? "#leaf" : "#greendrop";
    const useEl = document.createElementNS(svgNS, "use");
    useEl.setAttribute("href", shapeId);

    const item = {
        el: useEl,
        x: Math.random() * window.innerWidth,
        y: -100 - Math.random() * window.innerHeight,
        scale: 0.3 + Math.random() * 0.4, // Itens um pouco menores
        opacity: 0.2 + Math.random() * 0.4, // Mais transparentes
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        fallSpeed: 0.5 + Math.random() * 1.5, // Mais lentos
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

    item.el.setAttribute("fill", item.color);
    item.el.style.opacity = item.opacity;
    item.el.setAttribute("transform", `translate(${item.x}, ${item.y}) scale(${item.scale}) rotate(${item.rotation.angle})`);
    svgContainer.appendChild(item.el);
    return item;
}

for (let i = 0; i < NUM_ITEMS; i++) {
    fallingItems.push(createFallingItem());
}

function animate() {
    fallingItems.forEach(item => {
        item.y += item.fallSpeed;
        item.sway.offset += item.sway.speed;
        const swayX = Math.sin(item.sway.offset) * item.sway.amplitude;
        item.rotation.angle += item.rotation.speed;
        item.el.setAttribute("transform", `translate(${item.x + swayX}, ${item.y}) scale(${item.scale}) rotate(${item.rotation.angle})`);

        if (item.y > window.innerHeight + 100) {
            item.y = -100;
            item.x = Math.random() * window.innerWidth;
        }
    });
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    fallingItems.forEach(item => {
        if (item.x > window.innerWidth) {
            item.x = Math.random() * window.innerWidth;
        }
    });
});