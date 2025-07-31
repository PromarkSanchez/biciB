async function callChatApi(elements, state, messageText) {
    const { chatMessages } = elements;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message bot typing';
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch('URL_DE_TU_API/api/v1/chat/', { // <-- REEMPLAZA URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'TU_API_KEY', // <-- REEMPLAZA
                'X-Application-ID': 'TU_APP_ID' // <-- REEMPLAZA
            },
            body: JSON.stringify({
                message: messageText,
                session_id: state.chatSessionId,
                is_authenticated_user: false,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        const botResponse = data.bot_response; // Confirma que este campo es correcto

        typingIndicator.remove();
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        botMessage.textContent = botResponse;
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error al llamar a la API:', error);
        typingIndicator.remove();
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message bot';
        errorMessage.textContent = 'Lo siento, hubo un problema al conectar con mis servidores.';
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

export function sendInitialChatMessage(elements, state) {
    callChatApi(elements, state, "__INICIAR_CHAT__");
}

async function handleChatSubmit(event, elements, state) {
    event.preventDefault();
    const userInput = elements.chatInput.value.trim();
    if (!userInput) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.textContent = userInput;
    elements.chatMessages.appendChild(userMessage);
    elements.chatInput.value = '';
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    await callChatApi(elements, state, userInput);
}

export function setupChat(elements, state) {
    elements.chatForm.addEventListener('submit', (event) => handleChatSubmit(event, elements, state));
}