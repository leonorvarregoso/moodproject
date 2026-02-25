const screenStart   = document.getElementById('screen-start');
const screenBreathe = document.getElementById('screen-breathe');
const playBtn       = document.getElementById('play-btn');
const stopBtn       = document.getElementById('stop-btn');
const circle        = document.getElementById('breathe-circle');
const label         = document.getElementById('breathe-label');

const SIZE_MIN = 160;  // px — breath out
const SIZE_MAX = 340;  // px — breath in
const TIME_IN  = 4000; // ms
const TIME_OUT = 6000; // ms

let animationId = null;
let running = false;
let phase = 'in';       // 'in' | 'out'
let phaseStart = null;
let currentSize = SIZE_MIN;

// ── arrancar ──────────────────────────────────────────────
playBtn.addEventListener('click', () => {
    screenStart.classList.add('hidden');
    screenBreathe.classList.remove('hidden');
    startBreathing();
});

// ── parar ─────────────────────────────────────────────────
stopBtn.addEventListener('click', () => {
    stopBreathing();
    screenBreathe.classList.add('hidden');
    screenStart.classList.remove('hidden');
});

// ── lógica ────────────────────────────────────────────────
function startBreathing() {
    running = true;
    phase = 'in';
    currentSize = SIZE_MIN;
    phaseStart = performance.now();
    label.textContent = 'breath in';
    circle.style.width  = currentSize + 'px';
    circle.style.height = currentSize + 'px';
    animationId = requestAnimationFrame(tick);
}

function stopBreathing() {
    running = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    // reset visual
    circle.style.width  = SIZE_MIN + 'px';
    circle.style.height = SIZE_MIN + 'px';
    label.textContent = 'breath in';
}

function tick(now) {
    if (!running) return;

    const elapsed  = now - phaseStart;
    const duration = phase === 'in' ? TIME_IN : TIME_OUT;
    const progress = Math.min(elapsed / duration, 1);

    // easing suave: seno (acelera no início, abranda no fim)
    const eased = easeInOut(progress);

    if (phase === 'in') {
        currentSize = SIZE_MIN + (SIZE_MAX - SIZE_MIN) * eased;
    } else {
        currentSize = SIZE_MAX - (SIZE_MAX - SIZE_MIN) * eased;
    }

    circle.style.width  = currentSize + 'px';
    circle.style.height = currentSize + 'px';

    if (progress >= 1) {
        // mudar fase
        if (phase === 'in') {
            phase = 'out';
            label.textContent = 'breath out';
        } else {
            phase = 'in';
            label.textContent = 'breath in';
        }
        phaseStart = now;
    }

    animationId = requestAnimationFrame(tick);
}

function easeInOut(t) {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
}