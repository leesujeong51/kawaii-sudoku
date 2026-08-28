import os
import sys
import base64

project_dir = r'C:\Users\이수정\.gemini\antigravity\scratch\kawaii-sudoku'

MASCOT_SPRITES = {}
for name in ['idle', 'happy', 'thinking', 'sad', 'sad_sitting']:
    p = os.path.join(project_dir, 'assets', 'characters', f'mascot_{name}.png')
    with open(p, 'rb') as f:
        MASCOT_SPRITES[name] = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')


def write_file(rel_path, content):
    p = os.path.join(project_dir, rel_path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Wrote {rel_path} ({len(content)} chars)')

# 1. sound-manager.js
write_file('js/sound-manager.js', """/**
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
""")


# 2. particle-system.js
write_file('js/particle-system.js', """/**
 * Kawaii Particle System - Sakura breeze, sparkling hearts, ribbons & gems!
 */
class ParticleSystem {
    constructor(bgCanvasId, fxCanvasId) {
        this.bgCanvas = document.getElementById(bgCanvasId);
        this.fxCanvas = document.getElementById(fxCanvasId);
        this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
        this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;
        this.sakuraPetals = [];
        this.fxParticles = [];
        this.gems = [];
        this.initResize();
        this.initSakura(28);
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }
    initResize() {
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (this.bgCanvas) { this.bgCanvas.width = w; this.bgCanvas.height = h; }
            if (this.fxCanvas) { this.fxCanvas.width = w; this.fxCanvas.height = h; }
        };
        window.addEventListener('resize', resize);
        resize();
    }
    initSakura(count) {
        this.sakuraPetals = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < count; i++) {
            this.sakuraPetals.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 8 + 6,
                speedX: Math.random() * 1.2 + 0.5,
                speedY: Math.random() * 1.4 + 0.8,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.03,
                opacity: Math.random() * 0.4 + 0.45,
                flip: Math.random() * Math.PI,
                flipSpeed: Math.random() * 0.04 + 0.02
            });
        }
    }
    spawnSparkles(x, y, count = 14) {
        const colors = ['#FF8DA1', '#FF6B8B', '#FFD166', '#A8E6CF', '#BCE7FD', '#FF9EAA', '#E8D7FF'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = Math.random() * 4.5 + 2.5;
            const isHeart = Math.random() > 0.45;
            this.fxParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: isHeart ? Math.random() * 9 + 8 : Math.random() * 7 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                decay: Math.random() * 0.025 + 0.02,
                type: isHeart ? 'heart' : 'star',
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    spawnGemShower(count = 50) {
        const w = window.innerWidth;
        const gemColors = ['#FF4D80', '#A066FF', '#00E5FF', '#FFD700', '#00E676', '#FF85A1'];
        for (let i = 0; i < count; i++) {
            this.gems.push({
                x: Math.random() * w,
                y: -30 - Math.random() * 180,
                vx: (Math.random() - 0.5) * 4.5,
                vy: Math.random() * 4 + 3.5,
                gravity: 0.18,
                size: Math.random() * 15 + 12,
                color: gemColors[Math.floor(Math.random() * gemColors.length)],
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.09,
                bounce: 0.5 + Math.random() * 0.25,
                opacity: 1
            });
        }
    }
    drawHeart(ctx, x, y, size, color, opacity, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        const d = size / 2;
        ctx.moveTo(0, d / 4);
        ctx.bezierCurveTo(d / 2, -d / 2, d, d / 3, 0, d);
        ctx.bezierCurveTo(-d, d / 3, -d / 2, -d / 2, 0, d / 4);
        ctx.fill();
        ctx.restore();
    }
    drawStar(ctx, x, y, size, color, opacity, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size, -Math.sin((18 + i * 72) * Math.PI / 180) * size);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    drawGem(ctx, gem) {
        ctx.save();
        ctx.translate(gem.x, gem.y);
        ctx.rotate(gem.rot);
        ctx.globalAlpha = gem.opacity;
        ctx.fillStyle = gem.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        const s = gem.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.8, -s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.8, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    animate() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (this.bgCtx && this.bgCanvas) {
            this.bgCtx.clearRect(0, 0, w, h);
            for (const p of this.sakuraPetals) {
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;
                p.flip += p.flipSpeed;
                if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
                if (p.x > w + 20) { p.x = -20; }
                this.bgCtx.save();
                this.bgCtx.translate(p.x, p.y);
                this.bgCtx.rotate(p.rotation);
                this.bgCtx.scale(Math.cos(p.flip), 1);
                this.bgCtx.globalAlpha = p.opacity;
                this.bgCtx.fillStyle = '#FFB7C5';
                this.bgCtx.beginPath();
                this.bgCtx.moveTo(0, -p.size);
                this.bgCtx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.8, p.size * 0.5, 0, p.size);
                this.bgCtx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
                this.bgCtx.fill();
                this.bgCtx.restore();
            }
        }
        if (this.fxCtx && this.fxCanvas) {
            this.fxCtx.clearRect(0, 0, w, h);
            for (let i = this.fxParticles.length - 1; i >= 0; i--) {
                const pt = this.fxParticles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.vy += 0.08;
                pt.rot += pt.rotSpeed;
                pt.opacity -= pt.decay;
                if (pt.opacity <= 0) { this.fxParticles.splice(i, 1); continue; }
                if (pt.type === 'heart') {
                    this.drawHeart(this.fxCtx, pt.x, pt.y, pt.size, pt.color, pt.opacity, pt.rot);
                } else {
                    this.drawStar(this.fxCtx, pt.x, pt.y, pt.size, pt.color, pt.opacity, pt.rot);
                }
            }
            for (let i = this.gems.length - 1; i >= 0; i--) {
                const g = this.gems[i];
                g.x += g.vx;
                g.vy += g.gravity;
                g.y += g.vy;
                g.rot += g.rotSpeed;
                if (g.y > h - 40 && g.vy > 0) {
                    g.vy = -g.vy * g.bounce;
                    g.vx *= 0.8;
                }
                if (g.y > h + 100 || g.opacity <= 0) {
                    this.gems.splice(i, 1);
                    continue;
                }
                this.drawGem(this.fxCtx, g);
            }
        }
        requestAnimationFrame(this.animate);
    }
}
window.ParticleSystem = ParticleSystem;
""")

# 3. mascot-manager.js with Base64 embedded sprites!
mascot_code = f"""/**
 * Kawaii Mascot Manager - Princess Lulu (Pink Crystal Owl)
 * Embedded Base64 Sprites for 100% offline & GitHub Pages compatibility!
 */
class MascotManager {{
    constructor() {{
        this.imgElements = document.querySelectorAll('.mascot-img-sync');
        this.bubbleElements = document.querySelectorAll('.mascot-speech-sync');
        
        this.sprites = {repr(MASCOT_SPRITES)};
        
        this.quotes = {{
            idle: [
                '오늘도 힘내요! 🌸',
                '루루가 응원할게요! 💖',
                '스도쿠 마법 시작! ✨',
                '반짝반짝 좋은 예감이에요! 🎀',
                '스테이지를 하나씩 정복해봐요! 🍀'
            ],
            thinking: [
                '음... 어디에 들어갈까? 💭',
                '행과 열을 잘 살펴봐요! 🧐',
                '가로 세로 상자에 답이 있어요!',
                '어려우면 힌트 요정을 불러요! 💡'
            ],
            happy: [
                '와아! 정답이에요! 🎉',
                '대단해요! 완벽한 한 수! 💖',
                '최고최고! 반짝반짝! ✨',
                '루루는 당신이 자랑스러워요! 👑'
            ],
            sad: [
                '앗! 겹치는 숫자가 있어요! 💧',
                '괜찮아요, 다시 찾아봐요! 🥺',
                '침착하게 다시 살펴봐요! 🩹'
            ],
            out_of_hearts: [
                '하트가 다 떨어졌어요... 🥺',
                '보석이나 광고로 충전해볼까요? 💎',
                '잠시 쉬어가도 좋아요! ☕'
            ],
            clear: [
                '축하해요! 스테이지 완벽 클리어! 👑✨',
                '영롱한 보석이 가득 쏟아져요! 🎁💖'
            ]
        }};
        this.currentState = 'idle';
        this.resetTimer = null;
        this.idleThoughtTimer = null;
        this.init();
    }}
    init() {{
        document.querySelectorAll('.mascot-tap-trigger').forEach(el => {{
            el.addEventListener('click', () => this.onMascotTapped());
        }});
        this.setState('idle');
        this.startIdleChatter();
    }}
    startIdleChatter() {{
        if (this.idleThoughtTimer) clearInterval(this.idleThoughtTimer);
        this.idleThoughtTimer = setInterval(() => {{
            if (this.currentState === 'idle') {{
                this.sayRandom('idle');
            }}
        }}, 10000);
    }}
    setState(state, customQuote = null, duration = 3500) {{
        this.currentState = state;
        if (this.resetTimer) clearTimeout(this.resetTimer);
        let spriteSrc = this.sprites[state] || this.sprites.idle;
        if (state === 'wrong') spriteSrc = this.sprites.sad;
        if (state === 'clear') spriteSrc = this.sprites.happy;
        if (state === 'out_of_hearts') spriteSrc = this.sprites.sad_sitting;

        this.imgElements.forEach(img => {{
            if (img) img.src = spriteSrc;
        }});

        const containers = document.querySelectorAll('.mascot-avatar-container');
        containers.forEach(container => {{
            container.classList.remove('mascot-bounce', 'mascot-wobble', 'mascot-cheer', 'mascot-float');
            if (state === 'happy' || state === 'clear') {{
                container.classList.add('mascot-cheer');
            }} else if (state === 'wrong' || state === 'sad') {{
                container.classList.add('mascot-wobble');
            }} else if (state === 'thinking') {{
                container.classList.add('mascot-bounce');
            }} else {{
                container.classList.add('mascot-float');
            }}
        }});

        if (customQuote) {{
            this.say(customQuote);
        }} else if (this.quotes[state]) {{
            this.sayRandom(state);
        }}

        if (state !== 'idle' && state !== 'out_of_hearts' && duration > 0) {{
            this.resetTimer = setTimeout(() => {{
                this.setState('idle');
            }}, duration);
        }}
    }}
    say(text) {{
        this.bubbleElements.forEach(el => {{
            if (el) el.textContent = text;
        }});
        document.querySelectorAll('.speech-bubble-sync').forEach(bubble => {{
            bubble.classList.remove('bubble-pop');
            void bubble.offsetWidth;
            bubble.classList.add('bubble-pop');
        }});
    }}
    sayRandom(category) {{
        const list = this.quotes[category] || this.quotes.idle;
        const text = list[Math.floor(Math.random() * list.length)];
        this.say(text);
    }}
    onMascotTapped() {{
        if (window.soundManager) window.soundManager.playClick();
        this.setState('happy', '에헤헤~ 간지러워요! 루루가 곁에서 응원할게요! 💖', 3000);
        if (window.particleSystem) {{
            window.particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.35, 12);
        }}
    }}
}}
window.MascotManager = MascotManager;
"""
write_file('js/mascot-manager.js', mascot_code)

# 4. game-economy.js with Roadmap Stage Tracking!
write_file('js/game-economy.js', """/**
 * Kawaii Game Economy & Stage Roadmap State Manager
 */
class GameEconomy {
    constructor() {
        this.STORAGE_KEY = 'kawaii_sudoku_princess_v2';
        
        // Define all roadmap stages
        this.stageDefinitions = {
            // World 1: 4x4 Mini (5 Stages)
            '1-1': { world: 1, size: 4, diff: 'easy', name: '1-1 모찌 딸기 🍓', targetTime: 60, desc: '4x4 초보자 튜토리얼' },
            '1-2': { world: 1, size: 4, diff: 'easy', name: '1-2 달콤 바닐라 🍦', targetTime: 75, desc: '4x4 달콤한 입문' },
            '1-3': { world: 1, size: 4, diff: 'easy', name: '1-3 슈크림 언덕 🧁', targetTime: 90, desc: '4x4 첫 번째 관문' },
            '1-4': { world: 1, size: 4, diff: 'easy', name: '1-4 마카롱 가든 🍬', targetTime: 90, desc: '4x4 디저트 파티' },
            '1-5': { world: 1, size: 4, diff: 'easy', name: '1-5 아기새의 성 👑', targetTime: 90, desc: '4x4 월드 1 마스터!' },
            
            // World 2: 6x6 Sakura (6 Stages)
            '2-1': { world: 2, size: 6, diff: 'easy', name: '2-1 벚꽃 오솔길 🌸', targetTime: 120, desc: '6x6 2x3 블록 적응기' },
            '2-2': { world: 2, size: 6, diff: 'easy', name: '2-2 체리 블라썸 🍒', targetTime: 140, desc: '6x6 향긋한 꽃잎' },
            '2-3': { world: 2, size: 6, diff: 'easy', name: '2-3 무지개 폭포 🌈', targetTime: 150, desc: '6x6 시원한 두뇌 회전' },
            '2-4': { world: 2, size: 6, diff: 'normal', name: '2-4 별빛 반딧불 🌟', targetTime: 160, desc: '6x6 살짝 더 깊은 생각' },
            '2-5': { world: 2, size: 6, diff: 'normal', name: '2-5 핑크 로즈 가든 🌹', targetTime: 180, desc: '6x6 정원 미로 탈출' },
            '2-6': { world: 2, size: 6, diff: 'normal', name: '2-6 날개의 수호자 🪽', targetTime: 180, desc: '6x6 월드 2 마스터!' },
            
            // World 3: 9x9 Crystal Princess (9 Stages)
            '3-1': { world: 3, size: 9, diff: 'easy', name: '3-1 크리스탈 성문 🏰', targetTime: 240, desc: '9x9 본격 정통 스도쿠' },
            '3-2': { world: 3, size: 9, diff: 'easy', name: '3-2 루비 분수대 💖', targetTime: 270, desc: '9x9 영롱한 루비 마법' },
            '3-3': { world: 3, size: 9, diff: 'easy', name: '3-3 사파이어 회랑 💎', targetTime: 300, desc: '9x9 푸른 보석의 길' },
            '3-4': { world: 3, size: 9, diff: 'normal', name: '3-4 에메랄드 탑 🍀', targetTime: 360, desc: '9x9 미디엄 난이도' },
            '3-5': { world: 3, size: 9, diff: 'normal', name: '3-5 자수정 왕좌 👑', targetTime: 400, desc: '9x9 보랏빛 왕실 퍼즐' },
            '3-6': { world: 3, size: 9, diff: 'normal', name: '3-6 은하수 무도회 🌌', targetTime: 420, desc: '9x9 찬란한 별들의 춤' },
            '3-7': { world: 3, size: 9, diff: 'hard', name: '3-7 황금 다이아몬드 🏆', targetTime: 480, desc: '9x9 하드 마스터 도전' },
            '3-8': { world: 3, size: 9, diff: 'hard', name: '3-8 티아라의 비밀 🎀', targetTime: 540, desc: '9x9 고난이도 마법' },
            '3-9': { world: 3, size: 9, diff: 'hard', name: '3-9 프린세스 여왕 👑✨', targetTime: 600, desc: '9x9 전설의 그랜드 엔딩' }
        };

        this.stageOrder = Object.keys(this.stageDefinitions);

        this.state = {
            currentStageId: '1-1',
            clearedStages: {}, // { '1-1': { stars: 3, bestTime: 45 }, ... }
            unlockedStages: ['1-1'],
            totalStars: 0,
            gems: 100,
            hearts: 5,
            lastHeartDate: '',
            dailyGemPurchases: 0,
            dailyAdHeartViews: 0,
            lastAttendanceDate: '',
            soundEnabled: true
        };

        this.loadState();
        this.checkMidnightReset();
    }

    loadState() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.state = { ...this.state, ...JSON.parse(data) };
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }

    saveState() {
        try {
            this.recalculateTotalStars();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    recalculateTotalStars() {
        let stars = 0;
        for (const stageId in this.state.clearedStages) {
            stars += this.state.clearedStages[stageId].stars || 0;
        }
        this.state.totalStars = stars;
    }

    getTodayString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    checkMidnightReset() {
        const today = this.getTodayString();
        let changed = false;
        if (this.state.lastHeartDate !== today) {
            this.state.hearts = 5;
            this.state.dailyGemPurchases = 0;
            this.state.dailyAdHeartViews = 0;
            this.state.lastHeartDate = today;
            changed = true;
        }
        if (this.state.lastAttendanceDate !== today) {
            this.hasDailyReward = true;
        } else {
            this.hasDailyReward = false;
        }
        if (changed) this.saveState();
    }

    claimDailyReward() {
        const today = this.getTodayString();
        if (this.state.lastAttendanceDate !== today) {
            this.state.lastAttendanceDate = today;
            this.state.gems += 25;
            this.saveState();
            return 25;
        }
        return 0;
    }

    getTimeUntilMidnight() {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const diffMs = midnight - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // 초보자 심리적 배려: Stage 1-1 ~ 2-5까지는 하트 소모 없이 무제한 플레이 지원!
    isFreePassStage(stageId) {
        const freeStages = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5'];
        return freeStages.includes(stageId);
    }

    consumeHeart(stageId = null) {
        this.checkMidnightReset();
        if (stageId && this.isFreePassStage(stageId)) {
            return true; // 프리패스 구간: 하트 차감 없음!
        }
        if (this.state.hearts > 0) {
            this.state.hearts -= 1;
            this.saveState();
            return true;
        }
        return false;
    }

    buyHeartWithGems() {
        this.checkMidnightReset();
        if (this.state.dailyGemPurchases >= 2) {
            return { success: false, reason: 'limit_reached' };
        }
        if (this.state.gems < 50) {
            return { success: false, reason: 'not_enough_gems' };
        }
        this.state.gems -= 50;
        this.state.hearts += 1;
        this.state.dailyGemPurchases += 1;
        this.saveState();
        return { success: true, hearts: this.state.hearts };
    }

    grantAdHeart() {
        this.checkMidnightReset();
        if (this.state.dailyAdHeartViews >= 2) {
            return { success: false, reason: 'limit_reached' };
        }
        this.state.hearts += 1;
        this.state.dailyAdHeartViews += 1;

        this.saveState();
        return { success: true, hearts: this.state.hearts };
    }

    // Complete Stage & Unlock Next
    completeStage(stageId, elapsedSeconds, mistakes) {
        const def = this.stageDefinitions[stageId];
        let stars = 3;
        if (elapsedSeconds > def.targetTime) stars -= 1;
        if (mistakes > 0) stars -= 1;
        if (stars < 1) stars = 1;

        // Reward gems
        let rewardGems = def.size === 4 ? 10 : (def.size === 6 ? 20 : 35);
        if (stars === 3) rewardGems += 10;
        this.state.gems += rewardGems;

        // Record clear
        const existing = this.state.clearedStages[stageId];
        const bestStars = existing ? Math.max(existing.stars, stars) : stars;
        const bestTime = existing ? Math.min(existing.bestTime, elapsedSeconds) : elapsedSeconds;
        this.state.clearedStages[stageId] = { stars: bestStars, bestTime };

        // Unlock next stage
        const currIdx = this.stageOrder.indexOf(stageId);
        let nextStageId = null;
        if (currIdx !== -1 && currIdx < this.stageOrder.length - 1) {
            nextStageId = this.stageOrder[currIdx + 1];
            if (!this.state.unlockedStages.includes(nextStageId)) {
                this.state.unlockedStages.push(nextStageId);
            }
            this.state.currentStageId = nextStageId;
        }

        this.saveState();
        return { stars, rewardGems, nextStageId };
    }
}
window.GameEconomy = GameEconomy;
""")

# 5. admob-manager.js
write_file('js/admob-manager.js', """/**
 * Google AdMob Manager & Rewarded Simulator
 */
class AdMobManager {
    constructor() {
        this.modal = document.getElementById('ad-modal');
        this.videoTimerText = document.getElementById('ad-timer-text');
        this.videoProgress = document.getElementById('ad-progress-bar');
        this.closeBtn = document.getElementById('ad-close-btn');
        this.rewardBadge = document.getElementById('ad-reward-badge');
        this.adTitle = document.getElementById('ad-title');
        this.onRewardCallback = null;
        this.timer = null;
        this.init();
    }
    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeAdModal());
        }
    }
    showRewardedVideo(rewardType, onRewarded) {
        this.onRewardCallback = onRewarded;
        let timeLeft = 5;
        if (this.adTitle) {
            this.adTitle.textContent = rewardType === 'hint' ? '🎬 리워드 광고 - 힌트 1개 충전' : '🎬 리워드 광고 - 보너스 하트 1개 충전';
        }
        if (this.rewardBadge) this.rewardBadge.style.display = 'none';
        if (this.closeBtn) this.closeBtn.style.display = 'none';
        if (this.videoProgress) this.videoProgress.style.width = '0%';
        if (this.videoTimerText) this.videoTimerText.textContent = `${timeLeft}초 후 보상 지급`;
        if (this.modal) this.modal.classList.add('active');

        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            timeLeft -= 1;
            const pct = ((5 - timeLeft) / 5) * 100;
            if (this.videoProgress) this.videoProgress.style.width = `${pct}%`;
            if (timeLeft > 0) {
                if (this.videoTimerText) this.videoTimerText.textContent = `${timeLeft}초 후 보상 지급`;
            } else {
                clearInterval(this.timer);
                if (this.videoTimerText) this.videoTimerText.textContent = '🎉 광고 시청 완료!';
                if (this.rewardBadge) this.rewardBadge.style.display = 'block';
                if (this.closeBtn) this.closeBtn.style.display = 'block';
                if (window.soundManager) window.soundManager.playGem();
                if (window.particleSystem) window.particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 16);
                if (typeof this.onRewardCallback === 'function') this.onRewardCallback();
            }
        }, 1000);
    }
    closeAdModal() {
        if (this.timer) clearInterval(this.timer);
        if (this.modal) this.modal.classList.remove('active');
    }
}
window.AdMobManager = AdMobManager;
""")

# 6. app.js with Lobby <-> Game Navigation, Pause Modal, Stage Launch & Ingame Engine!
write_file('js/app.js', """/**
 * Kawaii Sudoku Princess - Main Game Application Controller
 * Handles Screen Transitions (Lobby <-> Game), Pause Modal, Stage Roadmap, and Game Loop!
 */
document.addEventListener('DOMContentLoaded', () => {
    window.soundManager = new SoundManager();
    window.particleSystem = new ParticleSystem('sakura-bg-canvas', 'fx-canvas');
    window.mascotManager = new MascotManager();
    window.economy = new GameEconomy();
    window.adMobManager = new AdMobManager();
    window.sudokuEngine = new SudokuEngine();

    // Screen Elements
    const screenLobby = document.getElementById('screen-lobby');
    const screenGame = document.getElementById('screen-game');
    
    // Header Stats Elements
    const heartsCountElems = document.querySelectorAll('.hearts-count-val');
    const heartTimerElems = document.querySelectorAll('.heart-timer-val');
    const gemsCountElems = document.querySelectorAll('.gems-count-val');
    const totalStarsElem = document.getElementById('total-stars-val');
    const soundBtns = document.querySelectorAll('.btn-sound-toggle');

    // In-game Elements
    const gridElement = document.getElementById('sudoku-grid');
    const numpadElement = document.getElementById('numpad-bar');
    const ingameStageName = document.getElementById('ingame-stage-name');
    const timerText = document.getElementById('timer-text');
    const timerBox = document.getElementById('timer-box');
    const mistakesText = document.getElementById('mistakes-count');
    const hintBadge = document.getElementById('hint-badge');
    const noteBtn = document.getElementById('btn-note');

    // Modals
    const pauseModal = document.getElementById('pause-modal');
    const stageLaunchModal = document.getElementById('stage-launch-modal');
    const clearModal = document.getElementById('clear-modal');
    const outOfHeartsModal = document.getElementById('out-of-hearts-modal');
    const dailyRewardModal = document.getElementById('daily-reward-modal');

    // Ingame State
    let currentStageId = '1-1';
    let currentStageDef = null;
    let puzzleData = null;
    let currentBoard = [];
    let initialBoard = [];
    let solutionBoard = [];
    let notesBoard = [];
    let moveHistory = [];
    let selectedCell = null;
    let isNoteMode = false;
    let freeHintsRemaining = 2;
    let mistakes = 0;
    const MAX_MISTAKES = 3;
    let timerInterval = null;
    let elapsedSeconds = 0;
    let isPaused = false;

    // 1. Update Global Header Stats
    function updateHeaderStats() {
        economy.checkMidnightReset();
        heartsCountElems.forEach(el => { el.textContent = economy.state.hearts; });
        heartTimerElems.forEach(el => { el.textContent = economy.getTimeUntilMidnight(); });
        gemsCountElems.forEach(el => { el.textContent = economy.state.gems; });
        if (totalStarsElem) totalStarsElem.textContent = `${economy.state.totalStars}/60`;
    }

    setInterval(() => {
        heartTimerElems.forEach(el => { el.textContent = economy.getTimeUntilMidnight(); });
    }, 1000);

    // 2. Navigation: Switch between Lobby and Game screens
    function showScreen(screenName) {
        if (screenName === 'lobby') {
            if (timerInterval) clearInterval(timerInterval);
            screenGame.classList.remove('active');
            screenLobby.classList.add('active');
            renderRoadmap();
            mascotManager.setState('idle', '어느 스테이지를 모험해볼까요? 🌸');
        } else if (screenName === 'game') {
            screenLobby.classList.remove('active');
            screenGame.classList.add('active');
        }
        updateHeaderStats();
    }

    // 3. Render Stage Roadmap on Lobby Screen
    function renderRoadmap() {
        const roadmapContainer = document.getElementById('roadmap-stages-list');
        if (!roadmapContainer) return;
        roadmapContainer.innerHTML = '';

        // Free Pass Welcome Banner
        const welcomeBanner = document.createElement('div');
        welcomeBanner.className = 'welcome-freepass-banner';
        welcomeBanner.innerHTML = '🎁 <strong>초보자 웰컴 혜택</strong>: <strong>Stage 2-5</strong>까지 하트 소모 없이 무제한 플레이 가능해요! 💖';
        roadmapContainer.appendChild(welcomeBanner);

        let currentWorld = 0;
        const worldNames = {
            1: '🍓 WORLD 1 : 모찌 디저트 동산 (4x4 미니)',
            2: '🌸 WORLD 2 : 벚꽃 숲의 오솔길 (6x6 스도쿠)',
            3: '💎 WORLD 3 : 크리스탈 프린세스 캐슬 (9x9 정통)'
        };

        economy.stageOrder.forEach((stageId, idx) => {
            const def = economy.stageDefinitions[stageId];
            const isUnlocked = economy.state.unlockedStages.includes(stageId);
            const clearData = economy.state.clearedStages[stageId];
            const isCurrent = economy.state.currentStageId === stageId;
            const isFree = economy.isFreePassStage(stageId);

            // Insert World Header
            if (def.world !== currentWorld) {
                currentWorld = def.world;
                const worldHeader = document.createElement('div');
                worldHeader.className = 'world-divider-badge';
                worldHeader.textContent = worldNames[currentWorld];
                roadmapContainer.appendChild(worldHeader);
            }

            // Create Stage Node Card
            const node = document.createElement('div');
            node.className = `roadmap-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current-active' : ''} ${clearData ? 'cleared' : ''}`;
            
            // S-curve alternating alignment for candy road effect
            const alignClass = idx % 3 === 0 ? 'align-left' : (idx % 3 === 1 ? 'align-center' : 'align-right');
            node.classList.add(alignClass);

            let starsHtml = '';
            const starsCount = clearData ? clearData.stars : 0;
            for (let s = 1; s <= 3; s++) {
                starsHtml += `<span class="star-icon ${s <= starsCount ? 'earned' : 'empty'}">★</span>`;
            }

            node.innerHTML = `
                ${isCurrent ? '<div class="cur-mascot-marker"><span class="marker-speech">여기야! 💖</span><span class="marker-owl">🦉</span></div>' : ''}
                <div class="node-circle">
                    ${isUnlocked ? (clearData ? '✓' : idx + 1) : '🔒'}
                </div>
                <div class="node-details">
                    <div class="node-title">${def.name} ${isFree ? '<span class="freepass-tag">무료✨</span>' : ''}</div>
                    <div class="node-stars">${starsHtml}</div>
                </div>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    soundManager.playStageStart();
                    openStageLaunchModal(stageId);
                });
            } else {
                node.addEventListener('click', () => {
                    soundManager.playWrong();
                    mascotManager.setState('sad', '이전 스테이지를 먼저 클리어해야 열려요! 🔒', 2500);
                });
            }

            roadmapContainer.appendChild(node);
        });
    }

    // 4. Stage Launch Modal
    function openStageLaunchModal(stageId) {
        const def = economy.stageDefinitions[stageId];
        currentStageId = stageId;
        currentStageDef = def;
        const isFree = economy.isFreePassStage(stageId);

        const startBtn = document.getElementById('btn-confirm-start-stage');
        const descElem = document.getElementById('launch-stage-desc');

        document.getElementById('launch-stage-title').textContent = def.name;
        if (isFree) {
            startBtn.innerHTML = '✨ 프리패스로 바로 시작 (하트 0개) 💖';
            descElem.innerHTML = `${def.desc} <br><span style="color:#E25072; font-weight:900; font-size:0.85rem;">🎁 2-5 스테이지까지 하트 소모 없이 무제한 도전!</span>`;
        } else {
            startBtn.innerHTML = '💖 하트 1개로 시작하기';
            descElem.textContent = `${def.desc} (목표 시간: ${Math.floor(def.targetTime / 60)}분 ${def.targetTime % 60}초)`;
        }
        
        const clearData = economy.state.clearedStages[stageId];
        let starsText = '기록 없음 (★ 0개)';
        if (clearData) {
            starsText = `최고 기록: ★ ${clearData.stars}개 (${Math.floor(clearData.bestTime / 60)}분 ${clearData.bestTime % 60}초)`;
        }
        document.getElementById('launch-best-record').textContent = starsText;

        stageLaunchModal.classList.add('active');
    }

    // Start Stage from Modal
    document.getElementById('btn-confirm-start-stage').addEventListener('click', () => {
        stageLaunchModal.classList.remove('active');
        launchGame(currentStageId);
    });
    document.getElementById('btn-cancel-start-stage').addEventListener('click', () => {
        stageLaunchModal.classList.remove('active');
    });

    // Quick Play Button from Lobby
    document.getElementById('btn-quick-play').addEventListener('click', () => {
        soundManager.playStageStart();
        let targetStage = economy.state.currentStageId || '1-1';
        openStageLaunchModal(targetStage);
    });

    // 5. Ingame Launch & Sudoku Board Generation
    function launchGame(stageId) {
        currentStageId = stageId;
        currentStageDef = economy.stageDefinitions[stageId];
        const isFree = economy.isFreePassStage(stageId);

        // Check Hearts if not free pass stage
        if (!isFree && economy.state.hearts <= 0) {
            showOutOfHeartsModal();
            return;
        }

        economy.consumeHeart(stageId);
        updateHeaderStats();


        // Switch to Game Screen
        showScreen('game');

        ingameStageName.textContent = currentStageDef.name;
        freeHintsRemaining = 2;
        mistakes = 0;
        moveHistory = [];
        selectedCell = null;
        isNoteMode = false;
        isPaused = false;
        if (noteBtn) noteBtn.classList.remove('active');

        // Generate Puzzle
        puzzleData = sudokuEngine.generatePuzzle(currentStageDef.size, currentStageDef.diff);
        currentBoard = puzzleData.puzzle.map(row => [...row]);
        initialBoard = puzzleData.initialBoard.map(row => [...row]);
        solutionBoard = puzzleData.solution.map(row => [...row]);

        notesBoard = Array.from({ length: currentStageDef.size }, () =>
            Array.from({ length: currentStageDef.size }, () => new Set())
        );

        // Start Timer
        elapsedSeconds = 0;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer();

        renderGrid();
        renderNumpad();
        updateHeaderStats();

        mascotManager.setState('idle', `화이팅! ${currentStageDef.name} 시작이에요! 🌸`);
    }

    // 6. Ingame Timer
    function updateTimer() {
        if (isPaused) return;
        elapsedSeconds++;
        const mins = Math.floor(elapsedSeconds / 60);
        const secs = elapsedSeconds % 60;
        timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (elapsedSeconds <= currentStageDef.targetTime) {
            timerBox.classList.add('time-bonus');
        } else {
            timerBox.classList.remove('time-bonus');
        }
    }

    // 7. Pause & Resume System
    function pauseGame() {
        isPaused = true;
        soundManager.playClick();
        mascotManager.setState('thinking', '잠시 쉬어가요! 커피 한 잔 어때요? ☕');
        pauseModal.classList.add('active');
    }

    function resumeGame() {
        isPaused = false;
        soundManager.playClick();
        pauseModal.classList.remove('active');
        mascotManager.setState('idle', '다시 집중해봐요! 🌸');
    }

    document.getElementById('btn-ingame-pause').addEventListener('click', pauseGame);
    document.getElementById('btn-ingame-back').addEventListener('click', pauseGame);
    document.getElementById('btn-resume-game').addEventListener('click', resumeGame);

    document.getElementById('btn-restart-game').addEventListener('click', () => {
        pauseModal.classList.remove('active');
        launchGame(currentStageId);
    });

    document.getElementById('btn-exit-to-lobby').addEventListener('click', () => {
        pauseModal.classList.remove('active');
        showScreen('lobby');
    });

    // 8. Render Sudoku Grid
    function renderGrid() {
        const size = currentStageDef.size;
        gridElement.className = `sudoku-grid size-${size}`;
        gridElement.innerHTML = '';

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                const val = currentBoard[r][c];
                const isGiven = initialBoard[r][c] !== 0;

                if (isGiven) {
                    cell.classList.add('given');
                    cell.textContent = val;
                } else if (val !== 0) {
                    cell.textContent = val;
                    if (val !== solutionBoard[r][c]) {
                        cell.classList.add('error');
                    }
                } else {
                    const notes = notesBoard[r][c];
                    if (notes.size > 0) {
                        const notesContainer = document.createElement('div');
                        notesContainer.className = 'cell-notes';
                        for (let n = 1; n <= size; n++) {
                            const noteNum = document.createElement('div');
                            noteNum.className = 'note-num';
                            if (notes.has(n)) noteNum.textContent = n;
                            notesContainer.appendChild(noteNum);
                        }
                        cell.appendChild(notesContainer);
                    }
                }
                cell.addEventListener('click', () => onCellClicked(r, c));
                gridElement.appendChild(cell);
            }
        }
        updateGridHighlights();
    }

    function onCellClicked(r, c) {
        soundManager.playClick();
        selectedCell = { r, c };
        updateGridHighlights();
        mascotManager.setState('thinking', '음... 여기에 어떤 숫자가 들어갈까요? 💭');
    }

    function updateGridHighlights() {
        const cells = gridElement.querySelectorAll('.sudoku-cell');
        const selectedVal = selectedCell ? currentBoard[selectedCell.r][selectedCell.c] : null;
        const config = sudokuEngine.getConfig(currentStageDef.size);

        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            cell.classList.remove('selected', 'highlighted', 'same-number');
            if (!selectedCell) return;

            if (r === selectedCell.r && c === selectedCell.c) {
                cell.classList.add('selected');
            }
            const sameRow = r === selectedCell.r;
            const sameCol = c === selectedCell.c;
            const sameBox = Math.floor(r / config.boxRows) === Math.floor(selectedCell.r / config.boxRows) &&
                            Math.floor(c / config.boxCols) === Math.floor(selectedCell.c / config.boxCols);

            if (sameRow || sameCol || sameBox) {
                cell.classList.add('highlighted');
            }
            const val = currentBoard[r][c];
            if (selectedVal && val !== 0 && val === selectedVal) {
                cell.classList.add('same-number');
            }
        });
    }

    // 9. Render Number Pad
    function renderNumpad() {
        const size = currentStageDef.size;
        numpadElement.innerHTML = '';
        const counts = {};
        for (let n = 1; n <= size; n++) counts[n] = 0;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const val = currentBoard[r][c];
                if (val !== 0 && val === solutionBoard[r][c]) {
                    counts[val] = (counts[val] || 0) + 1;
                }
            }
        }

        for (let n = 1; n <= size; n++) {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            const numText = document.createElement('span');
            numText.textContent = n;
            btn.appendChild(numText);

            const remaining = size - (counts[n] || 0);
            const countBadge = document.createElement('span');
            countBadge.className = 'count-badge';
            countBadge.textContent = remaining > 0 ? remaining : '✓';
            btn.appendChild(countBadge);

            if (remaining <= 0) {
                btn.classList.add('completed');
            }
            btn.addEventListener('click', () => onNumberInput(n));
            numpadElement.appendChild(btn);
        }
    }

    // 10. Number Input Action
    function onNumberInput(num) {
        if (!selectedCell || isPaused) return;
        const { r, c } = selectedCell;
        if (initialBoard[r][c] !== 0) return;

        if (isNoteMode) {
            soundManager.playClick();
            const notes = notesBoard[r][c];
            if (notes.has(num)) notes.delete(num);
            else notes.add(num);
            currentBoard[r][c] = 0;
            renderGrid();
            return;
        }

        moveHistory.push({
            r, c,
            prevVal: currentBoard[r][c],
            prevNotes: new Set(notesBoard[r][c])
        });

        notesBoard[r][c].clear();
        currentBoard[r][c] = num;

        if (num === solutionBoard[r][c]) {
            soundManager.playCorrect();
            mascotManager.setState('happy', '와아! 정답이에요! 최고최고! 💖');
            const cellElem = gridElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cellElem) {
                const rect = cellElem.getBoundingClientRect();
                particleSystem.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
            }
            if (sudokuEngine.isBoardComplete(currentBoard, solutionBoard, currentStageDef.size)) {
                handleVictory();
                return;
            }
        } else {
            mistakes++;
            soundManager.playWrong();
            mascotManager.setState('wrong', '앗! 겹치는 숫자가 있어요! 💧');
            updateHeaderStats();
            if (mistakes >= MAX_MISTAKES) {
                if (timerInterval) clearInterval(timerInterval);
                mascotManager.setState('out_of_hearts', '실수가 너무 많았어요... 🥺');
                showOutOfHeartsModal();
                return;
            }
        }
        renderGrid();
        renderNumpad();
    }

    // 11. Undo & Erase Actions
    document.getElementById('btn-undo').addEventListener('click', () => {
        if (moveHistory.length === 0 || isPaused) return;
        soundManager.playClick();
        const lastMove = moveHistory.pop();
        currentBoard[lastMove.r][lastMove.c] = lastMove.prevVal;
        notesBoard[lastMove.r][lastMove.c] = new Set(lastMove.prevNotes);
        renderGrid();
        renderNumpad();
    });

    document.getElementById('btn-erase').addEventListener('click', () => {
        if (!selectedCell || isPaused) return;
        const { r, c } = selectedCell;
        if (initialBoard[r][c] !== 0) return;
        soundManager.playClick();
        moveHistory.push({
            r, c,
            prevVal: currentBoard[r][c],
            prevNotes: new Set(notesBoard[r][c])
        });
        currentBoard[r][c] = 0;
        notesBoard[r][c].clear();
        renderGrid();
        renderNumpad();
    });

    noteBtn.addEventListener('click', () => {
        soundManager.playClick();
        isNoteMode = !isNoteMode;
        noteBtn.classList.toggle('active', isNoteMode);
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
        if (isPaused) return;
        if (freeHintsRemaining > 0) {
            useHint();
            freeHintsRemaining--;
            hintBadge.textContent = freeHintsRemaining > 0 ? freeHintsRemaining : '🎬';
        } else {
            adMobManager.showRewardedVideo('hint', () => {
                freeHintsRemaining += 1;
                hintBadge.textContent = freeHintsRemaining;
                mascotManager.setState('happy', '광고 보상으로 힌트 1개 충전 완료! 🎁');
            });
        }
    });

    function useHint() {
        soundManager.playGem();
        let target = selectedCell && currentBoard[selectedCell.r][selectedCell.c] !== solutionBoard[selectedCell.r][selectedCell.c]
            ? selectedCell
            : null;

        if (!target) {
            const emptyCells = [];
            const size = currentStageDef.size;
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (currentBoard[r][c] !== solutionBoard[r][c]) {
                        emptyCells.push({ r, c });
                    }
                }
            }
            if (emptyCells.length > 0) {
                target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }

        if (target) {
            selectedCell = target;
            currentBoard[target.r][target.c] = solutionBoard[target.r][target.c];
            notesBoard[target.r][target.c].clear();
            const cellElem = gridElement.querySelector(`[data-row="${target.r}"][data-col="${target.c}"]`);
            if (cellElem) {
                const rect = cellElem.getBoundingClientRect();
                particleSystem.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
            }
            mascotManager.setState('happy', '짜잔! 힌트 요정의 마법이에요! ✨');
            renderGrid();
            renderNumpad();
            if (sudokuEngine.isBoardComplete(currentBoard, solutionBoard, currentStageDef.size)) {
                handleVictory();
            }
        }
    }

    // 12. Victory Handler
    function handleVictory() {
        if (timerInterval) clearInterval(timerInterval);
        soundManager.playVictory();
        particleSystem.spawnGemShower(55);

        const result = economy.completeStage(currentStageId, elapsedSeconds, mistakes);
        mascotManager.setState('clear', '축하해요! 스테이지 완벽 클리어예요! 👑💖');

        // Render Stars
        let starsStr = '';
        for (let s = 1; s <= 3; s++) {
            starsStr += s <= result.stars ? '⭐' : '☆';
        }
        document.getElementById('clear-stars-display').textContent = starsStr;
        document.getElementById('clear-time-val').textContent = timerText.textContent;
        document.getElementById('clear-gems-val').textContent = `+${result.rewardGems} 💎`;
        
        clearModal.classList.add('active');

        // Next Stage Action
        const nextBtn = document.getElementById('btn-next-stage');
        if (result.nextStageId) {
            nextBtn.textContent = '다음 스테이지로 💖';
            nextBtn.onclick = () => {
                clearModal.classList.remove('active');
                launchGame(result.nextStageId);
            };
        } else {
            nextBtn.textContent = '로드맵으로 돌아가기 🌸';
            nextBtn.onclick = () => {
                clearModal.classList.remove('active');
                showScreen('lobby');
            };
        }
    }

    document.getElementById('btn-clear-to-map').addEventListener('click', () => {
        clearModal.classList.remove('active');
        showScreen('lobby');
    });

    // 13. Out of Hearts / Shop Modals
    function showOutOfHeartsModal() {
        economy.checkMidnightReset();
        document.getElementById('shop-gems-val').textContent = economy.state.gems;
        document.getElementById('shop-purchases-left').textContent = `오늘 남은 구매: ${2 - economy.state.dailyGemPurchases}/2회`;
        outOfHeartsModal.classList.add('active');
    }

    document.getElementById('btn-buy-heart-gems').addEventListener('click', () => {
        const res = economy.buyHeartWithGems();
        if (res.success) {
            soundManager.playGem();
            updateHeaderStats();
            outOfHeartsModal.classList.remove('active');
            mascotManager.setState('happy', '하트 1개 충전 완료! 신나게 달려봐요! 💖');
            launchGame(currentStageId);
        } else if (res.reason === 'limit_reached') {
            alert('오늘은 보석으로 하트를 더 이상 구매할 수 없어요! (일일 최대 2회 제한)');
        } else {
            alert('보석이 부족해요! 💎');
        }
    });

    document.getElementById('btn-ad-heart').addEventListener('click', () => {
        adMobManager.showRewardedVideo('heart', () => {
            economy.grantAdHeart();
            updateHeaderStats();
            outOfHeartsModal.classList.remove('active');
            mascotManager.setState('happy', '광고 시청 완료! 보너스 게임을 시작해요! 🎬💖');
            launchGame(currentStageId);
        });
    });

    document.getElementById('close-out-modal').addEventListener('click', () => {
        outOfHeartsModal.classList.remove('active');
    });

    // Sound toggle buttons
    soundBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const enabled = soundManager.toggleSound();
            soundBtns.forEach(b => { b.textContent = enabled ? '🔊' : '🔇'; });
        });
    });

    // Daily Attendance
    if (economy.hasDailyReward) {
        document.getElementById('btn-claim-daily').addEventListener('click', () => {
            economy.claimDailyReward();
            soundManager.playGem();
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 20);
            dailyRewardModal.classList.remove('active');
            updateHeaderStats();
            mascotManager.setState('happy', '매일 출석 보너스 25 보석 획득! 🎁✨');
        });
        dailyRewardModal.classList.add('active');
    }

    // 14. Initial App Start
    showScreen('lobby');
});
""")

# 7. css/kawaii-theme.css (Ultra-kawaii pastel pink, jelly 3D buttons, candy road map)
write_file('css/kawaii-theme.css', """/* =========================================================
   Kawaii Sudoku Princess - Ultimate Pastel Pink Design System
   ========================================================= */

@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800;900&family=Nunito:wght@600;700;800;900&display=swap');

:root {
    --primary-pink: #FF8DA1;
    --deep-pink: #FF6584;
    --dark-pink: #D84266;
    --soft-pink: #FFF0F4;
    --pastel-bg: #FFF4F7;
    --card-border: #FFD2DC;
    --accent-purple: #C8B6FF;
    --baby-blue: #BCE7FD;
    --mint: #A8E6CF;
    --gold: #FFD166;
    --text-dark: #563346;
    --text-muted: #8E657B;
    --grid-bg: #FFF9FA;
    --cell-bg: #FFFFFF;
    --cell-border: #FFDCE4;
    --cell-subgrid: #FF7590;
    --cell-selected: #FFE4EC;
    --cell-highlight: #FFF5F7;
    --cell-same-num: #EAE0FF;
    --cell-error: #FFD2D2;
    --cell-given: #543444;
    --cell-user: #FF5A7D;
    --cell-note: #A07F92;
    --shadow-jelly: 0 6px 0 #E25072, 0 10px 20px rgba(255, 101, 132, 0.35);
    --shadow-soft: 0 8px 24px rgba(255, 141, 161, 0.25);
    --shadow-sm: 0 3px 8px rgba(255, 101, 132, 0.18);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
}

body {
    font-family: 'M PLUS Rounded 1c', 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #FFF0F5 0%, #FFE6EE 50%, #FFDCE8 100%);
    color: var(--text-dark);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;
    position: relative;
}

#sakura-bg-canvas, #fx-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
}

#sakura-bg-canvas { z-index: 1; }
#fx-canvas { z-index: 100; }

/* Main App Frame (Mobile Container) */
.app-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 440px;
    height: 100vh;
    max-height: 920px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 3.5px solid var(--card-border);
    border-radius: 38px;
    box-shadow: 0 20px 48px rgba(255, 101, 132, 0.28);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

@media (max-width: 480px) {
    .app-wrapper {
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        border: none;
    }
}

/* Screen Manager */
.app-screen {
    display: none;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
    height: 100%;
}

.app-screen.active {
    display: flex;
}

/* Top App Header Bar */
.header-bar {
    padding: 12px 14px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 2.5px solid var(--card-border);
    gap: 8px;
}

.header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #FFFFFF;
    border: 2.5px solid var(--card-border);
    border-radius: 22px;
    padding: 6px 12px;
    font-size: 0.96rem;
    font-weight: 900;
    box-shadow: 0 4px 10px rgba(255, 101, 132, 0.15);
}

.stat-pill .icon {
    font-size: 1.25rem;
    line-height: 1;
}

.stat-pill.heart-pill {
    border-color: #FFB7C5;
    color: var(--deep-pink);
}

.stat-pill.heart-pill .hearts-count-val {
    font-size: 1.1rem;
    font-weight: 900;
}

.stat-pill .heart-timer-val {
    font-size: 0.76rem;
    color: var(--text-muted);
    font-weight: 800;
    background: #FFF0F4;
    padding: 2px 7px;
    border-radius: 12px;
    border: 1px solid #FFD2DC;
    letter-spacing: -0.2px;
}

.stat-pill.gem-pill {
    border-color: #C8B6FF;
    color: #7B42BC;
}

.stat-pill.gem-pill .gems-count-val {
    font-size: 1.1rem;
    font-weight: 900;
}

.stat-pill.stars-pill {
    border-color: #FFD166;
    color: #D48806;
}

.stat-pill.stars-pill #total-stars-val {
    font-size: 1.05rem;
    font-weight: 900;
}

.icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2.5px solid var(--card-border);
    background: #FFFFFF;
    color: var(--text-dark);
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(255, 101, 132, 0.18);
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-btn:active {
    transform: scale(0.88);
}

/* =========================================================
   1. LOBBY & ROADMAP VIEW STYLING
   ========================================================= */

.lobby-content-scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 12px 14px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.lobby-content-scroll::-webkit-scrollbar {
    width: 6px;
}
.lobby-content-scroll::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 10px;
}

/* Lobby Hero / Greeting Card */
.lobby-hero-card {
    flex-shrink: 0;
    width: 100%;
    min-height: 108px;
    background: linear-gradient(135deg, #FFF0F5 0%, #FFE5EE 100%);
    border: 2.5px solid var(--card-border);
    border-radius: 26px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 4px 12px rgba(255, 101, 132, 0.15);
    position: relative;
    overflow: hidden;
}

.lobby-hero-card::after {
    content: '🌸';
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 4.5rem;
    opacity: 0.15;
    pointer-events: none;
}

.mascot-avatar-container {
    width: 84px;
    height: 84px;
    min-width: 84px;
    min-height: 84px;
    flex-shrink: 0;
    cursor: pointer;
}

.mascot-avatar-container img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(255, 101, 132, 0.35));
}

.hero-text-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.app-title-badge {
    font-size: 1.22rem;
    font-weight: 900;
    color: var(--deep-pink);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.speech-bubble-sync {
    background: #FFFFFF;
    border: 2px solid var(--primary-pink);
    border-radius: 14px;
    padding: 8px 12px;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--text-dark);
    line-height: 1.38;
    position: relative;
    box-shadow: var(--shadow-sm);
    min-height: 42px;
    display: flex;
    align-items: center;
}

/* Quick Play Banner Button */
.btn-quick-play-banner {
    flex-shrink: 0;
    width: 100%;
    min-height: 52px;
    background: linear-gradient(135deg, #FF8DA1 0%, #FF5A7D 100%);
    color: #FFFFFF;
    border: none;
    border-radius: 20px;
    padding: 12px 20px;
    font-size: 1.05rem;
    font-weight: 900;
    box-shadow: var(--shadow-jelly);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-quick-play-banner:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 #E25072;
}

/* Roadmap Winding Path Container */
.roadmap-section {
    flex-shrink: 0;
    width: 100%;
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    border: 2px dashed var(--card-border);
    border-radius: 26px;
    padding: 16px 12px;
}

.welcome-freepass-banner {
    background: linear-gradient(135deg, #FFF0F5 0%, #FFE3EC 100%);
    border: 2px solid #FF8DA1;
    border-radius: 16px;
    padding: 10px 14px;
    font-size: 0.84rem;
    font-weight: 800;
    color: #D84266;
    text-align: center;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(255, 101, 132, 0.15);
    margin-bottom: 12px;
}

.freepass-tag {
    display: inline-block;
    background: linear-gradient(135deg, #FF6584 0%, #FF8DA1 100%);
    color: #FFFFFF;
    font-size: 0.68rem;
    font-weight: 900;
    padding: 2px 6px;
    border-radius: 8px;
    margin-left: 5px;
    vertical-align: middle;
    box-shadow: 0 2px 4px rgba(255, 101, 132, 0.3);
}

.world-divider-badge {
    background: linear-gradient(135deg, #C8B6FF 0%, #FF8DA1 100%);
    color: #FFFFFF;
    font-size: 0.82rem;
    font-weight: 900;
    text-align: center;
    padding: 6px 12px;
    border-radius: 16px;
    box-shadow: 0 3px 0 #9E86E8;
    margin: 12px 0 16px;
}

.roadmap-stages-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
}

/* Stage Node Cards (S-Curve road) */
.roadmap-node {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.roadmap-node.align-left { align-self: flex-start; }
.roadmap-node.align-center { align-self: center; }
.roadmap-node.align-right { align-self: flex-end; }

.roadmap-node:active {
    transform: scale(0.94);
}

.node-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 3.5px solid var(--primary-pink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--deep-pink);
    box-shadow: var(--shadow-jelly);
    position: relative;
    flex-shrink: 0;
}

.roadmap-node.cleared .node-circle {
    background: linear-gradient(135deg, #FF8DA1, #FF5A7D);
    color: #FFFFFF;
    border-color: #FFFFFF;
}

.roadmap-node.locked {
    opacity: 0.5;
    cursor: not-allowed;
}
.roadmap-node.locked .node-circle {
    background: #EFEFEF;
    border-color: #CCC;
    color: #999;
    box-shadow: none;
}

.node-details {
    background: #FFFFFF;
    border: 2px solid var(--card-border);
    border-radius: 16px;
    padding: 6px 12px;
    box-shadow: var(--shadow-sm);
    min-width: 140px;
}

.node-title {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--text-dark);
}

.node-stars {
    display: flex;
    gap: 2px;
    margin-top: 2px;
}

.star-icon {
    font-size: 0.95rem;
    color: #E2E2E2;
}
.star-icon.earned {
    color: #FFD166;
    text-shadow: 0 1px 2px rgba(255, 209, 102, 0.6);
}

/* Mascot Marker on current active stage */
.cur-mascot-marker {
    position: absolute;
    top: -38px;
    left: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: bounceMascot 1s infinite;
    pointer-events: none;
    z-index: 5;
}

.marker-speech {
    background: var(--deep-pink);
    color: #FFFFFF;
    font-size: 0.68rem;
    font-weight: 900;
    padding: 2px 6px;
    border-radius: 8px;
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
}

.marker-owl {
    font-size: 1.2rem;
}

/* =========================================================
   2. INGAME PUZZLE VIEW STYLING
   ========================================================= */

.ingame-top-nav {
    padding: 8px 14px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.stage-title-pill {
    background: linear-gradient(135deg, #FF8DA1, #FF5A7D);
    color: #FFFFFF;
    font-size: 0.82rem;
    font-weight: 900;
    padding: 5px 14px;
    border-radius: 16px;
    box-shadow: 0 3px 0 #D84266;
}

.timer-box {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #FFFFFF;
    border: 2px solid var(--card-border);
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 0.85rem;
    font-weight: 900;
    color: var(--text-dark);
}
.timer-box.time-bonus {
    color: #00A86B;
    border-color: var(--mint);
}

/* Sudoku Board Grid Container */
.board-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
}

.sudoku-grid {
    display: grid;
    background: var(--grid-bg);
    border: 3.5px solid var(--deep-pink);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    aspect-ratio: 1 / 1;
    width: 100%;
    max-width: 360px;
}

.sudoku-grid.size-4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }
.sudoku-grid.size-6 { grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(6, 1fr); }
.sudoku-grid.size-9 { grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr); }

.sudoku-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cell-bg);
    border: 1px solid var(--cell-border);
    font-size: 1.55rem;
    font-weight: 900;
    color: var(--cell-user);
    position: relative;
    cursor: pointer;
    transition: background 0.12s, transform 0.1s;
}

.sudoku-grid.size-6 .sudoku-cell { font-size: 1.3rem; }
.sudoku-grid.size-9 .sudoku-cell { font-size: 1.15rem; }

.sudoku-cell.given { color: var(--cell-given); font-weight: 800; }
.sudoku-cell.selected { background: var(--cell-selected) !important; box-shadow: inset 0 0 0 2.5px var(--deep-pink); }
.sudoku-cell.highlighted { background: var(--cell-highlight); }
.sudoku-cell.same-number { background: var(--cell-same-num) !important; }
.sudoku-cell.error { background: var(--cell-error) !important; color: #E63946 !important; }

/* Subgrid Borders */
.sudoku-grid.size-4 .sudoku-cell:nth-child(2n) { border-right: 2.5px solid var(--deep-pink); }
.sudoku-grid.size-4 .sudoku-cell:nth-child(n+5):nth-child(-n+8) { border-bottom: 2.5px solid var(--deep-pink); }

.sudoku-grid.size-6 .sudoku-cell:nth-child(3n) { border-right: 2.5px solid var(--deep-pink); }
.sudoku-grid.size-6 .sudoku-cell:nth-child(n+7):nth-child(-n+12),
.sudoku-grid.size-6 .sudoku-cell:nth-child(n+19):nth-child(-n+24),
.sudoku-grid.size-6 .sudoku-cell:nth-child(n+31):nth-child(-n+36) { border-bottom: 2.5px solid var(--deep-pink); }

.sudoku-grid.size-9 .sudoku-cell:nth-child(3n) { border-right: 2px solid var(--deep-pink); }
.sudoku-grid.size-9 .sudoku-cell:nth-child(n+19):nth-child(-n+27),
.sudoku-grid.size-9 .sudoku-cell:nth-child(n+46):nth-child(-n+54) { border-bottom: 2px solid var(--deep-pink); }

/* Candidate Notes */
.cell-notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    padding: 2px;
    pointer-events: none;
}
.note-num {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.58rem;
    font-weight: 700;
    color: var(--cell-note);
}

/* Ingame Controls Bar */
.controls-bar {
    display: flex;
    justify-content: space-around;
    padding: 4px 16px 2px;
}

.control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-dark);
}

.control-btn .circle-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2.5px solid var(--card-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: var(--shadow-sm);
    position: relative;
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.control-btn.active .circle-icon {
    background: var(--deep-pink);
    color: #FFFFFF;
    border-color: var(--deep-pink);
}

.control-btn:active .circle-icon { transform: scale(0.9); }
.control-btn .label { font-size: 0.72rem; font-weight: 800; color: var(--text-muted); }
.control-btn .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--deep-pink);
    color: #FFFFFF;
    font-size: 0.65rem;
    font-weight: 900;
    padding: 1px 5px;
    border-radius: 10px;
    border: 2px solid #FFFFFF;
}

/* Number Pad Bar */
.numpad-bar {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 4px 12px 8px;
}

.num-btn {
    flex: 1;
    max-width: 44px;
    height: 48px;
    background: #FFFFFF;
    border: 2.5px solid var(--primary-pink);
    border-radius: 14px;
    font-size: 1.35rem;
    font-weight: 900;
    color: var(--deep-pink);
    box-shadow: var(--shadow-jelly);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.num-btn .count-badge {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-top: -2px;
}

.num-btn:active { transform: scale(0.92); background: var(--soft-pink); }
.num-btn.completed { opacity: 0.35; pointer-events: none; background: #F0F0F0; border-color: #DDD; }

/* AdMob Banner Container */
.admob-banner-container {
    width: 100%;
    height: 52px;
    background: #FAFAFA;
    border-top: 1.5px solid #F0E0E6;
    display: flex;
    align-items: center;
    justify-content: center;
}

.admob-test-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 320px;
    height: 48px;
    background: #FFFFFF;
    border: 1px dashed #FFB7C5;
    border-radius: 8px;
    padding: 0 10px;
}

.admob-badge {
    font-size: 0.6rem;
    font-weight: 800;
    color: #888;
    background: #EEEEEE;
    padding: 2px 4px;
    border-radius: 4px;
}

.admob-content-preview {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-dark);
}
""")

# 8. css/animations.css
write_file('css/animations.css', """/* Animations */
@keyframes floatMascot {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-6px) rotate(1.5deg); }
}
@keyframes bounceMascot {
    0%, 100% { transform: translateY(0) scale(1); }
    30% { transform: translateY(-10px) scale(1.05); }
    60% { transform: translateY(2px) scale(0.95); }
}
@keyframes cheerMascot {
    0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
    25% { transform: translateY(-14px) scale(1.12) rotate(-4deg); }
    50% { transform: translateY(-18px) scale(1.15) rotate(4deg); }
    75% { transform: translateY(-8px) scale(1.08) rotate(-2deg); }
}
@keyframes wobbleMascot {
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-8deg) translateX(-4px); }
    40% { transform: rotate(8deg) translateX(4px); }
    60% { transform: rotate(-6deg) translateX(-2px); }
    80% { transform: rotate(6deg) translateX(2px); }
}
@keyframes popIn {
    0% { transform: scale(0.7); opacity: 0; }
    70% { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
}

.mascot-float { animation: floatMascot 3s ease-in-out infinite; }
.mascot-bounce { animation: bounceMascot 1s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
.mascot-cheer { animation: cheerMascot 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 2; }
.mascot-wobble { animation: wobbleMascot 0.6s ease-in-out; }
.bubble-pop { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
""")

# 9. css/modals.css
write_file('css/modals.css', """/* Modals */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(45, 25, 35, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    padding: 16px;
}
.modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}
.modal-card {
    background: #FFFFFF;
    border: 3.5px solid var(--card-border);
    border-radius: 30px;
    width: 100%;
    max-width: 360px;
    padding: 22px 18px;
    box-shadow: 0 16px 40px rgba(255, 101, 132, 0.35);
    text-align: center;
    transform: scale(0.85);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
}
.modal-overlay.active .modal-card { transform: scale(1); }

.modal-header-img {
    width: 88px;
    height: 88px;
    margin: -10px auto 8px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 6px 12px rgba(255, 101, 132, 0.35));
}
.modal-title {
    font-size: 1.3rem;
    font-weight: 900;
    color: var(--deep-pink);
    margin-bottom: 6px;
}
.modal-subtitle {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: 14px;
    line-height: 1.4;
}

.clear-stars {
    font-size: 2.2rem;
    color: #FFD166;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(255, 209, 102, 0.5);
}
.clear-stats-box {
    background: var(--soft-pink);
    border-radius: 16px;
    padding: 12px;
    display: flex;
    justify-content: space-around;
    margin-bottom: 14px;
}
.clear-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.clear-stat-item .val { font-size: 1.15rem; font-weight: 900; color: var(--deep-pink); }
.clear-stat-item .lbl { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }

.btn-primary {
    width: 100%;
    background: linear-gradient(135deg, var(--primary-pink), var(--deep-pink));
    color: #FFFFFF;
    border: none;
    border-radius: 18px;
    padding: 12px 18px;
    font-size: 1rem;
    font-weight: 900;
    box-shadow: 0 4px 0 #D84266;
    cursor: pointer;
    transition: transform 0.15s;
    margin-bottom: 8px;
}
.btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 0 #D84266; }

.btn-secondary {
    width: 100%;
    background: #FFFFFF;
    color: var(--text-dark);
    border: 2px solid var(--card-border);
    border-radius: 18px;
    padding: 10px 16px;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s;
}
.btn-ad {
    background: linear-gradient(135deg, #A066FF, #7B42BC);
    box-shadow: 0 4px 0 #5E2A99;
}

.ad-video-screen {
    width: 100%;
    height: 170px;
    background: linear-gradient(135deg, #FFE8F0 0%, #E8D7FF 100%);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin-bottom: 12px;
    border: 2px solid var(--primary-pink);
}
.ad-video-screen img {
    width: 75px;
    height: 75px;
    object-fit: contain;
    animation: cheerMascot 1.2s infinite;
}
.ad-progress-track {
    width: 90%;
    height: 8px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
}
.ad-progress-fill {
    height: 100%;
    width: 0%;
    background: var(--deep-pink);
    transition: width 0.3s linear;
}
.ad-timer-label {
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-dark);
    margin-top: 6px;
}
""")

# 10. index.html with Lobby, Roadmap, Ingame View, Pause Modal, and Base64 Mascot Sprites!
write_file('index.html', f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>핑크 스도쿠 프린세스 🌸 - Kawaii Sudoku Princess</title>
    <link rel="stylesheet" href="css/kawaii-theme.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/modals.css">
    <link rel="icon" href="{MASCOT_SPRITES['idle']}">
</head>
<body>
    <!-- Background Sakura & Particle Canvases -->
    <canvas id="sakura-bg-canvas"></canvas>
    <canvas id="fx-canvas"></canvas>

    <div class="app-wrapper">
        
        <!-- =========================================================
             SCREEN 1: LOBBY & STAGE ROADMAP (메인 홈 & 로드맵 화면)
             ========================================================= -->
        <div class="app-screen" id="screen-lobby">
            <!-- Lobby Header -->
            <header class="header-bar">
                <div class="header-left">
                    <div class="stat-pill heart-pill">
                        <span>💖</span>
                        <span class="hearts-count-val">5</span>
                        <span class="heart-timer-val">23:59:59</span>
                    </div>
                    <div class="stat-pill gem-pill">
                        <span>💎</span>
                        <span class="gems-count-val">100</span>
                    </div>
                </div>
                <div class="header-right">
                    <div class="stat-pill stars-pill">
                        <span>⭐</span>
                        <span id="total-stars-val">0/60</span>
                    </div>
                    <button class="icon-btn btn-sound-toggle" title="소리 켜기/끄기">🔊</button>
                </div>
            </header>

            <!-- Lobby Content Scrollable Area -->
            <main class="lobby-content-scroll">
                <!-- Mascot Greeting Card -->
                <div class="lobby-hero-card">
                    <div class="mascot-avatar-container mascot-float mascot-tap-trigger" title="루루를 터치해보세요!">
                        <img class="mascot-img-sync" src="{MASCOT_SPRITES['idle']}" alt="Princess Lulu">
                    </div>
                    <div class="hero-text-col">
                        <div class="app-title-badge">🌸 핑크 스도쿠 프린세스 👑</div>
                        <div class="speech-bubble-sync bubble-pop">
                            <span class="mascot-speech-sync">오늘도 루루와 함께 힐링 스도쿠해요! 🌸</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Play Button -->
                <button class="btn-quick-play-banner" id="btn-quick-play">
                    <span>🎮 바로 플레이 / 이어하기</span>
                    <span>✨</span>
                </button>

                <!-- Winding Stage Roadmap Section -->
                <div class="roadmap-section">
                    <div class="roadmap-stages-list" id="roadmap-stages-list">
                        <!-- Dynamic Stage Nodes (1-1 ~ 3-9) injected by JS -->
                    </div>
                </div>
            </main>

            <!-- Bottom AdMob Banner -->
            <footer class="admob-banner-container">
                <div class="admob-test-banner">
                    <span class="admob-badge">Google AdMob</span>
                    <span class="admob-content-preview">🌸 달콤한 디저트 카페 이벤트 진행 중! 🍰</span>
                </div>
            </footer>
        </div>

        <!-- =========================================================
             SCREEN 2: IN-GAME PUZZLE PLAY (스도쿠 퍼즐 인게임 화면)
             ========================================================= -->
        <div class="app-screen" id="screen-game">
            <!-- Ingame Header -->
            <header class="header-bar">
                <div class="header-left">
                    <button class="icon-btn" id="btn-ingame-back" title="로드맵으로 돌아가기">🏠</button>
                    <button class="icon-btn" id="btn-ingame-pause" title="일시정지">⏸️</button>
                    <div class="stage-title-pill" id="ingame-stage-name">1-1 모찌 딸기 🍓</div>
                </div>
                <div class="header-right">
                    <div class="timer-box" id="timer-box">
                        <span>⏱️</span>
                        <span id="timer-text">00:00</span>
                    </div>
                    <div class="stat-pill heart-pill">
                        <span>💖</span>
                        <span class="hearts-count-val">5</span>
                    </div>
                </div>
            </header>

            <!-- Mascot Reaction Area -->
            <section style="padding: 4px 14px; display:flex; align-items:center; gap:10px;">
                <div class="mascot-avatar-container mascot-float mascot-tap-trigger" style="width:56px; height:56px;">
                    <img class="mascot-img-sync" src="{MASCOT_SPRITES['idle']}" alt="Lulu Ingame">
                </div>
                <div style="flex:1;">
                    <div class="speech-bubble-sync bubble-pop" style="font-size:0.76rem; padding:4px 8px;">
                        <span class="mascot-speech-sync">차근차근 풀어나가요! 🍀</span>
                    </div>
                </div>
                <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted);">
                    실수: <span id="mistakes-count">0/3</span>
                </div>
            </section>

            <!-- Sudoku Grid Container -->
            <main class="board-container">
                <div class="sudoku-grid size-4" id="sudoku-grid">
                    <!-- Sudoku Cells injected by JS -->
                </div>
            </main>

            <!-- Ingame Controls Bar -->
            <section class="controls-bar">
                <button class="control-btn" id="btn-undo">
                    <div class="circle-icon">↩️</div>
                    <span class="label">실행취소</span>
                </button>
                <button class="control-btn" id="btn-erase">
                    <div class="circle-icon">🧹</div>
                    <span class="label">지우개</span>
                </button>
                <button class="control-btn" id="btn-note">
                    <div class="circle-icon">✏️</div>
                    <span class="label">메모</span>
                </button>
                <button class="control-btn" id="btn-hint">
                    <div class="circle-icon">
                        💡
                        <span class="badge" id="hint-badge">2</span>
                    </div>
                    <span class="label">힌트</span>
                </button>
            </section>

            <!-- Number Pad -->
            <section class="numpad-bar" id="numpad-bar">
                <!-- Digits injected by JS -->
            </section>

            <!-- Bottom AdMob Banner -->
            <footer class="admob-banner-container">
                <div class="admob-test-banner">
                    <span class="admob-badge">Google AdMob</span>
                    <span class="admob-content-preview">🌸 루루와 함께하는 달콤한 퍼즐 모험! 🎀</span>
                </div>
            </footer>
        </div>

    </div>

    <!-- =========================================================
         MODALS (일시정지, 스테이지 시작, 클리어, 출석, 상점, 광고)
         ========================================================= -->

    <!-- 1. Pause Modal (일시정지 모달) -->
    <div class="modal-overlay" id="pause-modal">
        <div class="modal-card">
            <img class="modal-header-img" src="{MASCOT_SPRITES['thinking']}" alt="Pause Mascot">
            <h2 class="modal-title">잠시 쉬어가요 ☕</h2>
            <p class="modal-subtitle">루루가 따뜻한 차를 준비했어요!<br>언제든 준비되면 다시 도전해요.</p>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="btn-primary" id="btn-resume-game">계속하기 💖</button>
                <button class="btn-secondary" id="btn-restart-game">다시 시작 🔄</button>
                <button class="btn-secondary" id="btn-exit-to-lobby">스테이지 지도로 나가기 🏠</button>
            </div>
        </div>
    </div>

    <!-- 2. Stage Launch Modal (스테이지 진입 모달) -->
    <div class="modal-overlay" id="stage-launch-modal">
        <div class="modal-card">
            <img class="modal-header-img" src="{MASCOT_SPRITES['happy']}" alt="Stage Mascot">
            <h2 class="modal-title" id="launch-stage-title">1-1 모찌 딸기 🍓</h2>
            <p class="modal-subtitle" id="launch-stage-desc">4x4 초보자 튜토리얼 (목표: 1분 00초)</p>
            <div style="background:var(--soft-pink); border-radius:14px; padding:10px; font-size:0.8rem; font-weight:800; color:var(--deep-pink); margin-bottom:14px;" id="launch-best-record">
                최고 기록: ★★★ (00:45)
            </div>
            <button class="btn-primary" id="btn-confirm-start-stage">💖 하트 1개로 시작하기</button>
            <button class="btn-secondary" id="btn-cancel-start-stage">닫기</button>
        </div>
    </div>

    <!-- 3. Stage Clear / Victory Modal -->
    <div class="modal-overlay" id="clear-modal">
        <div class="modal-card">
            <img class="modal-header-img" src="{MASCOT_SPRITES['happy']}" alt="Clear Mascot">
            <div class="clear-stars" id="clear-stars-display">⭐⭐⭐</div>
            <h2 class="modal-title">STAGE CLEAR! 🎉</h2>
            <p class="modal-subtitle">대단해요! 완벽하게 퍼즐을 완성했어요!</p>
            
            <div class="clear-stats-box">
                <div class="clear-stat-item">
                    <span class="val" id="clear-time-val">00:45</span>
                    <span class="lbl">클리어 시간</span>
                </div>
                <div class="clear-stat-item">
                    <span class="val" id="clear-gems-val">+20 💎</span>
                    <span class="lbl">보석 획득</span>
                </div>
            </div>

            <button class="btn-primary" id="btn-next-stage">다음 스테이지로 💖</button>
            <button class="btn-secondary" id="btn-clear-to-map">스테이지 지도로 나가기 🌸</button>
        </div>
    </div>

    <!-- 4. Out of Hearts / Shop Modal -->
    <div class="modal-overlay" id="out-of-hearts-modal">
        <div class="modal-card">
            <img class="modal-header-img" src="{MASCOT_SPRITES['sad_sitting']}" alt="Sad Mascot">
            <h2 class="modal-title">하트가 부족해요 🥺</h2>
            <p class="modal-subtitle">매일 자정(00:00)에 5개의 하트가 자동 충전돼요!<br>보석이나 광고로 바로 이어할 수 있어요.</p>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                <button class="btn-primary" id="btn-buy-heart-gems">💎 50 보석으로 하트 1개 충전<div style="font-size:0.75rem; font-weight:700;" id="shop-purchases-left">오늘 남은 구매: 2/2회</div></button>
                <button class="btn-primary btn-ad" id="btn-ad-heart">🎬 광고 보고 마지막 1게임 더 하기 (매일 2회)</button>
                <button class="btn-secondary" id="close-out-modal">내일 다시 오기 🌸</button>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">현재 보유 보석: <span id="shop-gems-val">100</span> 💎</div>
        </div>
    </div>

    <!-- 5. Daily Attendance Reward Modal -->
    <div class="modal-overlay" id="daily-reward-modal">
        <div class="modal-card">
            <img class="modal-header-img" src="{MASCOT_SPRITES['happy']}" alt="Reward Mascot">
            <h2 class="modal-title">매일 출석 보상 🎁</h2>
            <p class="modal-subtitle">오늘도 방문해주셔서 고마워요!<br>루루가 준비한 영롱한 보석 선물이에요!</p>
            <div style="font-size:2rem; font-weight:900; color:#7B42BC; margin-bottom:16px;">+25 💎</div>
            <button class="btn-primary" id="btn-claim-daily">보석 받기 💖</button>
        </div>
    </div>

    <!-- 6. Google AdMob Rewarded Video Player Simulator -->
    <div class="modal-overlay" id="ad-modal">
        <div class="modal-card">
            <h3 class="modal-title" id="ad-title" style="font-size:1.1rem;">🎬 리워드 광고</h3>
            <div class="ad-video-screen">
                <img src="{MASCOT_SPRITES['happy']}" alt="Ad Mascot">
                <div style="font-weight:900; font-size:0.95rem; color:#5A3D4C; margin-top:6px;">Princess Bakery Cafe 🍰</div>
                <div class="ad-progress-track"><div class="ad-progress-fill" id="ad-progress-bar"></div></div>
                <div class="ad-timer-label" id="ad-timer-text">5초 후 보상 지급</div>
            </div>
            <div id="ad-reward-badge" style="display:none; color:#00A86B; font-weight:900; font-size:0.9rem; margin-bottom:10px;">✨ 보상이 정상 지급되었습니다!</div>
            <button class="btn-primary" id="ad-close-btn" style="display:none;">닫기 (X)</button>
        </div>
    </div>

    <!-- Core Scripts -->
    <script src="js/sudoku-engine.js"></script>
    <script src="js/sound-manager.js"></script>
    <script src="js/particle-system.js"></script>
    <script src="js/mascot-manager.js"></script>
    <script src="js/game-economy.js"></script>
    <script src="js/admob-manager.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
""")

print('V2 GENERATION COMPLETE WITH EMBEDDED BASE64 AND FULL ROADMAP!')

