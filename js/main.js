import { init3DBackground } from './modules/background3D.js';
import { initFaceDemo } from './modules/faceApiDemo.js';
import { setupNavigation, initVisualEffects } from './modules/ui.js';
import { setupChat, sendInitialChatMessage } from './modules/chatbot.js';

document.addEventListener('DOMContentLoaded', () => {

    const domElements = {
        backBtn: document.getElementById('back-to-home-btn'),
        heroSection: document.querySelector('.hero-section'),
        demoBtn: document.getElementById('demo-btn'),
        demoContainer: document.getElementById('demo-container'),
        video: document.getElementById('video'),
        canvas: document.getElementById('canvas'),
        loadingMessage: document.getElementById('loading-message'),
        resultsContainer: document.getElementById('results-container'),
        tourBtn: document.getElementById('tour-btn'),
        tourNavigator: document.getElementById('tour-navigator'),
        pageSections: document.querySelectorAll('.page-section'),
        navDots: document.querySelectorAll('.nav-dot'),
        chatForm: document.getElementById('chat-form'),
        chatInput: document.getElementById('chat-input'),
        chatMessages: document.getElementById('chat-messages'),
    };
    
    const appState = {
        webcamStream: null,
        detectionInterval: null,
        chatSessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    init3DBackground();
    initVisualEffects();

    const startTourCallback = () => {
        if (domElements.chatMessages.children.length === 0) {
            sendInitialChatMessage(domElements, appState);
        }
    };
    
    setupNavigation(
        domElements, 
        appState, 
        () => initFaceDemo(domElements, appState),
        startTourCallback
    );
    
    setupChat(domElements, appState);
});