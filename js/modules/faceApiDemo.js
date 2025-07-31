export async function initFaceDemo(elements, state) {
    const { heroSection, demoContainer, backBtn, loadingMessage, resultsContainer, video, canvas } = elements;
    
    heroSection.classList.add('hidden');
    demoContainer.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    loadingMessage.innerText = "🚀 Cargando modelos...";
    loadingMessage.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
            faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
            faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model')
        ]);
        
        state.webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = state.webcamStream;

        video.addEventListener('play', () => {
            loadingMessage.classList.add('hidden');
            if (state.detectionInterval) clearInterval(state.detectionInterval);
            
            state.detectionInterval = setInterval(async () => {
                if (video.paused || video.ended || !state.webcamStream) {
                    clearInterval(state.detectionInterval);
                    return;
                }
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })).withAgeAndGender().withFaceExpressions();
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
                        const exprEs = { neutral: 'Neutral', happy: 'Feliz', sad: 'Triste', angry: 'Enojo', fearful: 'Miedo', surprised: 'Sorpresa' };
                        const boxColor = gender === 'female' ? '#ff66c4' : 'var(--color-naranja-vibrante)';
                        const text = `${gender === 'male' ? 'Hombre' : 'Mujer'} (${exprEs[expr] || '...'}) ~${Math.round(age)} años`;
                        new faceapi.draw.DrawBox(correctedBox, { label: text, boxColor }).draw(canvas);
                    });
                    resultsContainer.innerHTML = `<span>Analizando <strong>${resizedDetections.length}</strong> persona(s)</span>`;
                } else {
                    resultsContainer.innerHTML = "<span>Colócate frente a la cámara</span>";
                }
            }, 100);
        });
        
    } catch (err) {
        console.error("Error al iniciar demo facial:", err);
        loadingMessage.innerText = "Error: Cámara no accesible.";
    }
}