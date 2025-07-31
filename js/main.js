document.addEventListener('DOMContentLoaded', () => {

    // ===== FUNCIÓN DE INICIALIZACIÓN 3D =====
    function init3DBackground() {
        const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); const renderer = new THREE.WebGLRenderer({ alpha: true }); renderer.setSize(window.innerWidth, window.innerHeight); document.getElementById('canvas-container').appendChild(renderer.domElement); camera.position.z = 5;
        const particlesGeometry = new THREE.BufferGeometry; const particlesCount = 5000; const posArray = new Float32Array(particlesCount * 3); for (let i = 0; i < particlesCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 10; } particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: 0xe28418 }); const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial); scene.add(particlesMesh);
        const clock = new THREE.Clock(); const animate = () => { requestAnimationFrame(animate); const elapsedTime = clock.getElapsedTime(); particlesMesh.rotation.y = -0.1 * elapsedTime; particlesMesh.rotation.x = -0.1 * elapsedTime; renderer.render(scene, camera); }; animate();
        window.addEventListener('resize', () => { renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); });
    }

    // ===== CAPTURA DE ELEMENTOS DEL DOM =====
    const backBtn = document.getElementById('back-to-home-btn'); const heroSection = document.querySelector('.hero-section'); const demoBtn = document.getElementById('demo-btn'); const demoContainer = document.getElementById('demo-container'); const video = document.getElementById('video'); const canvas = document.getElementById('canvas'); const loadingMessage = document.getElementById('loading-message'); const resultsContainer = document.getElementById('results-container'); const tourBtn = document.getElementById('tour-btn'); const tourNavigator = document.getElementById('tour-navigator'); const pageSections = document.querySelectorAll('.page-section'); const navDots = document.querySelectorAll('.nav-dot'); const chatForm = document.getElementById('chat-form'); const chatInput = document.getElementById('chat-input'); const chatMessages = document.getElementById('chat-messages');
    
    // ===== VARIABLES DE ESTADO =====
    let webcamStream = null; let detectionInterval = null; let chatSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // ===== LÓGICA DE NAVEGACIÓN Y ESTADOS =====
    function showHomePage() {
        if (webcamStream) { webcamStream.getTracks().forEach(track => track.stop()); webcamStream = null; }
        if (detectionInterval) { clearInterval(detectionInterval); detectionInterval = null; }
        document.body.classList.remove('tour-active'); heroSection.classList.remove('hidden'); demoContainer.classList.add('hidden'); pageSections.forEach(s => s.classList.add('hidden')); tourNavigator.classList.add('hidden'); backBtn.classList.add('hidden');
    }

    function startTour() {
        heroSection.classList.add('hidden'); demoContainer.classList.add('hidden'); document.body.classList.add('tour-active');
        pageSections.forEach(s => s.classList.remove('hidden')); tourNavigator.classList.remove('hidden'); backBtn.classList.remove('hidden');
        if (chatMessages.children.length === 0) {
            sendInitialChatMessage();
        }
        setTimeout(() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    async function startFaceDemo() {
        heroSection.classList.add('hidden'); demoContainer.classList.remove('hidden'); backBtn.classList.remove('hidden');
        loadingMessage.innerText = "🚀 Cargando modelos..."; loadingMessage.classList.remove('hidden'); resultsContainer.innerHTML = '';
        try {
            await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'), faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'), faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model')]);
            webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = webcamStream;
        } catch (err) { console.error("Error al iniciar demo facial:", err); loadingMessage.innerText = "Error: Cámara no accesible."; }
    }

    // ===== LÓGICA DEL CHATBOT =====
    function sendInitialChatMessage() {
        callChatApi("__INICIAR_CHAT__");
    }

    async function callChatApi(messageText) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message bot typing';
        typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(typingIndicator); chatMessages.scrollTop = chatMessages.scrollHeight;
        try {
            const response = await fetch('http://localhost:8000/api/v1/chat/', { // REEMPLAZA URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'uGwxnNYEHxObraMxqGL0jaPWcB3vZPzMkXUzm5IrfuI', 'X-Application-ID': 'WEB_MATE_BASICA' }, // REEMPLAZA CREDENCIALES
                body: JSON.stringify({ message: messageText, session_id: chatSessionId, is_authenticated_user: false })
            });
            if (!response.ok) { throw new Error(`Error del servidor: ${response.status}`); }
            const data = await response.json(); const botResponse = data.bot_response;
            typingIndicator.remove(); const botMessage = document.createElement('div'); botMessage.className = 'chat-message bot'; botMessage.textContent = botResponse;
            chatMessages.appendChild(botMessage); chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error al llamar a la API:', error); typingIndicator.remove();
            const errorMessage = document.createElement('div'); errorMessage.className = 'chat-message bot'; errorMessage.textContent = 'Lo siento, hubo un problema al conectar con mis servidores.';
            chatMessages.appendChild(errorMessage); chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    async function handleChatSubmit(event) {
        event.preventDefault(); const userInput = chatInput.value.trim(); if (!userInput) return;
        const userMessage = document.createElement('div'); userMessage.className = 'chat-message user'; userMessage.textContent = userInput;
        chatMessages.appendChild(userMessage); chatInput.value = ''; chatMessages.scrollTop = chatMessages.scrollHeight;
        await callChatApi(userInput);
    }
    
    // ===== EFECTOS VISUALES =====
    function initVisualEffects() {
        if (window.innerWidth > 768) { VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 5, speed: 400, perspective: 1000 }); }
        const scrollObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 });
        document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));
    }

    // ===== ASIGNACIÓN DE EVENTOS (LISTENERS) =====
    backBtn.addEventListener('click', (e) => { e.preventDefault(); showHomePage(); });
    demoBtn.addEventListener('click', (e) => { e.preventDefault(); startFaceDemo(); });
    tourBtn.addEventListener('click', (e) => { e.preventDefault(); startTour(); });
    chatForm.addEventListener('submit', handleChatSubmit);

    video.addEventListener('play', () => {
        loadingMessage.classList.add('hidden');
        if (detectionInterval) clearInterval(detectionInterval);
        detectionInterval = setInterval(async () => {
            if (video.paused || video.ended || !webcamStream) { clearInterval(detectionInterval); return; }
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })).withAgeAndGender().withFaceExpressions();
            const displaySize = { width: video.clientWidth, height: video.clientHeight }; faceapi.matchDimensions(canvas, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize); canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            if (resizedDetections?.length) {
                resizedDetections.forEach(d => {
                    const box = d.detection.box; const correctedBox = { x: canvas.width - box.x - box.width, y: box.y, width: box.width, height: box.height };
                    const { age, gender, expressions } = d; const expr = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                    const exprEs = { neutral: 'Neutral', happy: 'Feliz', sad: 'Triste', angry: 'Enojo', fearful: 'Miedo', surprised: 'Sorpresa' };
                    const boxColor = gender === 'female' ? '#ff66c4' : 'var(--color-naranja-vibrante)'; const text = `${gender === 'male' ? 'Hombre' : 'Mujer'} (${exprEs[expr] || '...'}) ~${Math.round(age)} años`;
                    new faceapi.draw.DrawBox(correctedBox, { label: text, boxColor }).draw(canvas);
                });
                resultsContainer.innerHTML = `<span>Analizando <strong>${resizedDetections.length}</strong> persona(s)</span>`;
            } else { resultsContainer.innerHTML = "<span>Colócate frente a la cámara</span>"; }
        }, 100);
    });

    navDots.forEach(dot => dot.addEventListener('click', e => {
        document.getElementById(e.target.dataset.section)?.scrollIntoView({ behavior: 'smooth' });
    }));
    window.addEventListener('scroll', () => {
        if (!document.body.classList.contains('tour-active')) return;
        let currentId = ''; pageSections.forEach(section => { if (window.pageYOffset >= section.offsetTop - (window.innerHeight / 2)) { currentId = section.id; } });
        navDots.forEach(dot => dot.classList.toggle('active', dot.dataset.section === currentId));
    });
    
    // ===== PUNTO DE ENTRADA PRINCIPAL =====
    init3DBackground();
    initVisualEffects();
});