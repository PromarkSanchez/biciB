// js/modules/neuralNetwork.js

// --- PARÁMETROS CONFIGURABLES ---
// Juega con estos valores para cambiar la apariencia
const NODE_COUNT = window.innerWidth < 768 ? 40 : 100; // Menos nodos en pantallas pequeñas
const NODE_RADIUS = 2;
const MAX_LINK_DISTANCE = 150;
const NODE_SPEED = 0.5;
// ---------------------------------

let nodes = [];
let mouse = { x: null, y: null };
let canvas, ctx, animationFrameId;

function createNodes(width, height) {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * NODE_SPEED,
            vy: (Math.random() - 0.5) * NODE_SPEED,
            radius: NODE_RADIUS,
        });
    }
}

function update() {
    nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Rebote en los bordes
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Conectar nodos entre sí
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = Math.sqrt(Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2));
            if (dist < MAX_LINK_DISTANCE) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                // La línea es más visible cuanto más cerca están los nodos
                ctx.strokeStyle = `rgba(226, 132, 24, ${1 - dist / MAX_LINK_DISTANCE})`;
                ctx.stroke();
            }
        }
    }
    
    // Conectar nodos al cursor del ratón
    if (mouse.x && mouse.y) {
         nodes.forEach(node => {
            const dist = Math.sqrt(Math.pow(node.x - mouse.x, 2) + Math.pow(node.y - mouse.y, 2));
             if (dist < MAX_LINK_DISTANCE * 1.5) { // Un rango mayor para el cursor
                 ctx.beginPath();
                 ctx.moveTo(node.x, node.y);
                 ctx.lineTo(mouse.x, mouse.y);
                 ctx.strokeStyle = `rgba(226, 132, 24, ${0.5 - dist / (MAX_LINK_DISTANCE * 1.5)})`;
                 ctx.stroke();
             }
        });
    }

    // Dibujar los nodos
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(28, 31, 206, 0.8)`; // Color crema de tu paleta
        ctx.fill();
    });
}

function animate() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(animate);
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createNodes(canvas.width, canvas.height);
}

export function initNeuralNetwork() {
    canvas = document.getElementById('neural-network-canvas');
    if (!canvas) {
        console.error("Canvas para red neuronal no encontrado.");
        return;
    }
    ctx = canvas.getContext('2d');
    
    // Event Listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Iniciar
    handleResize(); // Configura el tamaño inicial y crea los nodos
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    animate();
}