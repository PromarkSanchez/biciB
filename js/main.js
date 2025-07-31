import { init3DBackground } from './modules/background3D.js';
import { setupChat, sendInitialChatMessage } from './modules/chatbot.js';
import { initFaceDemo } from './modules/faceApiDemo.js';
import { setupNavigation, initVisualEffects } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. DEFINICIÓN DE ELEMENTOS Y ESTADO
    const elements = {
        // Navegación y UI general
        backBtn: document.getElementById('back-to-home-btn'),
        heroSection: document.querySelector('.hero-section'),
        tourBtn: document.getElementById('tour-btn'),
        tourNavigator: document.getElementById('tour-navigator'),
        pageSections: document.querySelectorAll('.page-section'),
        navDots: document.querySelectorAll('.nav-dot'),
        // Demo Facial
        demoBtn: document.getElementById('demo-btn'),
        demoContainer: document.getElementById('demo-container'),
        video: document.getElementById('video'),
        canvas: document.getElementById('canvas'),
        loadingMessage: document.getElementById('loading-message'),
        resultsContainer: document.getElementById('results-container'),
        // Chatbot
        chatForm: document.getElementById('chat-form'),
        chatInput: document.getElementById('chat-input'),
        chatMessages: document.getElementById('chat-messages'),
    };

    const state = {
        webcamStream: null,
        detectionInterval: null,
        chatSessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    // 2. LÓGICA DE ORQUESTACIÓN
    const handleStartTour = () => {
        if (elements.chatMessages.children.length === 0) {
            sendInitialChatMessage(elements, state);
        }
    };
    
    const handleStartFaceDemo = () => {
        initFaceDemo(elements, state);
    };

    // 3. INICIALIZACIÓN DE MÓDULOS
    init3DBackground();
    initVisualEffects();
    setupChat(elements, state);
    setupNavigation(elements, state, handleStartFaceDemo, handleStartTour);
});