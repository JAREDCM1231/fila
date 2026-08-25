'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const sleep = ms => new Promise(res => setTimeout(res, ms));

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let queue = [];
let nextLetterIndex = 0;
let totalAdded = 0;
let totalRemoved = 0;
let busy = false;
let autoRunning = false;

const els = {
    track: $('#queueTrack'),
    simMsg: $('#simMsg'),
    learnMsg: $('#learningMsg'),
    learnCard: $('#learningCard'),
    statIn: $('#statInQueue'),
    statNext: $('#statNext'),
    statAdded: $('#statAdded'),
    statRemoved: $('#statRemoved'),
    btnAdd: $('#btnAdd'),
    btnRemove: $('#btnRemove'),
    btnReset: $('#btnReset'),
    btnAuto: $('#btnAuto'),
    btnExamples: $('#btnExamples'),
    examplesGrid: $('#examplesGrid'),
    mascot: $('#turtleMascot'),
    bubble: $('#turtleBubble'),
    retoLine: $('#retoLine'),
    retoOptions: $('#retoOptions'),
    retoMsg: $('#retoMsg'),
    retoStreak: $('#retoStreak'),
    retoCount: $('#retoCount'),
    retoHead: $('.reto-head')
};

function currentLetter() {
    return LETTERS[nextLetterIndex % LETTERS.length];
}

function makeItemWrap(letter) {
    const wrap = document.createElement('div');
    wrap.className = 'q-wrap';
    const item = document.createElement('div');
    item.className = 'q-item';
    item.textContent = letter;
    const tag = document.createElement('span');
    tag.className = 'q-tag';
    tag.textContent = 'sale primero';
    wrap.append(item, tag);
    return wrap;
}

function renderQueue({ enterLast = false } = {}) {
    els.track.innerHTML = '';
    if (queue.length === 0) {
        const hint = document.createElement('p');
        hint.className = 'empty-hint';
        hint.textContent = '🌊 La fila está vacía… agrega un elemento para comenzar.';
        els.track.append(hint);
    } else {
        queue.forEach((letter, i) => {
            const wrap = makeItemWrap(letter);
            if (i === 0) wrap.classList.add('is-first');
            if (enterLast && i === queue.length - 1) {
                wrap.querySelector('.q-item').classList.add('entering');
            }
            els.track.append(wrap);
        });
    }
    if (enterLast) els.track.scrollLeft = els.track.scrollWidth;
    updateStats();
}

function bump(el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
}

function updateStats() {
    const inQueue = String(queue.length);
    const nextOut = queue.length ? queue[0] : '—';
    if (els.statIn.textContent !== inQueue) { els.statIn.textContent = inQueue; bump(els.statIn); }
    if (els.statNext.textContent !== nextOut) { els.statNext.textContent = nextOut; bump(els.statNext); }
    els.statAdded.textContent = String(totalAdded);
    els.statRemoved.textContent = String(totalRemoved);
}

function setSim(text) {
    els.simMsg.textContent = text;
}

function setLearn(text, mood = '') {
    els.learnMsg.textContent = text;
    els.learnCard.dataset.mood = mood;
}

let bubbleTimer = null;

function turtleSay(text, mood = '', hold = 2600) {
    els.bubble.textContent = text;
    els.bubble.classList.add('show');
    els.mascot.className = 'turtle-mascot' + (mood ? ' ' + mood : '');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => els.bubble.classList.remove('show'), hold);
}

function setControlsDisabled(disabled) {
    [els.btnAdd, els.btnRemove, els.btnReset].forEach(b => { b.disabled = disabled; });
}

function doAdd() {
    if (autoRunning || busy) return;
    const letter = currentLetter();
    queue.push(letter);
    nextLetterIndex++;
    totalAdded++;
    renderQueue({ enterLast: true });
    setSim(`🐢 ¡${letter} acaba de entrar a la fila!`);
    setLearn('🐢 Nuevo elemento agregado. Recuerda que los nuevos elementos entran por la derecha.');
    turtleSay(`¡Hola, ${letter}! Entras al final de la fila 👋`, 'wave');
}

function doRemove() {
    if (autoRunning || busy) return;
    if (queue.length === 0) {
        setSim('🌊 La fila ya está vacía.');
        setLearn('🐢 La fila está vacía. Agrega un elemento para comenzar.', 'warn');
        turtleSay('Primero necesitas alguien en la fila 🙂', 'thinking');
        return;
    }
    busy = true;
    const removed = queue.shift();
    totalRemoved++;
    const firstWrap = els.track.querySelector('.q-wrap');
    if (firstWrap) {
        firstWrap.classList.remove('is-first');
        firstWrap.querySelector('.q-item').classList.add('leaving');
    }
    updateStats();
    setSim(`🎉 ${removed} fue el primero en entrar, por eso fue el primero en salir.`);
    setLearn('🎉 ¡Correcto! El primer elemento en entrar fue el primero en salir.', 'success');
    turtleSay('¡Exacto! El de adelante sale primero 🎉', 'happy');
    setTimeout(() => {
        renderQueue();
        busy = false;
    }, 480);
}

function doReset() {
    if (autoRunning || busy) return;
    hardReset();
    setSim('🔄 Fila reiniciada a [ A ] [ B ] [ C ] [ D ].');
    setLearn('🔄 Todo vuelve a empezar. La fila inicial es A, B, C y D: ¡A sigue siendo el próximo en salir!');
    turtleSay('¡Empezamos de nuevo! 🔄');
}

function hardReset() {
    queue = ['A', 'B', 'C', 'D'];
    nextLetterIndex = 4;
    totalAdded = 4;
    totalRemoved = 0;
    renderQueue();
}

async function toggleAuto() {
    if (autoRunning) {
        finishAuto();
        setLearn('⏹ Demo detenida. Ahora inténtalo tú con los botones.');
        turtleSay('Tú puedes 🐢');
        return;
    }
    autoRunning = true;
    setControlsDisabled(true);
    els.btnAuto.textContent = '⏹ Detener demo';
    els.btnAuto.classList.add('running');

    queue = [];
    nextLetterIndex = 0;
    totalAdded = 0;
    totalRemoved = 0;
    renderQueue();

    setSim('▶️ Modo automático: observa quién entra y quién sale.');
    setLearn('▶️ Demostración automática. Mira cómo cada elemento espera su turno.', 'info');
    turtleSay('¡Observa la fila! ▶️', 'wave');
    await sleep(900);

    for (const letter of ['A', 'B', 'C', 'D']) {
        if (!autoRunning) return finishAuto();
        queue.push(letter);
        nextLetterIndex++;
        totalAdded++;
        renderQueue({ enterLast: true });
        setSim(`🐢 ${letter} entró a la fila.`);
        setLearn(`🐢 ${letter} entró por la DERECHA (entrada).`, 'info');
        await sleep(1150);
    }

    if (!autoRunning) return finishAuto();
    setSim('🎉 La fila está completa. ¡Ahora salen en orden!');
    setLearn('🐢 A entró primero, así que A será el primero en salir.', 'info');
    turtleSay('Llegó la hora de salir… ⏰', 'thinking');
    await sleep(1500);

    while (queue.length) {
        if (!autoRunning) return finishAuto();
        const first = queue[0];
        if (first === 'A') {
            setLearn('🐢 Como A fue el primero en entrar, será el primero en salir.', 'info');
        } else {
            setLearn(`🐢 Cada uno espera su turno. ¡Ahora le toca salir a ${first}!`, 'info');
        }
        setSim(`🚪 ${first} sale por la izquierda (SALIDA).`);
        busy = true;
        const firstWrap = els.track.querySelector('.q-wrap');
        if (firstWrap) {
            firstWrap.classList.remove('is-first');
            firstWrap.querySelector('.q-item').classList.add('leaving');
        }
        queue.shift();
        totalRemoved++;
        updateStats();
        turtleSay(`¡Adiós, ${first}! 👋`);
        await sleep(520);
        renderQueue();
        busy = false;
        await sleep(1150);
    }

    if (!autoRunning) return finishAuto();
    setSim('✅ Demo completa: primero en entrar, primero en salir.');
    setLearn('🎉 ¡Demo completa! Cada elemento salió en el mismo orden en que entró.', 'success');
    turtleSay('¿Viste? ¡FIFO en acción! 🎉', 'party');
    finishAuto();
}

function finishAuto() {
    autoRunning = false;
    setControlsDisabled(false);
    els.btnAuto.textContent = '▶️ Modo automático';
    els.btnAuto.classList.remove('running');
}

const EXAMPLE_SETS = [
    [
        { icon: '🛒', title: 'Fila del supermercado', desc: 'La primera persona que llega es la primera en ser atendida.' },
        { icon: '🎟️', title: 'Fila para entradas', desc: 'Las personas son atendidas en el orden en que llegaron.' },
        { icon: '🖨️', title: 'Trabajos de impresora', desc: 'Los documentos se imprimen en el orden en que fueron enviados.' },
        { icon: '👩‍💻', title: 'Atención al cliente', desc: 'Las personas son atendidas en el orden de llegada.' }
    ],
    [
        { icon: '🍔', title: 'Auto-servicio (drive-thru)', desc: 'Los autos son atendidos según el orden en que llegaron.' },
        { icon: '🏥', title: 'Turnos del médico', desc: 'Se atiende primero a quien tomó su turno antes.' },
        { icon: '✈️', title: 'Embarque del avión', desc: 'Aborda primero quien hizo la fila primero.' },
        { icon: '📞', title: 'Llamadas al soporte', desc: 'Las llamadas se responden en el orden en que entraron.' }
    ],
    [
        { icon: '🎬', title: 'Cola del cine', desc: 'Entra primero quien llegó primero a la taquilla.' },
        { icon: '🏦', title: 'Fila del banco', desc: 'Un cajero atiende a las personas una por una, por orden de llegada.' },
        { icon: '🎢', title: 'Juegos mecánicos', desc: 'Sube al juego quien está al frente de la fila.' },
        { icon: '📦', title: 'Pedidos en línea', desc: 'Los pedidos se preparan y envían según el orden de compra.' }
    ]
];

let exampleIndex = 0;

function renderExamples() {
    els.examplesGrid.innerHTML = '';
    EXAMPLE_SETS[exampleIndex].forEach(ex => {
        const card = document.createElement('article');
        card.className = 'example-mini';
        const icon = document.createElement('span');
        icon.className = 'example-icon';
        icon.textContent = ex.icon;
        const box = document.createElement('div');
        const h = document.createElement('h4');
        h.textContent = ex.title;
        const p = document.createElement('p');
        p.textContent = ex.desc;
        box.append(h, p);
        card.append(icon, box);
        els.examplesGrid.append(card);
    });
    els.examplesGrid.classList.remove('fade');
    void els.examplesGrid.offsetWidth;
    els.examplesGrid.classList.add('fade');
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const RETO_GROUPS = [
    ['Ana', 'Luis', 'María', 'Carlos'],
    ['Pedro', 'Sofía', 'Diego', 'Lucía'],
    ['Marta', 'Juan', 'Elena', 'Pablo'],
    ['Informe.pdf', 'Foto.png', 'Tarea.docx', 'Boleta.pdf'],
    ['Turno 14', 'Turno 07', 'Turno 21', 'Turno 03'],
    ['Auto rojo', 'Auto azul', 'Auto verde', 'Auto blanco']
];

let retoAnswer = '';
let retoLocked = false;
let retoStreak = 0;
let retoNumber = 1;
let lastGroupIndex = 0;

function newReto(fixed = false) {
    retoLocked = false;
    let items;
    if (fixed) {
        items = [...RETO_GROUPS[0]];
        lastGroupIndex = 0;
    } else {
        let idx;
        do { idx = Math.floor(Math.random() * RETO_GROUPS.length); } while (idx === lastGroupIndex);
        lastGroupIndex = idx;
        items = shuffle(RETO_GROUPS[idx]);
    }
    retoAnswer = items[0];

    els.retoLine.innerHTML = '';
    const mkLabel = t => {
        const s = document.createElement('span');
        s.className = 'reto-chip-label';
        s.textContent = t;
        return s;
    };
    const mkArrow = () => {
        const s = document.createElement('span');
        s.className = 'reto-chip-arrow';
        s.textContent = '←';
        return s;
    };
    els.retoLine.append(mkLabel('SALIDA'), mkArrow());
    items.forEach((name, i) => {
        const chip = document.createElement('span');
        chip.className = 'reto-chip' + (i === 0 ? ' first' : '');
        chip.textContent = name;
        els.retoLine.append(chip);
    });
    els.retoLine.append(mkArrow(), mkLabel('ENTRADA'));

    els.retoOptions.innerHTML = '';
    shuffle(items).forEach(name => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reto-option';
        btn.textContent = name;
        btn.addEventListener('click', () => checkReto(name, btn));
        els.retoOptions.append(btn);
    });

    els.retoMsg.textContent = 'Selecciona tu respuesta 👇';
    els.retoMsg.className = 'reto-msg';
    els.retoHead.classList.remove('good', 'bad');
    updateRetoScore();
}

function checkReto(name, btn) {
    if (retoLocked) return;
    if (name === retoAnswer) {
        retoLocked = true;
        btn.classList.add('correct');
        $$('.reto-option', els.retoOptions).forEach(b => { b.disabled = true; });
        retoStreak++;
        retoNumber++;
        updateRetoScore();
        els.retoMsg.textContent = `🐢🎉 ¡Excelente! ${retoAnswer} fue el primero en entrar, por eso es el primero en salir.`;
        els.retoMsg.className = 'reto-msg ok';
        els.retoHead.classList.add('good');
        els.retoHead.classList.remove('bad');
        turtleSay('¡Respuesta perfecta! 🎉', 'party', 3200);
        setTimeout(() => newReto(false), 1700);
    } else {
        btn.disabled = true;
        btn.classList.add('wrong');
        els.retoMsg.textContent = '🐢💡 Casi. Recuerda: FIFO significa primero en entrar, primero en salir.';
        els.retoMsg.className = 'reto-msg bad';
        els.retoHead.classList.add('bad');
        els.retoHead.classList.remove('good');
        turtleSay('Piensa… ¿quién llegó primero? 🤔', 'thinking', 3000);
    }
}

function updateRetoScore() {
    els.retoStreak.textContent = String(retoStreak);
    els.retoCount.textContent = String(retoNumber);
}

function setupScrollSpy() {
    const links = $$('.nav-link');
    const sections = links
        .map(l => document.querySelector(l.getAttribute('href')))
        .filter(Boolean);

    const setActive = id => {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));

    links.forEach(link => {
        link.addEventListener('click', () => {
            setActive(link.getAttribute('href').slice(1));
            closeMenu();
        });
    });
}

function openMenu() {
    document.body.classList.add('menu-open');
    $('#btnMenu').setAttribute('aria-expanded', 'true');
}

function closeMenu() {
    document.body.classList.remove('menu-open');
    $('#btnMenu').setAttribute('aria-expanded', 'false');
}

function init() {
    queue = [];
    nextLetterIndex = 0;
    totalAdded = 0;
    totalRemoved = 0;
    renderQueue();

    els.btnAdd.addEventListener('click', doAdd);
    els.btnRemove.addEventListener('click', doRemove);
    els.btnReset.addEventListener('click', doReset);
    els.btnAuto.addEventListener('click', toggleAuto);
    els.btnExamples.addEventListener('click', () => {
        exampleIndex = (exampleIndex + 1) % EXAMPLE_SETS.length;
        renderExamples();
    });

    $('#btnMenu').addEventListener('click', () => {
        document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
    $('#menuOverlay').addEventListener('click', closeMenu);

    renderExamples();
    newReto(true);
    setupScrollSpy();
}

init();
