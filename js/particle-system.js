/**
 * Kawaii Particle System - Sakura breeze, sparkling hearts, Fireworks, Confetti & Gem Shower!
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
        this.woodShavings = [];
        this.confetti = [];
        this.fireworks = [];
        this.woodShavings = [];
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

    clearFX() {
        this.fxParticles = [];
        this.confetti = [];
        this.gems = [];
        this.woodShavings = [];
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

    // 1. Sparkling In-game Pops
    spawnSparkles(x, y, count = 16) {
        const colors = ['#FF8DA1', '#FF6B8B', '#FFD166', '#A8E6CF', '#BCE7FD', '#FF9EAA', '#E8D7FF', '#FFDF00'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
            const speed = Math.random() * 5 + 3;
            const isHeart = Math.random() > 0.45;
            this.fxParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: isHeart ? Math.random() * 9 + 8 : Math.random() * 8 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                decay: Math.random() * 0.025 + 0.02,
                type: isHeart ? 'heart' : 'star',
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.12
            });
        }
    }

    spawnTileBurst(x, y, color = '#FF69B4') {
        const count = 18;
        const colors = [color, '#FFD700', '#FFFFFF', '#FF8DA1', '#A8E6CF'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const speed = Math.random() * 4.5 + 2.5;
            this.fxParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                decay: Math.random() * 0.035 + 0.025,
                type: Math.random() > 0.4 ? 'star' : 'heart',
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.25
            });
        }
    }

    // 2. Full-Screen Fireworks Show (Safe Capped Bursts)
    spawnFireworks(burstCount = 2) {
        const safeCount = Math.min(3, Math.max(1, burstCount));
        const w = window.innerWidth;
        const h = window.innerHeight;
        const colors = ['#FF4D80', '#00E5FF', '#FFD700', '#A066FF', '#00E676', '#FF85A1', '#FFF'];

        for (let b = 0; b < safeCount; b++) {
            setTimeout(() => {
                const targetX = Math.random() * (w * 0.7) + (w * 0.15);
                const targetY = Math.random() * (h * 0.4) + (h * 0.15);
                const sparkCount = 30;
                const burstColor = colors[Math.floor(Math.random() * colors.length)];

                for (let i = 0; i < sparkCount; i++) {
                    const angle = (Math.PI * 2 / sparkCount) * i;
                    const speed = Math.random() * 5.0 + 2.0;
                    this.fxParticles.push({
                        x: targetX,
                        y: targetY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: Math.random() * 6 + 3,
                        color: Math.random() > 0.3 ? burstColor : '#FFFFFF',
                        opacity: 1,
                        decay: Math.random() * 0.025 + 0.018,
                        type: 'star',
                        rot: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.2
                    });
                }
            }, b * 180);
        }
    }

    // 3. Massive Confetti & Streamers Cannon
    spawnMassiveConfetti(count = 80) {
        const w = window.innerWidth;
        const colors = ['#FF6584', '#38BDF8', '#FFD166', '#A855F7', '#34D399', '#FB7185', '#F472B6'];

        for (let i = 0; i < count; i++) {
            this.confetti.push({
                x: Math.random() * w,
                y: -20 - Math.random() * 100,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3.5 + 2.5,
                width: Math.random() * 12 + 8,
                height: Math.random() * 7 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.08,
                flip: Math.random() * Math.PI,
                flipSpeed: Math.random() * 0.08 + 0.04,
                opacity: 1
            });
        }
    }

    // 4. Gem & Diamond Shower
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
                size: Math.random() * 16 + 12,
                color: gemColors[Math.floor(Math.random() * gemColors.length)],
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.09,
                bounce: 0.55 + Math.random() * 0.2,
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


    // 6. Hyper-realistic Swirling Wooden Shavings & Star Debris Plume
    spawnWoodShavings(x, y, count = 35) {
        const woodColors = ['#D4A373', '#C68B59', '#FAEDCD', '#E9C46A', '#8B5A2B', '#DEAB7A', '#F4A261'];
        const starColors = ['#FFD166', '#FFE8A1', '#E0A96D', '#FFF3B0'];

        for (let i = 0; i < count; i++) {
            // Ejection plume forming a semi-arched plume across the grid
            const angle = -Math.PI / 2 + (Math.random() - 0.4) * 1.6; // semi-upward plume
            const speed = Math.random() * 8 + 3.5;
            const rType = Math.random();
            let pType = 'curl';
            if (rType < 0.3) pType = 'star_debris';
            else if (rType < 0.6) pType = 'dust';

            this.woodShavings.push({
                x, y,
                vx: Math.cos(angle) * speed + (Math.random() - 0.2) * 2,
                vy: Math.sin(angle) * speed - Math.random() * 4,
                gravity: 0.2,
                drag: 0.985,
                swirlAmp: Math.random() * 1.5 + 0.5,
                swirlFreq: Math.random() * 0.15 + 0.05,
                swirlTime: Math.random() * 10,
                type: pType,
                color: pType === 'star_debris' ? starColors[Math.floor(Math.random() * starColors.length)] : woodColors[Math.floor(Math.random() * woodColors.length)],
                size: pType === 'curl' ? Math.random() * 10 + 6 : (pType === 'star_debris' ? Math.random() * 8 + 6 : Math.random() * 3 + 2),
                curlAngle: Math.random() * Math.PI * 2,
                curlSpeed: (Math.random() - 0.5) * 0.15,
                curlRadius: Math.random() * 6 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.12,
                opacity: 1,
                decay: Math.random() * 0.016 + 0.012
            });
        }
    }

    animate() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Background Sakura
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

        // Foreground FX
        if (this.fxCtx && this.fxCanvas) {
            this.fxCtx.clearRect(0, 0, w, h);

            // Particles / Sparkles
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

            // Confetti
            for (let i = this.confetti.length - 1; i >= 0; i--) {
                const c = this.confetti[i];
                c.x += c.vx;
                c.y += c.vy;
                c.rotation += c.rotSpeed;
                c.flip += c.flipSpeed;
                if (c.y > h + 30) { this.confetti.splice(i, 1); continue; }

                this.fxCtx.save();
                this.fxCtx.translate(c.x, c.y);
                this.fxCtx.rotate(c.rotation);
                this.fxCtx.scale(Math.cos(c.flip), 1);
                this.fxCtx.fillStyle = c.color;
                this.fxCtx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
                this.fxCtx.restore();
            }

            // Wooden Shavings & Star Debris
            for (let i = this.woodShavings.length - 1; i >= 0; i--) {
                const s = this.woodShavings[i];
                s.swirlTime += s.swirlFreq;
                s.vx += Math.sin(s.swirlTime) * s.swirlAmp * 0.1;
                s.vy += s.gravity;
                s.vx *= s.drag;
                s.vy *= s.drag;
                s.x += s.vx;
                s.y += s.vy;
                s.rotation += s.rotSpeed;
                s.curlAngle += s.curlSpeed;
                s.opacity -= s.decay;

                if (s.opacity <= 0 || s.y > h + 40) {
                    this.woodShavings.splice(i, 1);
                    continue;
                }

                this.fxCtx.save();
                this.fxCtx.globalAlpha = Math.max(0, s.opacity);
                this.fxCtx.translate(s.x, s.y);
                this.fxCtx.rotate(s.rotation);

                if (s.type === 'curl') {
                    // Hyper-realistic curled wooden shaving strip
                    this.fxCtx.strokeStyle = s.color;
                    this.fxCtx.lineWidth = Math.max(1.5, s.size * 0.3);
                    this.fxCtx.lineCap = 'round';
                    this.fxCtx.beginPath();
                    this.fxCtx.arc(0, 0, s.curlRadius, s.curlAngle, s.curlAngle + Math.PI * 1.35, false);
                    this.fxCtx.stroke();
                } else if (s.type === 'star_debris') {
                    // Carved wooden star debris
                    this.drawStar(this.fxCtx, 0, 0, s.size, s.color, s.opacity, 0);
                } else {
                    // Fine wood dust
                    this.fxCtx.fillStyle = s.color;
                    this.fxCtx.beginPath();
                    this.fxCtx.arc(0, 0, s.size, 0, Math.PI * 2);
                    this.fxCtx.fill();
                }

                this.fxCtx.restore();
            }

            // Gems
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
