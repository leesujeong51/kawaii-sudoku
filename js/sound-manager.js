/**
 * Kawaii Sound & BGM Manager using Web Audio API
 * Generates sparkling music-box SFX and a fast, lively, super-sweet Kawaii Pop BGM loop (140 BPM)!
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.bgmGainNode = null;
        this.bgmFilterNode = null;
        this.isBgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.nextNoteTime = 0;
        this.init();
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            this.ctx = new AudioContext();
        }
        const saved = localStorage.getItem('kawaii_sudoku_sound');
        if (saved !== null) {
            this.soundEnabled = saved === 'true';
        }

        // Try to start BGM on first user interaction
        const startOnUserGesture = () => {
            this.ensureContext();
            if (this.soundEnabled && !this.isBgmPlaying) {
                this.startBGM();
            }
            window.removeEventListener('click', startOnUserGesture);
            window.removeEventListener('touchstart', startOnUserGesture);
        };
        window.addEventListener('click', startOnUserGesture);
        window.addEventListener('touchstart', startOnUserGesture);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('kawaii_sudoku_sound', this.soundEnabled);
        if (this.soundEnabled) {
            this.ensureContext();
            this.startBGM();
        } else {
            this.pauseBGM();
        }
        return this.soundEnabled;
    }

    ensureContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ==========================================
    // PROCEDURAL KAWAII BGM ENGINE (140 BPM Lively & Lovely!)
    // ==========================================
    startBGM() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        if (this.isBgmPlaying) return;

        if (!this.bgmGainNode) {
            this.bgmGainNode = this.ctx.createGain();
            this.bgmFilterNode = this.ctx.createBiquadFilter();
            this.bgmFilterNode.type = 'lowpass';
            this.bgmFilterNode.frequency.setValueAtTime(3200, this.ctx.currentTime);
            this.bgmFilterNode.Q.setValueAtTime(0.6, this.ctx.currentTime);

            this.bgmGainNode.connect(this.bgmFilterNode);
            this.bgmFilterNode.connect(this.ctx.destination);
        }

        // Cheerful yet soothing gentle volume level
        this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgmGainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.bgmGainNode.gain.exponentialRampToValueAtTime(0.085, this.ctx.currentTime + 0.8);

        this.isBgmPlaying = true;
        this.bgmStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this.scheduleBGM();
    }

    pauseBGM() {
        if (!this.isBgmPlaying || !this.ctx) return;
        if (this.bgmGainNode) {
            this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
            this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, this.ctx.currentTime);
            this.bgmGainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
        }
        if (this.bgmTimer) clearTimeout(this.bgmTimer);
        this.isBgmPlaying = false;
    }

    scheduleBGM() {
        if (!this.isBgmPlaying || !this.ctx) return;

        // 140 BPM: 16th notes = 60 / 140 / 2 = ~0.107s
        const secondsPerStep = 60.0 / 140.0 / 2.0;
        const lookahead = 0.25;

        while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
            this.playBGMStep(this.bgmStep, this.nextNoteTime);
            this.nextNoteTime += secondsPerStep;
            this.bgmStep = (this.bgmStep + 1) % 64; // 8 measures (64 steps)
        }

        this.bgmTimer = setTimeout(() => this.scheduleBGM(), 50);
    }

    playBGMStep(step, time) {
        if (!this.ctx || !this.bgmGainNode) return;

        // 8 Measures - Royal Kawaii Anime Progression (王道進行):
        // Fmaj7 ➔ G7 ➔ Em7 ➔ Am7 ➔ Dm7 ➔ G7 ➔ Cmaj7 ➔ C7
        const bar = Math.floor(step / 8);
        const subStep = step % 8;

        const chords = [
            { root: 87.31,  arps: [220.00, 261.63, 329.63, 440.00] }, // Bar 0: Fmaj7 (F2, [A3, C4, E4, A4])
            { root: 98.00,  arps: [246.94, 293.66, 349.23, 493.88] }, // Bar 1: G7 (G2, [B3, D4, F4, B4])
            { root: 82.41,  arps: [196.00, 246.94, 329.63, 392.00] }, // Bar 2: Em7 (E2, [G3, B3, E4, G4])
            { root: 110.00, arps: [261.63, 329.63, 392.00, 523.25] }, // Bar 3: Am7 (A2, [C4, E4, G4, C5])
            { root: 73.42,  arps: [174.61, 220.00, 261.63, 349.23] }, // Bar 4: Dm7 (D2, [F3, A3, C4, F4])
            { root: 98.00,  arps: [196.00, 246.94, 293.66, 392.00] }, // Bar 5: G7 (G2, [G3, B3, D4, G4])
            { root: 130.81, arps: [329.63, 392.00, 493.88, 659.25] }, // Bar 6: Cmaj7 (C3, [E4, G4, B4, E5])
            { root: 130.81, arps: [329.63, 392.00, 466.16, 523.25] }  // Bar 7: C7 (C3, [E4, G4, Bb4, C5])
        ];

        const chord = chords[bar];

        // 1. Playful Bouncy Bass (subSteps 0, 3, 4, 6 - lively syncopated funk-pop groove!)
        if (subStep === 0 || subStep === 3 || subStep === 4 || subStep === 6) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const freq = subStep === 3 || subStep === 6 ? chord.root * 2 : chord.root;
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(0.38, time + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

            osc.connect(gain);
            gain.connect(this.bgmGainNode);
            osc.start(time);
            osc.stop(time + 0.32);
        }

        // 2. Sparkly Kalimba / Marimba Arpeggio (every 16th note with alternating octaves)
        if (subStep % 2 === 0 || subStep === 5 || subStep === 7) {
            const arpIdx = (subStep) % chord.arps.length;
            const freq = chord.arps[arpIdx];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(0.24, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

            osc.connect(gain);
            gain.connect(this.bgmGainNode);
            osc.start(time);
            osc.stop(time + 0.22);
        }

        // 3. Super Sweet & Catchy Anime Lead Melody (Music Box / Glockenspiel Layer)
        const melodyPattern = [
            // Bar 0 (Fmaj7 - Lovely Opening)
            { s: 0, f: 880.00 }, { s: 2, f: 1046.50 }, { s: 4, f: 1318.51 }, { s: 6, f: 1046.50 },
            // Bar 1 (G7 - Sweet Lift)
            { s: 8, f: 987.77 }, { s: 10, f: 1174.66 }, { s: 12, f: 987.77 }, { s: 14, f: 783.99 },
            // Bar 2 (Em7 - Heart Flutter)
            { s: 16, f: 783.99 }, { s: 18, f: 987.77 }, { s: 20, f: 1318.51 }, { s: 22, f: 987.77 },
            // Bar 3 (Am7 - Bouncy Rhythm)
            { s: 24, f: 880.00 }, { s: 26, f: 1046.50 }, { s: 28, f: 987.77 }, { s: 30, f: 880.00 },
            // Bar 4 (Dm7 - Sparkling Step)
            { s: 32, f: 698.46 }, { s: 34, f: 880.00 }, { s: 36, f: 1174.66 }, { s: 38, f: 880.00 },
            // Bar 5 (G7 - Climax Build)
            { s: 40, f: 783.99 }, { s: 42, f: 987.77 }, { s: 44, f: 1174.66 }, { s: 46, f: 1396.91 },
            // Bar 6 (Cmaj7 - Pure Delight)
            { s: 48, f: 1318.51 }, { s: 50, f: 1174.66 }, { s: 52, f: 1046.50 }, { s: 54, f: 783.99 },
            // Bar 7 (C7 - Turnaround Sparkle)
            { s: 56, f: 1046.50 }, { s: 58, f: 932.33 }, { s: 60, f: 783.99 }, { s: 62, f: 1046.50 }
        ];

        const note = melodyPattern.find(m => m.s === step);
        if (note) {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.f, time);

            // Shimmer chime harmonic overtone
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(note.f * 2, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(0.32, time + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.bgmGainNode);

            osc.start(time);
            osc2.start(time);
            osc.stop(time + 0.3);
            osc2.stop(time + 0.3);
        }
    }


    // ==========================================
    // SOUND EFFECTS (SFX)
    // ==========================================
    playClick() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.07);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
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

    playCorrect() {
        if (!this.soundEnabled || !this.ctx) return;
        this.ensureContext();
        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const now = this.ctx.currentTime + idx * 0.05;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
        });
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
        const melody = [
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.12 },
            { f: 783.99, d: 0.12 },
            { f: 1046.50, d: 0.22 },
            { f: 880.00, d: 0.12 },
            { f: 1046.50, d: 0.45 }
        ];
        let offset = 0;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const now = this.ctx.currentTime + offset;
            osc.frequency.setValueAtTime(item.f, now);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + item.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + item.d);
            offset += item.d * 0.82;
        });
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
}
window.SoundManager = SoundManager;
