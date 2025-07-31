// Espera a que todo el HTML esté cargado antes de ejecutar cualquier código
document.addEventListener('DOMContentLoaded', () => {

    // ===== INICIALIZACIÓN 3D =====
    function init3DBackground() {
        // ... (Este código no cambia, lo incluimos para que esté completo)
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        camera.position.z = 5;
        const particlesGeometry = new THREE.BufferGeometry;
        const particlesCount = 5000;
        const posArray = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 10; }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: 0x00aaff });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            particlesMesh.rotation.y = -0.1 * elapsedTime;
            particlesMesh.rotation.x = -0.1 * elapsedTime;
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
    }
    init3DBackground();

    // ===== ELEMENTOS DEL DOM =====
    const backBtn = document.getElementById('back-to-home-btn');
    const heroSection = document.querySelector('.hero-section');
    const demoBtn = document.getElementById('demo-btn');
    const demoContainer = document.getElementById('demo-container');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const loadingMessage = document.getElementById('loading-message');
    const resultsContainer = document.getElementById('results-container');
    const tourBtn = document.getElementById('tour-btn');
    const tourNavigator = document.getElementById('tour-navigator');
    const pageSections = document.querySelectorAll('.page-section');
    const navDots = document.querySelectorAll('.nav-dot');
    let webcamStream; // Variable global para poder detener la webcam

    // ===== FUNCIONES DE NAVEGACIÓN =====
    function showHomePage() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
        document.body.classList.remove('tour-active');
        heroSection.classList.remove('hidden');
        demoContainer.classList.add('hidden');
        pageSections.forEach(s => s.classList.add('hidden'));
        tourNavigator.classList.add('hidden');
        backBtn.classList.add('hidden');
    }

    // ===== LÓGICA DEMO FACIAL =====
    async function startFaceDemo() {
        heroSection.classList.add('hidden');
        demoContainer.classList.remove('hidden');
        backBtn.classList.remove('hidden');

        loadingMessage.innerText = "🚀 Cargando modelos de IA...";
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        await faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = webcamStream;
        } catch (err) {
            loadingMessage.innerText = "Error: Cámara no accesible.";
            console.error(err);
        }

        video.addEventListener('play', () => {
            loadingMessage.classList.add('hidden');
            const detectionInterval = setInterval(async () => {
                if (video.paused || video.ended || !webcamStream) {
                    clearInterval(detectionInterval); return;
                }
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
                    .withAgeAndGender().withFaceExpressions();
                const displaySize = { width: video.clientWidth, height: video.clientHeight };
                faceapi.matchDimensions(canvas, displaySize);
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                
                if (resizedDetections?.length) {
                    resizedDetections.forEach(d => {
                        const box = d.detection.box;
                        const correctedBox = { x: canvas.width - box.x - box.width, y: box.y, width: box.width, height: box.height };
                        const { age, gender, expressions } = d;
                        const expr = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                        const exprEs = { neutral: 'Neutral', happy: 'Feliz', sad: 'Triste', angry: 'Enojo' };
                        const boxColor = gender === 'female' ? '#ff66c4' : '#00aaff';
                        const text = `${gender === 'male' ? 'Hombre' : 'Mujer'} (${exprEs[expr] || '...'}) ~${Math.round(age)} años`;
                        new faceapi.draw.DrawBox(correctedBox, { label: text, boxColor }).draw(canvas);
                    });
                    resultsContainer.innerHTML = `<span>Analizando <strong>${resizedDetections.length}</strong> persona(s) en tiempo real...</span>`;
                } else {
                    resultsContainer.innerHTML = "<span>Colócate frente a la cámara</span>";
                }
            }, 100);
        });
    }

    // ===== LÓGICA TOUR GUIADO =====
    function startTour() {
        heroSection.classList.add('hidden');
        document.body.classList.add('tour-active');
        pageSections.forEach(s => s.classList.remove('hidden'));
        tourNavigator.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        setTimeout(() => document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' }), 100);
    }
    
    function updateActiveDot() {
        let currentId = '';
        pageSections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - window.innerHeight / 2) currentId = section.id;
        });
        navDots.forEach(dot => dot.classList.toggle('active', dot.dataset.section === currentId));
    }
    
    // ===== ASIGNACIÓN DE EVENTOS =====
    backBtn.addEventListener('click', (e) => { e.preventDefault(); showHomePage(); });
    demoBtn.addEventListener('click', (e) => { e.preventDefault(); startFaceDemo(); });
    tourBtn.addEventListener('click', (e) => { e.preventDefault(); startTour(); });
    navDots.forEach(dot => dot.addEventListener('click', e => {
        document.getElementById(e.target.dataset.section).scrollIntoView({ behavior: 'smooth' });
    }));
    window.addEventListener('scroll', () => { if (document.body.classList.contains('tour-active')) updateActiveDot(); });


    // ===== LÓGICA DE INTERACCIONES (TILT Y SCROLL) =====
    // <<== CORRECCIÓN: Todo este bloque ahora está DENTRO de DOMContentLoaded ==>>

    // Efecto 3D Tilt en cajas (solo en escritorio)
    if (window.innerWidth > 768) {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 5, speed: 400, perspective: 1000 });
    }

    // Animaciones al hacer scroll
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        scrollObserver.observe(element);
    });

    // ===== CONFIGURACIÓN DEL CHATBOT EMBEBIDO =========
    // <<== CORRECCIÓN: Este bloque ahora está DENTRO de DOMContentLoaded ==>>
    
    

});