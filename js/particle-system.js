/**
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
