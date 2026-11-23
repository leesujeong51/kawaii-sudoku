/**
 * Kawaii Sound & BGM Manager
 * Plays assets/sounds/bgm_cute_theme.mp3 at volume 0.2 in an infinite loop!
 * Includes top-right BGM toggle, Web Audio SFX, and fallback data URI.
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.bgmEnabled = true;
        this.bgmAudio = null;
        this.isBgmPlaying = false;
        this.init();
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            this.ctx = new AudioContext();
        }
        
        const savedBgm = localStorage.getItem('kawaii_sudoku_bgm');
        if (savedBgm !== null) {
            this.bgmEnabled = savedBgm === 'true';
        }

        const savedSound = localStorage.getItem('kawaii_sudoku_sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
        }

        // Initialize HTML5 Audio with bgm_cute_theme.mp3
        this.bgmAudio = new Audio();
        this.bgmAudio.src = 'assets/sounds/bgm_cute_theme.mp3';
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.2;
        this.bgmAudio.preload = 'auto';

        // Fallback to embedded Base64 data URI if relative file path cannot be reached
        this.bgmAudio.addEventListener('error', () => {
            if (window.BGM_EMBEDDED_DATA_URI && this.bgmAudio.src !== window.BGM_EMBEDDED_DATA_URI) {
                console.log('Falling back to embedded BGM data URI...');
                this.bgmAudio.src = window.BGM_EMBEDDED_DATA_URI;
                if (this.bgmEnabled && this.isBgmPlaying) {
                    this.bgmAudio.play().catch(e => console.log('Autoplay prevented:', e));
                }
            }
        });

        // Start BGM on user's first interaction
        const startOnUserGesture = () => {
            this.ensureContext();
            if (this.bgmEnabled && !this.isBgmPlaying) {
                this.startBGM();
            }
            window.removeEventListener('click', startOnUserGesture);
            window.removeEventListener('touchstart', startOnUserGesture);
        };
        window.addEventListener('click', startOnUserGesture);
        window.addEventListener('touchstart', startOnUserGesture);

        // Auto mute & pause BGM when minimized, switched tab, or window lost focus
        this.wasBgmPlayingBeforeHidden = false;

        const handleBlurOrHide = () => {
            if (this.isBgmPlaying) {
                this.wasBgmPlayingBeforeHidden = true;
                this.pauseBGM();
            }
            if (this.ctx && this.ctx.state === 'running') {
                this.ctx.suspend();
            }
        };

        const handleFocusOrShow = () => {
            if (this.wasBgmPlayingBeforeHidden && this.bgmEnabled) {
                this.startBGM();
                this.wasBgmPlayingBeforeHidden = false;
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                handleBlurOrHide();
            } else {
                handleFocusOrShow();
            }
        });

        window.addEventListener('pagehide', handleBlurOrHide);
        window.addEventListener('pageshow', handleFocusOrShow);
        window.addEventListener('blur', handleBlurOrHide);
        window.addEventListener('focus', handleFocusOrShow);
    }

    ensureContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startBGM() {
        if (!this.bgmEnabled || !this.bgmAudio) return;
        this.ensureContext();
        this.bgmAudio.volume = 0.2;
        this.bgmAudio.loop = true;

        const playPromise = this.bgmAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isBgmPlaying = true;
                this.updateBgmButtonsUI();
            }).catch(err => {
                console.log('Autoplay was prevented by browser policy, will resume on touch:', err);
            });
        }
    }

    pauseBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.isBgmPlaying = false;
            this.updateBgmButtonsUI();
        }
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        localStorage.setItem('kawaii_sudoku_bgm', this.bgmEnabled);
        if (this.bgmEnabled) {
            this.ensureContext();
            this.startBGM();
        } else {
            this.pauseBGM();
        }
        this.updateBgmButtonsUI();
        return this.bgmEnabled;
    }

    updateBgmButtonsUI() {
        const btns = document.querySelectorAll('.btn-bgm-toggle, .btn-sound-toggle');
        btns.forEach(btn => {
            if (this.bgmEnabled && this.isBgmPlaying) {
                btn.textContent = '🎵';
                btn.title = '배경음악 끄기 (BGM ON 중)';
                btn.classList.add('bgm-active');
            } else {
                btn.textContent = '🔇';
                btn.title = '배경음악 켜기 (BGM OFF 중)';
                btn.classList.remove('bgm-active');
            }
        });
    }

    // ==========================================
    // JUICY IN-GAME SOUND EFFECTS (SFX)
    // ==========================================
    playTileSelect() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const baseFreq = 780 + Math.random() * 120;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.06);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
    }

    playClick() {
        this.playTileSelect();
    }

        playMatchCombo(combo = 1) {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();

        if (combo >= 3) {
            this.playSuperCombo(combo);
            return;
        }

        const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        const pitchIdx = Math.min(scale.length - 1, (combo - 1) % scale.length);
        const baseFreq = scale[pitchIdx];

        const notes = combo === 1 ? [baseFreq, baseFreq * 1.5, baseFreq * 2] : [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.5];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
            const now = this.ctx.currentTime + idx * 0.035;

            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(combo === 1 ? 0.24 : 0.30, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        });
    }

    playSuperCombo(combo = 3) {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // Euphoric Ascending Arpeggio Fanfare (Pentatonic Octave Jump)
        const arpeggio = combo >= 4 ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00] : [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        arpeggio.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const noteTime = now + idx * 0.04;

            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.32, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(noteTime);
            osc.stop(noteTime + 0.45);
        });

        // Resonant Celestial Sparkle Bell Overtones
        for (let i = 0; i < 3; i++) {
            const bellOsc = this.ctx.createOscillator();
            const bellGain = this.ctx.createGain();
            bellOsc.type = 'triangle';
            const bellTime = now + 0.12 + i * 0.05;
            bellOsc.frequency.setValueAtTime(1760 + i * 440, bellTime);
            bellGain.gain.setValueAtTime(0.18, bellTime);
            bellGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.5);

            bellOsc.connect(bellGain);
            bellGain.connect(this.ctx.destination);
            bellOsc.start(bellTime);
            bellOsc.stop(bellTime + 0.5);
        }

        // Sub Bass Punch for deep satisfaction
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(160, now);
        bassOsc.frequency.exponentialRampToValueAtTime(50, now + 0.28);
        bassGain.gain.setValueAtTime(0.35, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.30);
    }

    playCorrect() {
        this.playMatchCombo(1);
    }

    playLineComplete() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        chords.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const now = this.ctx.currentTime + idx * 0.045;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.26, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
        });
    }


    // ==========================================
    // WOOD STAR CARVER (나무별 깎기) TACTILE SOUNDS
    // ==========================================

    playWoodTap() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // Wooden block transient strike
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playWoodCarve() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // Chisel slicing through wood grain
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(850, now);
        osc1.frequency.linearRampToValueAtTime(1200, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(420, now + 0.16);

        gain1.gain.setValueAtTime(0.24, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        // Tactile wood chip release
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, now + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(180, now + 0.14);

        gain2.gain.setValueAtTime(0.28, now + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.04);
        osc2.stop(now + 0.15);
    }

    playWoodTrenchBreak() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // Deep resonant trench chasm break
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(180, now);
        bassOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

        bassGain.gain.setValueAtTime(0.45, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.38);

        // Star chime ring across the chasm
        const starFreqs = [784, 1046, 1318, 1568];
        starFreqs.forEach((f, idx) => {
            const sOsc = this.ctx.createOscillator();
            const sGain = this.ctx.createGain();
            const sTime = now + 0.06 + idx * 0.05;
            sOsc.type = 'triangle';
            sOsc.frequency.setValueAtTime(f, sTime);
            sGain.gain.setValueAtTime(0.22, sTime);
            sGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.35);
            sOsc.connect(sGain);
            sGain.connect(this.ctx.destination);
            sOsc.start(sTime);
            sOsc.stop(sTime + 0.35);
        });
    }

    playWoodMarimbaCombo(combo = 1) {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // Pentatonic scale frequencies simulating rosewood marimba bars
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const baseIdx = Math.min(scale.length - 3, (combo - 1) * 2);
        const notes = [scale[baseIdx], scale[baseIdx + 1], scale[baseIdx + 2]];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.055;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            // Natural marimba acoustic decay
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.28);
        });
    }

    playBombBoom() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);

        for (let i = 0; i < 4; i++) {
            const sOsc = this.ctx.createOscillator();
            const sGain = this.ctx.createGain();
            sOsc.type = 'triangle';
            const sTime = now + 0.05 + i * 0.04;
            sOsc.frequency.setValueAtTime(1400 + i * 350, sTime);
            sGain.gain.setValueAtTime(0.18, sTime);
            sGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.2);
            sOsc.connect(sGain);
            sGain.connect(this.ctx.destination);
            sOsc.start(sTime);
            sOsc.stop(sTime + 0.2);
        }
    }

    playRocketWhoosh() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.35);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
    }

    playWrong() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    }

    playVictory() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const fanfareNotes = [
            { f: 523.25, d: 0.12, g: 0.28 },
            { f: 659.25, d: 0.12, g: 0.28 },
            { f: 783.99, d: 0.12, g: 0.30 },
            { f: 1046.50, d: 0.28, g: 0.35 },
            { f: 880.00, d: 0.14, g: 0.28 },
            { f: 1046.50, d: 0.14, g: 0.32 },
            { f: 1318.51, d: 0.16, g: 0.36 },
            { f: 1567.98, d: 0.55, g: 0.40 }
        ];

        let offset = 0;
        fanfareNotes.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const now = this.ctx.currentTime + offset;
            osc.frequency.setValueAtTime(item.f, now);
            gain.gain.setValueAtTime(item.g, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + item.d + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + item.d + 0.15);
            offset += item.d * 0.85;
        });
    }

    playStarSlam(starIndex = 1) {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const basePitches = [659.25, 880.00, 1318.51];
        const pitch = basePitches[Math.min(2, starIndex - 1)];

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(160, now);
        bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        bassGain.gain.setValueAtTime(0.45, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.3);

        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'triangle';
        chimeOsc.frequency.setValueAtTime(pitch, now);
        chimeGain.gain.setValueAtTime(0.35, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chimeOsc.start(now);
        chimeOsc.stop(now + 0.45);
    }

    playGem() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(1760, now);
        osc.frequency.setValueAtTime(2637.02, now + 0.08);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playStageStart() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const now = this.ctx.currentTime + idx * 0.06;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        });
    }

    // --- Sichuan (사천성) Audio FX ---
    playTileTap() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playTileMatch() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.05;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    playTileMismatch() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playSichuanCombo(combo = 1) {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const baseFreq = Math.min(1400, 500 + combo * 100);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playTileShuffle() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        for (let i = 0; i < 6; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.04;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350 + Math.random() * 400, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
        }
    }
}
window.SoundManager = SoundManager;
