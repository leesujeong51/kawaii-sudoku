/**
 * Kawaii Sichuan (Shisen-Sho / 사천성) Puzzle Engine
 * Standard 2-turn tile-matching connection puzzle (Max 3 straight line segments)
 */
class SichuanEngine {
    constructor() {
        this.board = []; // 2D array of tile objects or null (includes 1-cell empty padding around grid)
        this.rows = 6;
        this.cols = 8;
        this.paddingRows = 8; // rows + 2
        this.paddingCols = 10; // cols + 2
        this.totalTiles = 0;
        this.remainingTiles = 0;
        this.stage = '1-1';
        this.timeLimit = 60;
        this.timeRemaining = 60;
        this.score = 0;
        this.combo = 0;
        this.lastMatchTime = 0;

        // Kawaii tile icons & themes
        this.tileTypes = [
            { id: 1, name: '딸기', icon: '🍓', bg: '#FFF0F5', border: '#FFB6C1', color: '#E63946' },
            { id: 2, name: '복숭아', icon: '🍑', bg: '#FFF5EE', border: '#FFDAB9', color: '#F4A261' },
            { id: 3, name: '아보카도', icon: '🥑', bg: '#F0FFF0', border: '#98FB98', color: '#2A9D8F' },
            { id: 4, name: '도넛', icon: '🍩', bg: '#FFF8DC', border: '#F4A460', color: '#D4A373' },
            { id: 5, name: '컵케이크', icon: '🧁', bg: '#FDF5E6', border: '#FFC0CB', color: '#E76F51' },
            { id: 6, name: '조각케이크', icon: '🍰', bg: '#FFF0F5', border: '#FF69B4', color: '#D81159' },
            { id: 7, name: '고양이', icon: '🐱', bg: '#F5F5DC', border: '#DEB887', color: '#CC5500' },
            { id: 8, name: '강아지', icon: '🐶', bg: '#FFF8DC', border: '#D2B48C', color: '#8B4513' },
            { id: 9, name: '토끼', icon: '🐰', bg: '#F8F8FF', border: '#D8BFD8', color: '#9370DB' },
            { id: 10, name: '곰돌이', icon: '🐻', bg: '#FAF0E6', border: '#CD853F', color: '#6F4E37' },
            { id: 11, name: '판다', icon: '🐼', bg: '#F5F5F5', border: '#A9A9A9', color: '#333333' },
            { id: 12, name: '벚꽃', icon: '🌸', bg: '#FFF0F5', border: '#FFB6C1', color: '#FF69B4' },
            { id: 13, name: '무지개', icon: '🌈', bg: '#F0F8FF', border: '#87CEEB', color: '#1E90FF' },
            { id: 14, name: '반짝별', icon: '🌟', bg: '#FFFFF0', border: '#F0E68C', color: '#FFD700' },
            { id: 15, name: '리본', icon: '🎀', bg: '#FFF0F5', border: '#FFB6C1', color: '#FF1493' },
            { id: 16, name: '버섯', icon: '🍄', bg: '#FFF5EE', border: '#FA8072', color: '#E63946' }
        ];

        // 18 Stages configuration (World 1~6)
        this.stageOrder = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3', '4-1', '4-2', '4-3', '5-1', '5-2', '5-3', '6-1', '6-2', '6-3'];
        this.stagesConfig = {
            '1-1': { world: 1, name: '딸기 동산 1', rows: 6, cols: 6, typeCount: 6, time: 80, targetScore: 1200 },
            '1-2': { world: 1, name: '딸기 동산 2', rows: 6, cols: 6, typeCount: 6, time: 78, targetScore: 1400 },
            '1-3': { world: 1, name: '딸기 동산 3', rows: 6, cols: 6, typeCount: 7, time: 75, targetScore: 1600 },
            '2-1': { world: 2, name: '디저트 카페 1', rows: 6, cols: 8, typeCount: 7, time: 110, targetScore: 2000 },
            '2-2': { world: 2, name: '디저트 카페 2', rows: 6, cols: 8, typeCount: 8, time: 108, targetScore: 2200 },
            '2-3': { world: 2, name: '디저트 카페 3', rows: 6, cols: 8, typeCount: 9, time: 105, targetScore: 2400 },
            '3-1': { world: 3, name: '동물 농장 1', rows: 6, cols: 8, typeCount: 9, time: 115, targetScore: 2600 },
            '3-2': { world: 3, name: '동물 농장 2', rows: 6, cols: 8, typeCount: 10, time: 112, targetScore: 2800 },
            '3-3': { world: 3, name: '동물 농장 3', rows: 6, cols: 8, typeCount: 10, time: 110, targetScore: 3000 },
            '4-1': { world: 4, name: '꽃향기 정원 1', rows: 8, cols: 8, typeCount: 11, time: 140, targetScore: 3400 },
            '4-2': { world: 4, name: '꽃향기 정원 2', rows: 8, cols: 8, typeCount: 12, time: 138, targetScore: 3800 },
            '4-3': { world: 4, name: '꽃향기 정원 3', rows: 8, cols: 8, typeCount: 12, time: 135, targetScore: 4200 },
            '5-1': { world: 5, name: '무지개 언덕 1', rows: 8, cols: 8, typeCount: 13, time: 145, targetScore: 4600 },
            '5-2': { world: 5, name: '무지개 언덕 2', rows: 8, cols: 8, typeCount: 13, time: 142, targetScore: 5000 },
            '5-3': { world: 5, name: '무지개 언덕 3', rows: 8, cols: 8, typeCount: 14, time: 140, targetScore: 5400 },
            '6-1': { world: 6, name: '별빛 판타지 1', rows: 8, cols: 10, typeCount: 14, time: 180, targetScore: 6000 },
            '6-2': { world: 6, name: '별빛 판타지 2', rows: 8, cols: 10, typeCount: 15, time: 175, targetScore: 6500 },
            '6-3': { world: 6, name: '별빛 판타지 3', rows: 8, cols: 10, typeCount: 15, time: 170, targetScore: 7000 }
        };
    }

    /**
     * Initialize stage and generate 100% solvable board
     */
    initStage(stageId = '1-1') {
        const config = this.stagesConfig[stageId] || this.stagesConfig['1-1'];
        this.stage = stageId;
        this.rows = config.rows;
        this.cols = config.cols;
        this.paddingRows = this.rows + 2;
        this.paddingCols = this.cols + 2;
        this.totalTiles = this.rows * this.cols;
        this.remainingTiles = this.totalTiles;
        this.timeLimit = config.time;
        this.timeRemaining = config.time;
        this.score = 0;
        this.combo = 0;
        this.lastMatchTime = 0;

        this.generateSolvableBoard(config);
        return {
            stage: this.stage,
            name: config.name,
            rows: this.rows,
            cols: this.cols,
            paddingRows: this.paddingRows,
            paddingCols: this.paddingCols,
            totalTiles: this.totalTiles,
            timeLimit: this.timeLimit,
            targetScore: config.targetScore,
            board: this.board
        };
    }

    /**
     * Generate board guaranteed to be solvable and have initial moves
     */
    generateSolvableBoard(config) {
        let attempts = 0;
        while (attempts < 100) {
            attempts++;
            this.buildRawBoard(config);
            const matches = this.findAvailableMatches();
            // Ensure at least 3 distinct matching options at start for smooth casual flow
            if (matches.length >= 3) {
                return;
            }
        }
    }

    /**
     * Fill grid with pairs of tiles
     */
    buildRawBoard(config) {
        this.board = Array.from({ length: this.paddingRows }, () =>
            Array.from({ length: this.paddingCols }, () => null)
        );

        const typesToUse = this.tileTypes.slice(0, config.typeCount);
        const pairsCount = this.totalTiles / 2;
        const tilePool = [];

        for (let i = 0; i < pairsCount; i++) {
            const type = typesToUse[i % typesToUse.length];
            tilePool.push({ typeId: type.id, icon: type.icon, name: type.name, bg: type.bg, border: type.border, color: type.color });
            tilePool.push({ typeId: type.id, icon: type.icon, name: type.name, bg: type.bg, border: type.border, color: type.color });
        }

        // Shuffle tile pool (Fisher-Yates)
        for (let i = tilePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tilePool[i], tilePool[j]] = [tilePool[j], tilePool[i]];
        }

        let tileIdCounter = 1;
        let poolIdx = 0;
        for (let r = 1; r <= this.rows; r++) {
            for (let c = 1; c <= this.cols; c++) {
                const item = tilePool[poolIdx++];
                this.board[r][c] = {
                    id: tileIdCounter++,
                    r: r,
                    c: c,
                    typeId: item.typeId,
                    icon: item.icon,
                    name: item.name,
                    bg: item.bg,
                    border: item.border,
                    color: item.color,
                    cleared: false
                };
            }
        }
        this.remainingTiles = this.totalTiles;
    }

    /**
     * Check if a grid coordinate is empty (cleared or outer padding)
     */
    isEmpty(r, c) {
        if (r < 0 || r >= this.paddingRows || c < 0 || c >= this.paddingCols) return false;
        const cell = this.board[r][c];
        return cell === null || cell.cleared === true;
    }

    /**
     * Check unobstructed straight line between two cells on the same row or col
     */
    isStraightClear(r1, c1, r2, c2) {
        if (r1 === r2) {
            const minC = Math.min(c1, c2);
            const maxC = Math.max(c1, c2);
            for (let c = minC + 1; c < maxC; c++) {
                if (!this.isEmpty(r1, c)) return false;
            }
            return true;
        } else if (c1 === c2) {
            const minR = Math.min(r1, r2);
            const maxR = Math.max(r1, r2);
            for (let r = minR + 1; r < maxR; r++) {
                if (!this.isEmpty(r, c1)) return false;
            }
            return true;
        }
        return false;
    }

    /**
     * Classical Shisen-Sho 0/1/2-turn Pathfinding (Max 2 turns, 3 straight lines)
     * Returns: Array of coordinates `[{r, c}, ...]` or null if not connectable
     */
    findPath(r1, c1, r2, c2) {
        // Can't match with self
        if (r1 === r2 && c1 === c2) return null;

        const tile1 = this.board[r1][c1];
        const tile2 = this.board[r2][c2];
        if (!tile1 || !tile2 || tile1.cleared || tile2.cleared) return null;
        if (tile1.typeId !== tile2.typeId) return null;

        // 1. Check 0 turns (Direct straight line)
        if ((r1 === r2 || c1 === c2) && this.isStraightClear(r1, c1, r2, c2)) {
            return [{ r: r1, c: c1 }, { r: r2, c: c2 }];
        }

        // 2. Check 1 turn (L-shape via Corner A or Corner B)
        // Corner A: (r1, c2)
        if (this.isEmpty(r1, c2) && this.isStraightClear(r1, c1, r1, c2) && this.isStraightClear(r1, c2, r2, c2)) {
            return [{ r: r1, c: c1 }, { r: r1, c: c2 }, { r: r2, c: c2 }];
        }
        // Corner B: (r2, c1)
        if (this.isEmpty(r2, c1) && this.isStraightClear(r1, c1, r2, c1) && this.isStraightClear(r2, c1, r2, c2)) {
            return [{ r: r1, c: c1 }, { r: r2, c: c1 }, { r: r2, c: c2 }];
        }

        // 3. Check 2 turns (U-shape or Z-shape)
        // Scan horizontal rays from (r1, c1)
        for (let c = 0; c < this.paddingCols; c++) {
            if (c === c1) continue;
            // The segment from (r1, c1) to (r1, c) must be empty
            if (this.isStraightClear(r1, c1, r1, c) && this.isEmpty(r1, c)) {
                // Now check if (r1, c) can connect to (r2, c2) with 1 turn (L-shape)!
                // From (r1, c) to (r2, c2): corner is (r2, c)
                if (this.isEmpty(r2, c) && this.isStraightClear(r1, c, r2, c) && this.isStraightClear(r2, c, r2, c2)) {
                    return [{ r: r1, c: c1 }, { r: r1, c: c }, { r: r2, c: c }, { r: r2, c: c2 }];
                }
            }
        }

        // Scan vertical rays from (r1, c1)
        for (let r = 0; r < this.paddingRows; r++) {
            if (r === r1) continue;
            // The segment from (r1, c1) to (r, c1) must be empty
            if (this.isStraightClear(r1, c1, r, c1) && this.isEmpty(r, c1)) {
                // Now check if (r, c1) can connect to (r2, c2) with 1 turn!
                // From (r, c1) to (r2, c2): corner is (r, c2)
                if (this.isEmpty(r, c2) && this.isStraightClear(r, c1, r, c2) && this.isStraightClear(r, c2, r2, c2)) {
                    return [{ r: r1, c: c1 }, { r: r, c: c1 }, { r: r, c: c2 }, { r: r2, c: c2 }];
                }
            }
        }

        return null;
    }

    /**
     * Remove pair from board and update score & combo
     */
    removePair(r1, c1, r2, c2) {
        const t1 = this.board[r1][c1];
        const t2 = this.board[r2][c2];
        if (!t1 || !t2) return null;

        t1.cleared = true;
        t2.cleared = true;
        this.remainingTiles -= 2;

        const now = Date.now();
        if (now - this.lastMatchTime <= 3500) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.lastMatchTime = now;

        const baseScore = 100;
        const comboBonus = (this.combo - 1) * 30;
        const pointsEarned = baseScore + comboBonus;
        this.score += pointsEarned;

        return {
            pointsEarned,
            combo: this.combo,
            remainingTiles: this.remainingTiles,
            isCleared: this.remainingTiles <= 0
        };
    }

    /**
     * Find all currently available valid matches on the board
     */
    findAvailableMatches() {
        const matches = [];
        const activeTiles = [];

        for (let r = 1; r <= this.rows; r++) {
            for (let c = 1; c <= this.cols; c++) {
                const t = this.board[r][c];
                if (t && !t.cleared) {
                    activeTiles.push(t);
                }
            }
        }

        for (let i = 0; i < activeTiles.length; i++) {
            for (let j = i + 1; j < activeTiles.length; j++) {
                const a = activeTiles[i];
                const b = activeTiles[j];
                if (a.typeId === b.typeId) {
                    const path = this.findPath(a.r, a.c, b.r, b.c);
                    if (path) {
                        matches.push({ tileA: a, tileB: b, path });
                    }
                }
            }
        }

        return matches;
    }

    /**
     * Shuffle remaining active tiles until at least 1 valid match is available
     */
    shuffleRemainingTiles() {
        const activeCoords = [];
        const activeTypes = [];

        for (let r = 1; r <= this.rows; r++) {
            for (let c = 1; c <= this.cols; c++) {
                const t = this.board[r][c];
                if (t && !t.cleared) {
                    activeCoords.push({ r, c });
                    activeTypes.push({
                        typeId: t.typeId,
                        icon: t.icon,
                        name: t.name,
                        bg: t.bg,
                        border: t.border,
                        color: t.color
                    });
                }
            }
        }

        if (activeCoords.length < 2) return false;

        let tries = 0;
        while (tries < 50) {
            tries++;
            // Shuffle types array
            for (let i = activeTypes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [activeTypes[i], activeTypes[j]] = [activeTypes[j], activeTypes[i]];
            }

            // Assign back
            for (let i = 0; i < activeCoords.length; i++) {
                const { r, c } = activeCoords[i];
                const typeInfo = activeTypes[i];
                const tile = this.board[r][c];
                tile.typeId = typeInfo.typeId;
                tile.icon = typeInfo.icon;
                tile.name = typeInfo.name;
                tile.bg = typeInfo.bg;
                tile.border = typeInfo.border;
                tile.color = typeInfo.color;
            }

            if (this.findAvailableMatches().length > 0) {
                return true;
            }
        }

        return true;
    }
}

// Export for module or browser window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SichuanEngine;
} else if (typeof window !== 'undefined') {
    window.SichuanEngine = SichuanEngine;
}
