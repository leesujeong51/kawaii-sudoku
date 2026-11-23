/**
 * Free Tetris (자유 테트리스) Engine
 * 블록이 떨어지지 않고, 받은 3개 블록을 원하는 위치·방향으로 직접 놓는 방식.
 * 가로줄 또는 세로줄이 꽉 차면 사라짐. 놓을 곳이 없으면 게임 오버.
 */
class TetrisFreeEngine {
    constructor(size = 10) {
        this.size = size;
        this.SHAPES = {
            I: { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: '#7DD3FC' },
            O: { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: '#FDE047' },
            T: { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], color: '#C4B5FD' },
            L: { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], color: '#FDBA74' },
            J: { cells: [[0, 1], [1, 1], [2, 1], [2, 0]], color: '#93C5FD' },
            S: { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], color: '#86EFAC' },
            Z: { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], color: '#FDA4AF' },
            // 숨 돌리기용 작은 블록 (난이도가 급격히 오르지 않게 섞어 줌)
            D: { cells: [[0, 0], [0, 1]], color: '#F9A8D4' },
            M: { cells: [[0, 0]], color: '#FBCFE8' }
        };
        this.reset();
    }

    reset() {
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
        this.score = 0;
        this.combo = 0;
        this.linesCleared = 0;
        this.tray = [];
        this.refillTray();
    }

    randomPiece() {
        // 큰 블록 위주, 작은 블록은 약 15%
        const big = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
        const key = Math.random() < 0.15
            ? (Math.random() < 0.6 ? 'D' : 'M')
            : big[Math.floor(Math.random() * big.length)];
        let cells = this.SHAPES[key].cells.map(([r, c]) => [r, c]);
        const turns = Math.floor(Math.random() * 4);
        for (let i = 0; i < turns; i++) cells = this.rotateCells(cells);
        return { key, color: this.SHAPES[key].color, cells };
    }

    rotateCells(cells) {
        // 90도 시계 방향 회전 후 (0,0) 기준으로 정규화
        const rotated = cells.map(([r, c]) => [c, -r]);
        const minR = Math.min(...rotated.map(p => p[0]));
        const minC = Math.min(...rotated.map(p => p[1]));
        return rotated.map(([r, c]) => [r - minR, c - minC]);
    }

    rotatePiece(idx) {
        const p = this.tray[idx];
        if (p) p.cells = this.rotateCells(p.cells);
        return p;
    }

    pieceSize(cells) {
        return {
            h: Math.max(...cells.map(p => p[0])) + 1,
            w: Math.max(...cells.map(p => p[1])) + 1
        };
    }

    canPlace(cells, r0, c0) {
        return cells.every(([r, c]) => {
            const rr = r0 + r, cc = c0 + c;
            return rr >= 0 && cc >= 0 && rr < this.size && cc < this.size && !this.grid[rr][cc];
        });
    }

    canPieceFitAnywhere(cells) {
        let cur = cells;
        for (let t = 0; t < 4; t++) {
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    if (this.canPlace(cur, r, c)) return true;
                }
            }
            cur = this.rotateCells(cur);
        }
        return false;
    }

    hasAnyMove() {
        return this.tray.some(p => p && this.canPieceFitAnywhere(p.cells));
    }

    refillTray() {
        // 배려 규칙: 새로 받는 3개 중 최소 1개는 놓을 자리가 있도록 몇 번 다시 뽑아 봄
        for (let attempt = 0; attempt < 20; attempt++) {
            this.tray = [this.randomPiece(), this.randomPiece(), this.randomPiece()];
            if (this.hasAnyMove()) return;
        }
    }

    /** 놓기. 성공 시 { points, rows, cols, combo, gameOver } 반환, 실패 시 null */
    place(idx, r0, c0) {
        const p = this.tray[idx];
        if (!p || !this.canPlace(p.cells, r0, c0)) return null;

        p.cells.forEach(([r, c]) => { this.grid[r0 + r][c0 + c] = p.color; });
        this.tray[idx] = null;
        let points = p.cells.length * 10;

        const rows = [], cols = [];
        for (let i = 0; i < this.size; i++) {
            if (this.grid[i].every(Boolean)) rows.push(i);
            if (this.grid.every(row => row[i])) cols.push(i);
        }
        rows.forEach(r => { for (let c = 0; c < this.size; c++) this.grid[r][c] = null; });
        cols.forEach(c => { for (let r = 0; r < this.size; r++) this.grid[r][c] = null; });

        const lines = rows.length + cols.length;
        if (lines > 0) {
            this.combo += 1;
            this.linesCleared += lines;
            // 여러 줄 동시 + 연속 콤보일수록 크게 (보상감)
            points += lines * lines * 100 * this.combo;
        } else {
            this.combo = 0;
        }
        this.score += points;

        if (this.tray.every(t => !t)) this.refillTray();
        return { points, rows, cols, combo: this.combo, lines, gameOver: !this.hasAnyMove() };
    }

    /** 광고 이어하기: 가장 많이 찬 줄 2개를 비우고 블록을 새로 받음 */
    rescue() {
        const order = this.grid
            .map((row, i) => ({ i, filled: row.filter(Boolean).length }))
            .sort((a, b) => b.filled - a.filled)
            .slice(0, 2);
        order.forEach(({ i }) => { this.grid[i] = Array(this.size).fill(null); });
        this.refillTray();
    }
}
window.TetrisFreeEngine = TetrisFreeEngine;
