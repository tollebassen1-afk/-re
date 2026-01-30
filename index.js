
let audioContext;
let gamemode = null;
let currentSound = null;
let score = 0;
let answered = false;

const intervals = {
    unison: 0,
    minor2: 1,
    major2: 2,
    minor3: 3,
    major3: 4,
    perfect4: 5,
    tritone: 6,
    perfect5: 7,
    minor6: 8,
    major6: 9,
    minor7: 10,
    major7: 11,
    octave: 12
};

const chords3 = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8]
};

const chords4 = {
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10],
    diminished7: [0, 3, 6, 9],
    minor7b5: [0, 3, 6, 10]
};

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function createOscillator(frequency, duration = 1.0) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    return oscillator;
}
function playNote(frequency, duration = 1.0) {
    const oscillator = createOscillator(frequency, duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playInterval(intervalName) {
    const semitones = intervals[intervalName];
    const baseFreq = 440; // A4
    const intervalFreq = baseFreq * Math.pow(2, semitones / 12);


    playNote(baseFreq, 0.5);

    setTimeout(() => playNote(intervalFreq, 0.5), 600);
}


function playChord(chordType, numNotes) {
    const chordData = numNotes === 3 ? chords3[chordType] : chords4[chordType];
    const baseFreq = 440; 

    chordData.forEach((semitones, index) => {
        const freq = baseFreq * Math.pow(2, semitones / 12);
        setTimeout(() => playNote(freq, 0.5), index * 200);
    });
}

function getRandomSound() {
    if (gamemode === 'intervals') {
        const intervalNames = Object.keys(intervals);
        return intervalNames[Math.floor(Math.random() * intervalNames.length)];
    } else if (gamemode === 'chords3') {
        const chordNames = Object.keys(chords3);
        return chordNames[Math.floor(Math.random() * chordNames.length)];
    } else if (gamemode === 'chords4') {
        const chordNames = Object.keys(chords4);
        return chordNames[Math.floor(Math.random() * chordNames.length)];
    }
}

function playCurrentSound() {
    if (!audioContext) initAudio();
    if (gamemode === 'intervals') {
        playInterval(currentSound);
    } else if (gamemode === 'chords3') {
        playChord(currentSound, 3);
    } else if (gamemode === 'chords4') {
        playChord(currentSound, 4);
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function showFeedback(message, isCorrect) {
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = message;
    feedbackEl.style.color = isCorrect ? '#66fcf1' : '#ff2e63';
}


function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}


function generateOptions() {
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = '';

    let options;
    if (gamemode === 'intervals') {
        options = Object.keys(intervals);
    } else if (gamemode === 'chords3') {
        options = Object.keys(chords3);
    } else if (gamemode === 'chords4') {
        options = Object.keys(chords4);
    }

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'optionBtn';
        btn.dataset.option = option;
        btn.textContent = option.replace(/([A-Z])/g, ' $1').toLowerCase();
        optionsEl.appendChild(btn);
    });
}


function newQuestion() {
    currentSound = getRandomSound();
    answered = false;
    document.getElementById('replayBtn').disabled = false;
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('feedback').textContent = '';
    document.querySelectorAll('.optionBtn').forEach(btn => {
        btn.disabled = false;
        btn.style.background = '#1f2833';
    });
}


document.getElementById('intervalsBtn').addEventListener('click', () => {
    gamemode = 'intervals';
    showScreen('game');
    generateOptions();
    newQuestion();
});

document.getElementById('chords3Btn').addEventListener('click', () => {
    gamemode = 'chords3';
    showScreen('game');
    generateOptions();
    newQuestion();
});

document.getElementById('chords4Btn').addEventListener('click', () => {
    gamemode = 'chords4';
    showScreen('game');
    generateOptions();
    newQuestion();
});


document.getElementById('playBtn').addEventListener('click', () => {
    playCurrentSound();
    document.getElementById('replayBtn').disabled = false;
});


document.getElementById('replayBtn').addEventListener('click', () => {
    playCurrentSound();
});


document.getElementById('options').addEventListener('click', (e) => {
    if (!e.target.classList.contains('optionBtn') || answered) return;

    const selectedOption = e.target.dataset.option;
    answered = true;

    if (selectedOption === currentSound) {
        score += 10;
        showFeedback('Correct!', true);
    } else {
        score -= 5;
        showFeedback(`Wrong! It was ${currentSound.replace(/([A-Z])/g, ' $1').toLowerCase()}.`, false);
    }
    updateScore();

    document.querySelectorAll('.optionBtn').forEach(btn => btn.disabled = true);
    document.getElementById('nextBtn').classList.remove('hidden');
});

document.getElementById('nextBtn').addEventListener('click', () => {
    newQuestion();
});


document.getElementById('backBtn').addEventListener('click', () => {
    showScreen('homepage');
    score = 0;
    updateScore();
});


updateScore();
