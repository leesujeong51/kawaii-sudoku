/**
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
