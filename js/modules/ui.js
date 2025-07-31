function showHomePage(elements, state) {
    if (state.webcamStream) { state.webcamStream.getTracks().forEach(track => track.stop()); state.webcamStream = null; }
    if (state.detectionInterval) { clearInterval(state.detectionInterval); state.detectionInterval = null; }
    document.body.classList.remove('tour-active');
    elements.heroSection.classList.remove('hidden');
    elements.demoContainer.classList.add('hidden');
    elements.pageSections.forEach(s => s.classList.add('hidden'));
    elements.tourNavigator.classList.add('hidden');
    elements.backBtn.classList.add('hidden');
}

function startTour(elements, onTourStartCallback) {
    elements.heroSection.classList.add('hidden');
    elements.demoContainer.classList.add('hidden');
    document.body.classList.add('tour-active');
    elements.pageSections.forEach(s => s.classList.remove('hidden'));
    elements.tourNavigator.classList.remove('hidden');
    elements.backBtn.classList.remove('hidden');
    if (elements.chatMessages.children.length === 0) {
        onTourStartCallback();
    }
    setTimeout(() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' }), 100);
}

export function setupNavigation(elements, state, onStartFaceDemo, onStartTour) {
    elements.backBtn.addEventListener('click', (e) => { e.preventDefault(); showHomePage(elements, state); });
    elements.demoBtn.addEventListener('click', (e) => { e.preventDefault(); onStartFaceDemo(); });
    elements.tourBtn.addEventListener('click', (e) => { e.preventDefault(); startTour(elements, onStartTour); });
    elements.navDots.forEach(dot => dot.addEventListener('click', e => { document.getElementById(e.target.dataset.section)?.scrollIntoView({ behavior: 'smooth' }); }));
    window.addEventListener('scroll', () => {
        if (!document.body.classList.contains('tour-active')) return;
        let currentId = '';
        elements.pageSections.forEach(section => { if (window.pageYOffset >= section.offsetTop - (window.innerHeight / 2)) { currentId = section.id; } });
        elements.navDots.forEach(dot => dot.classList.toggle('active', dot.dataset.section === currentId));
    });
}

export function initVisualEffects() {
    if (window.innerWidth > 768) { VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 5, speed: 400, perspective: 1000 }); }
    const scrollObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));
}