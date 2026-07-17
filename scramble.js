const scrambleBtn = document.querySelector('.button');
const cubeElement = document.getElementById('cube');
const notationInput = document.querySelectorAll('.moves');
const validMoves = ['U', 'D', 'R', 'L', 'F', 'B'];
const modifiers = ['', "'", '2'];
let cubies = [];

function createCube() {
    cubeElement.innerHTML = '';
    cubies = [];
    const colors = { U: '#ffd600', D: '#FFFFFF', R: '#1e90ff', L: '#00c853', F: '#ff3b3b', B: '#ff8c00' };
    
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const cubie = document.createElement('div');
                cubie.className = 'cubie';
                cubie.pos = { x, y, z };
                cubie.style.transform = `translateX(${x * 70}px) translateY(${y * 70}px) translateZ(${z * 70}px)`;

                ['U','D','R','L','F','B'].forEach(face => {
                    const faceEl = document.createElement('div');
                    faceEl.className = `cubie-face ${face}`;
                    const sticker = document.createElement('div');
                    if ((face === 'U' && y === -1) || (face === 'D' && y === 1) ||
                        (face === 'R' && x === 1)  || (face === 'L' && x === -1) ||
                        (face === 'F' && z === 1)  || (face === 'B' && z === -1)) {
                        sticker.style.backgroundColor = colors[face];
                    }
                    faceEl.appendChild(sticker);
                    cubie.appendChild(faceEl);
                });
                cubeElement.appendChild(cubie);
                cubies.push(cubie);
            }
        }
    }
}
createCube();

function generateSolvableScramble() {
    let scramble = [];
    let lastAxis = -1;
    while (scramble.length < 20) {
        let randomMoveIndex = Math.floor(Math.random() * validMoves.length);
        let randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        let currentAxis = Math.floor(randomMoveIndex / 2);
        if (currentAxis !== lastAxis) {
            scramble.push(validMoves[randomMoveIndex] + randomModifier);
            lastAxis = currentAxis;
        }
    }
    return scramble;
}

function getLayerCubies(face) {
    return cubies.filter(c => {
        if (face === 'U') return c.pos.y === -1;
        if (face === 'D') return c.pos.y === 1;
        if (face === 'R') return c.pos.x === 1;
        if (face === 'L') return c.pos.x === -1;
        if (face === 'F') return c.pos.z === 1;
        if (face === 'B') return c.pos.z === -1;
    });
}

function animateMove(move) {
    return new Promise((resolve) => {
        const face = move.charAt(0);
        const mod = move.length > 1 ? move.charAt(1) : '';
        const layer = getLayerCubies(face);
        let angle = 90;
        if (mod === "'") angle = -90;
        if (mod === '2') angle = 180;
        let axis = 'y';
        if (face === 'R' || face === 'L') axis = 'x';
        if (face === 'F' || face === 'B') axis = 'z';
        let duration = 200;
        let start = null;
        const initialTransforms = new Map();
        layer.forEach(c => {
            initialTransforms.set(c, c.style.transform);
        });
        function step(timestamp) {
            if (!start) start = timestamp;
            let progress = timestamp - start;
            let percent = Math.min(progress / duration, 1);
            let currentAngle = percent * angle;
            layer.forEach(c => {
                let rotStr = '';
                if (axis === 'x') rotStr = `rotate3d(1, 0, 0, ${currentAngle}deg)`;
                if (axis === 'y') rotStr = `rotate3d(0, 1, 0, ${currentAngle}deg)`;
                if (axis === 'z') rotStr = `rotate3d(0, 0, 1, ${currentAngle}deg)`;
                c.style.transform = `${rotStr} ${initialTransforms.get(c)}`;
            });
            if (progress < duration) {
                requestAnimationFrame(step);
            } else {
                layer.forEach(c => {
                    let rad = (angle * Math.PI) / 180;
                    let cos = Math.round(Math.cos(rad));
                    let sin = Math.round(Math.sin(rad));
                    let { x, y, z } = c.pos;
                    if (axis === 'z') {
                        c.pos.x = x * cos - y * sin;
                        c.pos.y = x * sin + y * cos;
                    } else if (axis === 'x') {
                        c.pos.y = y * cos - z * sin;
                        c.pos.z = y * sin + z * cos;
                    } else if (axis === 'y') {
                        c.pos.x = x * cos + z * sin;
                        c.pos.z = -x * sin + z * cos;
                    }
                    let rotStr = '';
                    if (axis === 'x') rotStr = `rotate3d(1, 0, 0, ${angle}deg)`;
                    if (axis === 'y') rotStr = `rotate3d(0, 1, 0, ${angle}deg)`;
                    if (axis === 'z') rotStr = `rotate3d(0, 0, 1, ${angle}deg)`;
                    c.style.transform = `${rotStr} ${initialTransforms.get(c)}`;
                });
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

async function runScrambleAnimation(movesArray) {
    for (let i = 0; i < movesArray.length; i++) {
        await animateMove(movesArray[i]);
    }
}

let isDragging = false;
let startX, startY;
let rotateX = -30;
let rotateY = -45;

function updateCubeRotation() {
    cubeElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

window.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    if (!cubeElement.classList.contains('paused')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    let deltaX = e.clientX - startX;
    let deltaY = e.clientY - startY;
    
    rotateY += deltaX * 0.4;
    rotateX -= deltaY * 0.4;
    
    updateCubeRotation();
    
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('mouseup', () => { isDragging = false; });

if (scrambleBtn) {
    scrambleBtn.addEventListener('click', () => {
        if (!cubeElement.classList.contains('paused')) {
            cubeElement.classList.add('paused');
            rotateX = -30;
            rotateY = -45;
            updateCubeRotation();
        }
        const scrambleMoves = generateSolvableScramble();
        if (notationInput && notationInput[0]) {
            notationInput[0].value = scrambleMoves.join(' ');
        }
        runScrambleAnimation(scrambleMoves);
    });
}
