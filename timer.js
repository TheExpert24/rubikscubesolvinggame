const timerDisplay = document.getElementById('timer');

let startTime = 0;
let timerInterval = null;
let isRunning = false;

let spacePressedTime = 0;
let isReadyToStart = false;
let holdTimeout = null;

function formatTime(ms) {
    let seconds = (ms / 1000).toFixed(2);
    return seconds;
}

function startTimer() {
    startTime = performance.now();
    isRunning = true;
    timerInterval = setInterval(() => {
        const elapsedTime = performance.now() - startTime;
        timerDisplay.textContent = formatTime(elapsedTime);
    }, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    const finalTime = performance.now() - startTime;
    timerDisplay.textContent = formatTime(finalTime);
}

window.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();

    if (isRunning) {
        stopTimer();
        return;
    }

    if (!spacePressedTime && !isRunning) {
        spacePressedTime = performance.now();
        timerDisplay.classList.add('preparing');

        holdTimeout = setTimeout(() => {
            timerDisplay.classList.remove('preparing');
            timerDisplay.classList.add('ready');
            isReadyToStart = true;
        }, 300);
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();

    clearTimeout(holdTimeout);
    timerDisplay.classList.remove('preparing', 'ready');

    if (isReadyToStart && !isRunning) {
        startTimer();
    }
    
    spacePressedTime = 0;
    isReadyToStart = false;
});
