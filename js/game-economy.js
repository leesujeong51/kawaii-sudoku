/**
 * Kawaii Multi-Game Economy & Progression State Manager
 * Manages Sudoku, SumLink, and Word Hunter (단어 스펠링 찾기)
 */
class GameEconomy {
    constructor() {
        this.STORAGE_KEY = 'kawaii_brain_hub_v3';

        this.sudokuStages = {
            '1-1': { world: 1, size: 4, diff: 'easy', name: '1-1 모찌 딸기 🍓', targetTime: 60, desc: '4x4 초보자 튜토리얼' },
            '1-2': { world: 1, size: 4, diff: 'easy', name: '1-2 달콤 바닐라 🍦', targetTime: 75, desc: '4x4 달콤한 입문' },
            '1-3': { world: 1, size: 4, diff: 'easy', name: '1-3 슈크림 언덕 🧁', targetTime: 90, desc: '4x4 첫 번째 관문' },
            '1-4': { world: 1, size: 4, diff: 'easy', name: '1-4 마카롱 가든 🍬', targetTime: 90, desc: '4x4 디저트 파티' },
            '1-5': { world: 1, size: 4, diff: 'easy', name: '1-5 아기새의 성 👑', targetTime: 90, desc: '4x4 월드 1 마스터!' },
            '2-1': { world: 2, size: 6, diff: 'easy', name: '2-1 벚꽃 오솔길 🌸', targetTime: 120, desc: '6x6 2x3 블록 적응기' },
            '2-2': { world: 2, size: 6, diff: 'easy', name: '2-2 체리 블라썸 🍒', targetTime: 140, desc: '6x6 향긋한 꽃잎' },
            '2-3': { world: 2, size: 6, diff: 'easy', name: '2-3 무지개 폭포 🌈', targetTime: 150, desc: '6x6 시원한 두뇌 회전' },
            '2-4': { world: 2, size: 6, diff: 'normal', name: '2-4 별빛 반딧불 🌟', targetTime: 160, desc: '6x6 살짝 더 깊은 생각' },
            '2-5': { world: 2, size: 6, diff: 'normal', name: '2-5 핑크 로즈 가든 🌹', targetTime: 180, desc: '6x6 정원 미로 탈출' },
            '2-6': { world: 2, size: 6, diff: 'normal', name: '2-6 날개의 수호자 🪽', targetTime: 180, desc: '6x6 월드 2 마스터!' },
            // 완만한 난이도 곡선: 9x9 진입 후 easy 4판 → normal 4판 → 마지막 1판만 hard
            '3-1': { world: 3, size: 9, diff: 'easy', name: '3-1 크리스탈 성문 🏰', targetTime: 360, desc: '9x9 본격 정통 스도쿠' },
            '3-2': { world: 3, size: 9, diff: 'easy', name: '3-2 루비 분수대 💖', targetTime: 360, desc: '9x9 영롱한 루비 마법' },
            '3-3': { world: 3, size: 9, diff: 'easy', name: '3-3 사파이어 회랑 💎', targetTime: 380, desc: '9x9 푸른 보석의 길' },
            '3-4': { world: 3, size: 9, diff: 'easy', name: '3-4 에메랄드 탑 🍀', targetTime: 400, desc: '9x9 자신감 충전' },
            '3-5': { world: 3, size: 9, diff: 'normal', name: '3-5 자수정 왕좌 👑', targetTime: 480, desc: '9x9 보랏빛 왕실 퍼즐' },
            '3-6': { world: 3, size: 9, diff: 'normal', name: '3-6 은하수 무도회 🌌', targetTime: 500, desc: '9x9 찬란한 별들의 춤' },
            '3-7': { world: 3, size: 9, diff: 'normal', name: '3-7 황금 다이아몬드 🏆', targetTime: 520, desc: '9x9 미디엄 마스터' },
            '3-8': { world: 3, size: 9, diff: 'normal', name: '3-8 티아라의 비밀 🎀', targetTime: 560, desc: '9x9 피날레 준비' },
            '3-9': { world: 3, size: 9, diff: 'hard', name: '3-9 프린세스 여왕 👑✨', targetTime: 600, desc: '9x9 전설의 그랜드 엔딩' }
        };
        this.sudokuOrder = Object.keys(this.sudokuStages);

        this.state = {
            gems: 150,
            hearts: 5,
            sumlinkHearts: 3,
            wordhuntHearts: 3,
            lastHeartDate: '',
            dailyGemPurchases: 0,
            dailyAdHeartViews: 0,
            dailyGemPurchases_sumlink: 0,
            dailyAdViews_sumlink: 0,
            dailyGemPurchases_wordhunt: 0,
            dailyAdViews_wordhunt: 0,
            lastAttendanceDate: '',
            soundEnabled: true,

            sudoku: {
                currentStageId: '1-1',
                clearedStages: {},
                unlockedStages: ['1-1'],
                totalStars: 0
            },

            makesum: {
                currentStageId: '1-1',
                clearedStages: {},
                unlockedStages: ['1-1'],
                totalStars: 0,
                items: {
                    adds: 3,
                    hints: 3,
                    bombs: 2,
                    rockets: 2
                }
            },

            wordhunt: {
                currentStageId: '1-1',
                clearedStages: {},
                unlockedStages: ['1-1'],
                totalStars: 0,
                items: {
                    hints: 3,
                    times: 3,
                    bombs: 2,
                    skips: 2
                }
            },

            sichuanHearts: 3,
            dailyGemPurchases_sichuan: 0,
            dailyAdViews_sichuan: 0,

            tetrisHearts: 3,
            dailyGemPurchases_tetris: 0,
            dailyAdViews_tetris: 0,
            tetris: { best: 0, plays: 0 },

            attendanceStreak: 0,

            sichuan: {
                currentStageId: '1-1',
                clearedStages: {},
                unlockedStages: ['1-1'],
                totalStars: 0,
                items: {
                    hints: 3,
                    shuffles: 3,
                    times: 3,
                    bombs: 2
                }
            }
        };

        this.loadState();
        this.checkMidnightReset();
    }

    loadState() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                this.state = {
                    ...this.state,
                    ...parsed,
                    sudoku: { ...this.state.sudoku, ...(parsed.sudoku || {}) },
                    makesum: {
                        ...this.state.makesum,
                        ...(parsed.makesum || {}),
                        items: { ...this.state.makesum.items, ...((parsed.makesum && parsed.makesum.items) || {}) }
                    },
                    wordhunt: {
                        ...this.state.wordhunt,
                        ...(parsed.wordhunt || {}),
                        items: { ...this.state.wordhunt.items, ...((parsed.wordhunt && parsed.wordhunt.items) || {}) }
                    },
                    sichuan: {
                        ...this.state.sichuan,
                        ...(parsed.sichuan || {}),
                        items: { ...this.state.sichuan.items, ...((parsed.sichuan && parsed.sichuan.items) || {}) }
                    },
                    tetris: { ...this.state.tetris, ...(parsed.tetris || {}) }
                };
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
        let sudokuStars = 0;
        for (const id in this.state.sudoku.clearedStages) {
            sudokuStars += this.state.sudoku.clearedStages[id].stars || 0;
        }
        this.state.sudoku.totalStars = sudokuStars;

        let makeSumStars = 0;
        for (const id in this.state.makesum.clearedStages) {
            makeSumStars += this.state.makesum.clearedStages[id].stars || 0;
        }
        this.state.makesum.totalStars = makeSumStars;

        let wordHuntStars = 0;
        for (const id in this.state.wordhunt.clearedStages) {
            wordHuntStars += this.state.wordhunt.clearedStages[id].stars || 0;
        }
        this.state.wordhunt.totalStars = wordHuntStars;

        let sichuanStars = 0;
        for (const id in this.state.sichuan.clearedStages) {
            sichuanStars += this.state.sichuan.clearedStages[id].stars || 0;
        }
        this.state.sichuan.totalStars = sichuanStars;

    }

    get totalHubStars() {
        return (this.state.sudoku.totalStars || 0) + (this.state.makesum.totalStars || 0) + (this.state.wordhunt.totalStars || 0) + (this.state.sichuan.totalStars || 0);
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
            this.state.sumlinkHearts = 3;
            this.state.wordhuntHearts = 3;
            this.state.dailyGemPurchases = 0;
            this.state.dailyAdHeartViews = 0;
            this.state.dailyGemPurchases_sumlink = 0;
            this.state.dailyAdViews_sumlink = 0;
            this.state.dailyGemPurchases_wordhunt = 0;
            this.state.dailyAdViews_wordhunt = 0;
            this.state.sichuanHearts = 3;
            this.state.dailyGemPurchases_sichuan = 0;
            this.state.dailyAdViews_sichuan = 0;
            this.state.tetrisHearts = 3;
            this.state.dailyGemPurchases_tetris = 0;
            this.state.dailyAdViews_tetris = 0;
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

    // 연속 출석 보상: 매일 조금씩 커지고 7일째 대박, 이후 다시 1일차부터 순환
    static get STREAK_REWARDS() { return [25, 30, 35, 40, 50, 60, 120]; }

    getNextStreakDay() {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
        const continued = this.state.lastAttendanceDate === yesterday;
        return continued ? (this.state.attendanceStreak % 7) + 1 : 1;
    }

    getDailyRewardAmount() {
        return GameEconomy.STREAK_REWARDS[this.getNextStreakDay() - 1];
    }

    claimDailyReward() {
        const today = this.getTodayString();
        if (this.state.lastAttendanceDate !== today) {
            const day = this.getNextStreakDay();
            const amount = GameEconomy.STREAK_REWARDS[day - 1];
            this.state.attendanceStreak = day;
            this.state.lastAttendanceDate = today;
            this.state.gems += amount;
            this.hasDailyReward = false;
            this.saveState();
            return amount;
        }
        return 0;
    }

    addGems(amount) {
        this.state.gems += amount;
        this.saveState();
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

    isFreePassStage(gameType, stageId) {
        if (gameType === 'sudoku') {
            const freeStages = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6'];
            return freeStages.includes(stageId);
        }
        return false;
    }

    // gameType -> [하트 키, 보석 구매 키, 광고 시청 키]
    static get HEART_KEYS() {
        return {
            sudoku: ['hearts', 'dailyGemPurchases', 'dailyAdHeartViews'],
            makesum: ['sumlinkHearts', 'dailyGemPurchases_sumlink', 'dailyAdViews_sumlink'],
            wordhunt: ['wordhuntHearts', 'dailyGemPurchases_wordhunt', 'dailyAdViews_wordhunt'],
            sichuan: ['sichuanHearts', 'dailyGemPurchases_sichuan', 'dailyAdViews_sichuan'],
            tetris: ['tetrisHearts', 'dailyGemPurchases_tetris', 'dailyAdViews_tetris']
        };
    }

    // 무료 횟수를 다 쓴 뒤 '광고 보고 1판 더'를 하루 몇 번까지 허용할지
    static get DAILY_AD_PLAY_LIMIT() { return 10; }

    heartKeys(gameType) {
        return GameEconomy.HEART_KEYS[gameType] || GameEconomy.HEART_KEYS.sudoku;
    }

    getHearts(gameType) {
        return this.state[this.heartKeys(gameType)[0]] || 0;
    }

    adPlaysLeft(gameType) {
        return Math.max(0, GameEconomy.DAILY_AD_PLAY_LIMIT - (this.state[this.heartKeys(gameType)[2]] || 0));
    }

    consumeHeart(gameType, stageId) {
        this.checkMidnightReset();
        if (this.isFreePassStage(gameType, stageId)) {
            return true;
        }
        const [heartKey] = this.heartKeys(gameType);
        if (this.state[heartKey] > 0) {
            this.state[heartKey] -= 1;
            this.saveState();
            return true;
        }
        return false;
    }

    buyHeartWithGems(gameType = 'sudoku') {
        this.checkMidnightReset();
        const [heartKey, purchaseKey] = this.heartKeys(gameType);
        if (this.state[purchaseKey] >= 2) return { success: false, reason: 'limit_reached' };
        if (this.state.gems < 50) return { success: false, reason: 'not_enough_gems' };

        this.state.gems -= 50;
        this.state[purchaseKey] += 1;
        this.state[heartKey] += 1;
        this.saveState();
        return { success: true };
    }

    grantAdHeart(gameType = 'sudoku') {
        this.checkMidnightReset();
        const [heartKey, , adKey] = this.heartKeys(gameType);
        if ((this.state[adKey] || 0) >= GameEconomy.DAILY_AD_PLAY_LIMIT) return { success: false, reason: 'limit_reached' };

        this.state[adKey] = (this.state[adKey] || 0) + 1;
        this.state[heartKey] += 1;
        this.saveState();
        return { success: true };
    }

    completeSudokuStage(stageId, elapsedSeconds, mistakes) {
        const def = this.sudokuStages[stageId];
        let stars = 3;
        if (elapsedSeconds > def.targetTime) stars -= 1;
        if (mistakes > 0) stars -= 1;
        if (stars < 1) stars = 1;

        let rewardGems = def.size === 4 ? 10 : (def.size === 6 ? 20 : 35);
        if (stars === 3) rewardGems += 10;
        this.state.gems += rewardGems;

        const existing = this.state.sudoku.clearedStages[stageId];
        const bestStars = existing ? Math.max(existing.stars, stars) : stars;
        const bestTime = existing && existing.bestTime ? Math.min(existing.bestTime, elapsedSeconds) : elapsedSeconds;
        this.state.sudoku.clearedStages[stageId] = { stars: bestStars, bestTime };

        const currIdx = this.sudokuOrder.indexOf(stageId);
        let nextStageId = null;
        if (currIdx !== -1 && currIdx < this.sudokuOrder.length - 1) {
            nextStageId = this.sudokuOrder[currIdx + 1];
            if (!this.state.sudoku.unlockedStages.includes(nextStageId)) {
                this.state.sudoku.unlockedStages.push(nextStageId);
            }
            this.state.sudoku.currentStageId = nextStageId;
        }

        this.saveState();
        return { stars, rewardGems, nextStageId, elapsedSeconds };
    }

    completeMakeSumStage(stageId, score, elapsedSeconds, stageOrder) {
        let stars = 3;
        if (score < 1500) stars = 2;
        if (score < 800) stars = 1;

        let rewardGems = 25;
        if (stars === 3) rewardGems += 15;
        this.state.gems += rewardGems;

        const existing = this.state.makesum.clearedStages[stageId];
        const bestStars = existing ? Math.max(existing.stars, stars) : stars;
        const bestScore = existing ? Math.max(existing.score || 0, score) : score;
        const bestTime = existing && existing.bestTime ? Math.min(existing.bestTime, elapsedSeconds) : elapsedSeconds;
        this.state.makesum.clearedStages[stageId] = { stars: bestStars, score: bestScore, bestTime };

        const currIdx = stageOrder.indexOf(stageId);
        let nextStageId = null;
        if (currIdx !== -1 && currIdx < stageOrder.length - 1) {
            nextStageId = stageOrder[currIdx + 1];
            if (!this.state.makesum.unlockedStages.includes(nextStageId)) {
                this.state.makesum.unlockedStages.push(nextStageId);
            }
            this.state.makesum.currentStageId = nextStageId;
        }

        this.saveState();
        return { stars, rewardGems, nextStageId, elapsedSeconds };
    }

    completeWordHuntStage(stageId, score, elapsedSeconds, stageOrder) {
        let stars = 3;
        if (score < 1200) stars = 2;
        if (score < 600) stars = 1;

        let rewardGems = 25;
        if (stars === 3) rewardGems += 15;
        this.state.gems += rewardGems;

        const existing = this.state.wordhunt.clearedStages[stageId];
        const bestStars = existing ? Math.max(existing.stars, stars) : stars;
        const bestScore = existing ? Math.max(existing.score || 0, score) : score;
        const bestTime = existing && existing.bestTime ? Math.min(existing.bestTime, elapsedSeconds) : elapsedSeconds;
        this.state.wordhunt.clearedStages[stageId] = { stars: bestStars, score: bestScore, bestTime };

        const currIdx = stageOrder.indexOf(stageId);
        let nextStageId = null;
        if (currIdx !== -1 && currIdx < stageOrder.length - 1) {
            nextStageId = stageOrder[currIdx + 1];
            if (!this.state.wordhunt.unlockedStages.includes(nextStageId)) {
                this.state.wordhunt.unlockedStages.push(nextStageId);
            }
            this.state.wordhunt.currentStageId = nextStageId;
        }

        this.saveState();
        return { stars, rewardGems, nextStageId, elapsedSeconds };
    }

    useWordHuntItem(itemType) {
        if (this.state.wordhunt.items[itemType] > 0) {
            this.state.wordhunt.items[itemType] -= 1;
            this.saveState();
            return { success: true, usedGems: false };
        }
        return { success: false, reason: 'zero_items' };
    }

    buyAndUseWordHuntItem(itemType) {
        if (this.state.gems >= 20) {
            this.state.gems -= 20;
            this.saveState();
            return { success: true, usedGems: true };
        }
        return { success: false, reason: 'not_enough_gems' };
    }

    useMakeSumItem(itemType) {
        if (this.state.makesum.items[itemType] > 0) {
            this.state.makesum.items[itemType] -= 1;
            this.saveState();
            return { success: true, usedGems: false };
        }
        return { success: false, reason: 'zero_items' };
    }

    buyAndUseMakeSumItem(itemType) {
        if (this.state.gems >= 20) {
            this.state.gems -= 20;
            this.saveState();
            return { success: true, usedGems: true };
        }
        return { success: false, reason: 'not_enough_gems' };
    }

    completeSichuanStage(stageId, score, elapsedSeconds, stageOrder = []) {
        const prev = this.state.sichuan.clearedStages[stageId];
        
        // 별은 스테이지 목표 점수 기준 (예전엔 3000/5000 고정이라 초반 스테이지는 3별 불가능했음)
        const def = (window.sichuanEngine && window.sichuanEngine.stagesConfig[stageId]) || { targetScore: 3000 };
        let stars = 1;
        if (score >= def.targetScore * 0.8) stars = 2;
        if (score >= def.targetScore) stars = 3;

        let rewardGems = 0;
        if (!prev) {
            rewardGems = stars === 3 ? 30 : (stars === 2 ? 20 : 15);
        } else if (stars > prev.stars) {
            rewardGems = (stars - prev.stars) * 10;
        } else {
            rewardGems = 5;
        }

        this.state.gems += rewardGems;

        this.state.sichuan.clearedStages[stageId] = {
            stars: Math.max(stars, prev ? prev.stars : 0),
            score: Math.max(score, prev ? prev.score : 0),
            bestTime: prev ? Math.min(elapsedSeconds, prev.bestTime) : elapsedSeconds,
            clearedAt: new Date().toISOString()
        };

        const curIdx = stageOrder.indexOf(stageId);
        let nextStageId = null;
        if (curIdx !== -1 && curIdx < stageOrder.length - 1) {
            nextStageId = stageOrder[curIdx + 1];
            if (!this.state.sichuan.unlockedStages.includes(nextStageId)) {
                this.state.sichuan.unlockedStages.push(nextStageId);
            }
            this.state.sichuan.currentStageId = nextStageId;
        }

        this.saveState();
        return { stars, rewardGems, nextStageId };
    }

    useSichuanItem(itemType) {
        if (this.state.sichuan.items[itemType] > 0) {
            this.state.sichuan.items[itemType] -= 1;
            this.saveState();
            return { success: true, remaining: this.state.sichuan.items[itemType] };
        }
        return { success: false, reason: 'insufficient_items' };
    }

    buyAndUseSichuanItem(itemType) {
        if (this.state.gems >= 20) {
            this.state.gems -= 20;
            this.saveState();
            return { success: true, remaining: this.state.sichuan.items[itemType] };
        }
        return { success: false, reason: 'insufficient_gems' };
    }

    completeTetrisGame(score) {
        const t = this.state.tetris;
        const isNewBest = score > (t.best || 0);
        if (isNewBest) t.best = score;
        t.plays = (t.plays || 0) + 1;
        // 점수 비례 보석 + 신기록 보너스 (빈손으로 끝나는 판이 없도록 최소 3개)
        const rewardGems = Math.max(3, Math.min(60, Math.floor(score / 100))) + (isNewBest && score > 0 ? 15 : 0);
        this.state.gems += rewardGems;
        this.saveState();
        return { isNewBest, best: t.best, rewardGems };
    }

}
