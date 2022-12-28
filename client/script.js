import botIcon from './assets/bot.svg';
import userIcon from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

let isDirty = false;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) { // it means that AI is still typing
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();

    const hexadecimal = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimal}`;
}

function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi ? 'ai' : ''}">
            <div class="chat">
                <div class="profile">
                    <img src="${isAi ? botIcon : userIcon}" alt="${isAi ? 'Bot' : 'User'}" title="${isAi ? 'Bot' : 'User'}">
                </div>
                <div class="message" id="${uniqueId}">${value}</div>
            </div>
        </div>
    `;
}

async function handleSubmit(e) {
    e.preventDefault();

    if (isDirty) {
        const data = new FormData(form);

        // user's chatstripe
        chatContainer.innerHTML += chatStripe(false, data.get('prompt'), '');
        form.reset();

        // bot's chatstripe
        const uniqueId = generateUniqueId();
        chatContainer.innerHTML += chatStripe(true, '', uniqueId);

        chatContainer.scrollTop = chatContainer.scrollHeight;

        const messageDiv = document.getElementById(uniqueId);

        loader(messageDiv);

        // fetch data from server -> bot's response
        const response = await fetch('http://localhost:5000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: data.get('prompt')
            }),
        });

        clearInterval(loadInterval);
        messageDiv.textContent = '';

        if (response.ok) {
            const data = await response.json();

            typeText(messageDiv, data.bot.trim());
        } else {
            const error = await response.text();

            messageDiv.textContent = 'Something went wrong..';

            alert(error);
        }
    }
}

function debounce(callback, wait) {
    let timeout = null;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}

form.addEventListener('input', debounce((e) => {
    let trimmedValue = e.target.value.trim();
    if (trimmedValue.length > 1) {
        isDirty = true;
    }
}, 300));

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    e.key === 'Enter' && handleSubmit(e);
});
