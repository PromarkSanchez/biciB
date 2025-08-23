// --- Configuración del Chatbot ---
// Mueve la configuración a este objeto para facilitar las actualizaciones.
const CHAT_CONFIG = {
    API_URL: 'https://chatbot.atiqtec.com/api/v1/chat/',
    API_KEY: '8qs2C6loymMqsXJ6dVTWeodPrM6D9EdEKHsUjKNA-Xw',
    APP_ID: 'atiq_web'
};

// --- Funciones Internas del Módulo -----

/**
 * Llama a la API del chatbot y muestra la respuesta.
 * @param {object} elements - Referencias a los elementos del DOM.
 * @param {object} state - El estado actual de la aplicación.
 * @param {string} messageText - El mensaje a enviar.
 */
async function callChatApi(elements, state, messageText) {
    const { chatMessages } = elements;
    
    // Muestra el indicador de "escribiendo..."
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message bot typing';
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(CHAT_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CHAT_CONFIG.API_KEY,
                'X-Application-ID': CHAT_CONFIG.APP_ID
            },
            body: JSON.stringify({
                message: messageText,
                session_id: state.chatSessionId,
                is_authenticated_user: false,
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error del servidor: ${response.status}. Detalles: ${errorData}`);
        }
        
        const data = await response.json();

        // Muestra la respuesta del bot
        typingIndicator.remove();
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        //botMessage.textContent = data.bot_response;
        botMessage.innerHTML = marked.parse(data.bot_response);
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Error detallado al llamar a la API del chat:', error);

        // Muestra un mensaje de error en el chat
        typingIndicator.remove();
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message bot';
        errorMessage.textContent = 'Lo siento, no pude conectarme con mis servidores. Inténtalo de nuevo más tarde.';
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Gestiona el envío del formulario de chat.
 * @param {Event} event - El evento de envío del formulario.
 * @param {object} elements - Referencias a los elementos del DOM.
 * @param {object} state - El estado actual de la aplicación.
 */
async function handleChatSubmit(event, elements, state) {
    event.preventDefault();
    const userInput = elements.chatInput.value.trim();
    if (!userInput) return;

    // Muestra el mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.textContent = userInput;
    elements.chatMessages.appendChild(userMessage);
    elements.chatInput.value = '';
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    // Llama a la API con el mensaje del usuario
    await callChatApi(elements, state, userInput);
}

// --- Funciones Exportadas ---

/**
 * Envía el mensaje inicial para empezar la conversación.
 * @param {object} elements - Referencias a los elementos del DOM.
 * @param {object} state - El estado actual de la aplicación.
 */
export function sendInitialChatMessage(elements, state) {
    callChatApi(elements, state, "__INICIAR_CHAT__");
}

/**
 * Configura el event listener para el formulario del chat.
 * @param {object} elements - Referencias a los elementos del DOM.
 * @param {object} state - El estado actual de la aplicación.
 */
export function setupChat(elements, state) {
    if (!elements.chatForm) {
        console.error("El elemento del formulario de chat no se encontró en el DOM.");
        return;
    }
    elements.chatForm.addEventListener('submit', (event) => handleChatSubmit(event, elements, state));
}