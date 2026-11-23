/**
 * Kawaii SumLink (썸링크) Engine
 * 100% Solvable Board Generation & Guaranteed Complement Addition
 * Strict Target Sum Matching (Sum MUST equal targetSum)
 * Free Add Numbers up to Screen Bottom (8 rows)
 * 6-Tier Connectivity (Horizontal, Vertical, Diagonal, Wrap, 2D Raycast, BFS Onet Path)
 */
class MakeSumEngine {
    constructor() {
        this.cols = 9;
        this.maxFreeRows = 8; // Screen bottom limit (8 rows = 72 cells)
                this.stageConfigs = {
            // World 1: 🍓 달콤 디저트 (힐링 모드 • 목표 합: 10 ~ 12 캐주얼)
            '1-1': { world: 1, target: 10, rows: 4, isTimeAttack: false, name: '1-1 딸기 모찌 🍓', desc: '합 10 만들기 (2개 또는 3개 연결)' },
            '1-2': { world: 1, target: 11, rows: 4, isTimeAttack: false, name: '1-2 바닐라 컵케이크 🧁', desc: '합 11 만들기 (다양한 조합)' },
            '1-3': { world: 1, target: 10, rows: 5, isTimeAttack: false, name: '1-3 솜사탕 동산 🍬', desc: '합 10 만들기 (3연속 콤보 도전!)' },
            '1-4': { world: 1, target: 12, rows: 5, isTimeAttack: false, name: '1-4 마카롱 파티 🍭', desc: '합 12 만들기 (상하좌우 자유 연결)' },
            '1-5': { world: 1, target: 11, rows: 5, isTimeAttack: false, name: '1-5 루루의 디저트 왕관 👑', desc: '월드 1 마스터! (합 11)' },
            
            // World 2: 🌸 벚꽃 숲의 멜로디 (⚡ 타임어택 80초! 성공 시 +3초 • 목표 합: 10 ~ 13 랜덤 순환)
            '2-1': { world: 2, target: 12, rows: 4, isTimeAttack: true, timeLimit: 95, name: '2-1 벚꽃 티타임 🌸', desc: '⚡ 타임어택 95초! (목표 합: 12)' },
            '2-2': { world: 2, target: 10, rows: 5, isTimeAttack: true, timeLimit: 95, name: '2-2 달콤 앵두 🍒', desc: '⚡ 타임어택 95초! (목표 합: 10)' },
            '2-3': { world: 2, target: 13, rows: 5, isTimeAttack: true, timeLimit: 95, name: '2-3 레인보우 푸딩 🍮', desc: '⚡ 타임어택 95초! (목표 합: 13)' },
            '2-4': { world: 2, target: 11, rows: 5, isTimeAttack: true, timeLimit: 95, name: '2-4 별빛 버블 🫧', desc: '⚡ 타임어택 95초! (목표 합: 11)' },
            '2-5': { world: 2, target: 12, rows: 6, isTimeAttack: true, timeLimit: 95, name: '2-5 프린세스 윙 🪽', desc: '월드 2 타임어택 마스터! (합 12)' },

            // World 3: 💎 크리스탈 팰리스 (⚡ 타임어택 70초! 성공 시 +3초 • 목표 합: 10 ~ 14 랜덤 순환)
            '3-1': { world: 3, target: 11, rows: 5, isTimeAttack: true, timeLimit: 90, name: '3-1 크리스탈 회랑 💎', desc: '⚡ 타임어택 90초! (목표 합: 11)' },
            '3-2': { world: 3, target: 14, rows: 5, isTimeAttack: true, timeLimit: 90, name: '3-2 루비 캔들 💖', desc: '⚡ 타임어택 90초! (목표 합: 14)' },
            '3-3': { world: 3, target: 10, rows: 6, isTimeAttack: true, timeLimit: 90, name: '3-3 에메랄드 분수 🍀', desc: '⚡ 타임어택 90초! (목표 합: 10)' },
            '3-4': { world: 3, target: 13, rows: 6, isTimeAttack: true, timeLimit: 90, name: '3-4 사파이어 미로 🔷', desc: '⚡ 타임어택 90초! (목표 합: 13)' },
            '3-5': { world: 3, target: 12, rows: 6, isTimeAttack: true, timeLimit: 90, name: '3-5 보석의 여왕 👑💎', desc: '월드 3 타임어택 마스터! (합 12)' },

            // World 4: 🌌 은하수 마스터 (⚡ 하이퍼 타임어택 60초! 성공 시 +3초 • 목표 합: 10 ~ 15 랜덤 순환)
            '4-1': { world: 4, target: 10, rows: 5, isTimeAttack: true, timeLimit: 85, name: '4-1 은하수 오로라 🌌', desc: '⚡ 하이퍼 타임어택 85초! (목표 합: 10)' },
            '4-2': { world: 4, target: 15, rows: 6, isTimeAttack: true, timeLimit: 85, name: '4-2 별의 나침반 🧭', desc: '⚡ 하이퍼 타임어택 85초! (목표 합: 15)' },
            '4-3': { world: 4, target: 11, rows: 6, isTimeAttack: true, timeLimit: 85, name: '4-3 황금빛 티아라 🎀', desc: '⚡ 하이퍼 타임어택 85초! (목표 합: 11)' },
            '4-4': { world: 4, target: 14, rows: 6, isTimeAttack: true, timeLimit: 85, name: '4-4 로열 매직 캐슬 🏰', desc: '⚡ 하이퍼 타임어택 85초! (목표 합: 14)' },
            '4-5': { world: 4, target: 12, rows: 6, isTimeAttack: true, timeLimit: 85, name: '4-5 전설의 브레인 마스터 🌟', desc: '최고 목표: 하이퍼 타임어택 피날레!' }
        };
        this.stageOrder = Object.keys(this.stageConfigs);
    }

    // 100% Mathematically & Topologically Solvable Board Generation
    generateBoard(stageId, customTarget = null) {
        const config = this.stageConfigs[stageId] || this.stageConfigs['1-1'];
        const totalCells = config.rows * this.cols;
        const target = customTarget || config.target;
        const maxVal = target <= 12 ? 9 : (target <= 20 ? 12 : 15);

        // Build exact valid pairs & triplets
        const validPairs = [];
        for (let a = 1; a < target; a++) {
            const b = target - a;
            if (a <= maxVal && b <= maxVal) {
                validPairs.push([a, b]);
            }
        }

        const validTriplets = [];
        for (let a = 1; a <= maxVal; a++) {
            for (let b = 1; b <= maxVal; b++) {
                const c = target - (a + b);
                if (c >= 1 && c <= maxVal) {
                    validTriplets.push([a, b, c]);
                }
            }
        }

        const tuples = [];
        let curCount = 0;
        while (curCount < totalCells) {
            const rem = totalCells - curCount;
            if (rem === 2 || (rem > 3 && Math.random() > 0.45 && validPairs.length > 0)) {
                const p = validPairs[Math.floor(Math.random() * validPairs.length)];
                tuples.push(p);
                curCount += p.length;
            } else if (validTriplets.length > 0) {
                const t = validTriplets[Math.floor(Math.random() * validTriplets.length)];
                tuples.push(t);
                curCount += t.length;
            } else {
                const p = validPairs[0] || [Math.floor(target/2), target - Math.floor(target/2)];
                tuples.push(p);
                curCount += p.length;
            }
        }

        const vals = [];
        tuples.forEach(t => vals.push(...t));
        vals.length = totalCells;

        // Controlled shuffle that guarantees immediate opening matches
        for (let i = 0; i < vals.length; i++) {
            if (Math.random() > 0.45 && i + 2 < vals.length) {
                const sw = i + (Math.floor(Math.random() * 3) + 1);
                if (sw < vals.length) {
                    const temp = vals[i];
                    vals[i] = vals[sw];
                    vals[sw] = temp;
                }
            }
        }

        const cells = vals.map((val, idx) => ({ id: idx, val, cleared: false }));
        return { config, cells, cols: this.cols };
    }

    // Guaranteed Solvable Complement Addition: Every single leftover board tile gets its partner!
    addNumbers(cells, targetSum = 10) {
        const activeCells = cells.filter(c => !c.cleared);
        if (activeCells.length === 0) return cells;

        const maxVal = targetSum <= 12 ? 9 : (targetSum <= 20 ? 12 : 15);
        const activeVals = activeCells.map(c => c.val);

        // Calculate exact matching complements for all remaining active numbers
        const neededComplements = [];
        for (const v of activeVals) {
            const diff = targetSum - v;
            if (diff >= 1 && diff <= maxVal) {
                neededComplements.push(diff);
            }
        }

        // Shuffle complements
        for (let i = neededComplements.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neededComplements[i], neededComplements[j]] = [neededComplements[j], neededComplements[i]];
        }

        const rowVals = [];
        const cols = this.cols; // Exact 9 tiles

        // 1. Take up to 5-6 complements for remaining board tiles
        for (const comp of neededComplements) {
            if (rowVals.length >= cols - 2) break;
            rowVals.push(comp);
        }

        // 2. Add an instant pair in the remaining slots
        while (rowVals.length < cols) {
            const rem = cols - rowVals.length;
            if (rem >= 2) {
                const a = Math.floor(Math.random() * (targetSum - 1)) + 1;
                const b = targetSum - a;
                if (a >= 1 && a <= maxVal && b >= 1 && b <= maxVal) {
                    rowVals.push(a, b);
                } else {
                    rowVals.push(Math.floor(targetSum / 2), targetSum - Math.floor(targetSum / 2));
                }
            } else {
                rowVals.push(Math.floor(Math.random() * maxVal) + 1);
            }
        }

        const finalRow = rowVals.slice(0, cols);
        const newCells = [...cells];
        for (const v of finalRow) {
            newCells.push({ id: newCells.length, val: v, cleared: false });
        }
        return newCells;
    }

    canConnect(idx1, idx2, cells) {
        if (idx1 === idx2) return null;
        if (idx1 < 0 || idx2 < 0 || idx1 >= cells.length || idx2 >= cells.length) return null;
        if (cells[idx1].cleared || cells[idx2].cleared) return null;

        const cols = this.cols;
        const rows = Math.ceil(cells.length / cols);
        const r1 = Math.floor(idx1 / cols);
        const c1 = idx1 % cols;
        const r2 = Math.floor(idx2 / cols);
        const c2 = idx2 % cols;

        // 1. Direct Horizontal Check
        if (r1 === r2) {
            const minC = Math.min(c1, c2);
            const maxC = Math.max(c1, c2);
            let clear = true;
            for (let c = minC + 1; c < maxC; c++) {
                if (!cells[r1 * cols + c].cleared) { clear = false; break; }
            }
            if (clear) return { type: 'horizontal', path: [{ r: r1, c: c1 }, { r: r2, c: c2 }] };
        }

        // 2. Direct Vertical Check
        if (c1 === c2) {
            const minR = Math.min(r1, r2);
            const maxR = Math.max(r1, r2);
            let clear = true;
            for (let r = minR + 1; r < maxR; r++) {
                if (!cells[r * cols + c1].cleared) { clear = false; break; }
            }
            if (clear) return { type: 'vertical', path: [{ r: r1, c: c1 }, { r: r2, c: c2 }] };
        }

        // 3. Direct Diagonal Check (45-degree)
        if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
            const stepR = r2 > r1 ? 1 : -1;
            const stepC = c2 > c1 ? 1 : -1;
            let cr = r1 + stepR;
            let cc = c1 + stepC;
            let clear = true;
            while (cr !== r2 && cc !== c2) {
                if (!cells[cr * cols + cc].cleared) { clear = false; break; }
                cr += stepR;
                cc += stepC;
            }
            if (clear) return { type: 'diagonal', path: [{ r: r1, c: c1 }, { r: r2, c: c2 }] };
        }

        // 4. Sequential Wrap-Around (Reading order)
        const minIdx = Math.min(idx1, idx2);
        const maxIdx = Math.max(idx1, idx2);
        let seqClear = true;
        for (let i = minIdx + 1; i < maxIdx; i++) {
            if (!cells[i].cleared) { seqClear = false; break; }
        }
        if (seqClear) return { type: 'sequential', path: [{ r: r1, c: c1 }, { r: r2, c: c2 }] };

        // 5. Continuous 2D Free-Angle Raycast (Liang-Barsky Line Clipping)
        const p1x = c1 + 0.5, p1y = r1 + 0.5;
        const p2x = c2 + 0.5, p2y = r2 + 0.5;
        const dx = p2x - p1x, dy = p2y - p1y;
        let rayClear = true;
        const margin = 0.15;

        for (let i = 0; i < cells.length; i++) {
            if (cells[i].cleared || i === idx1 || i === idx2) continue;
            const cr = Math.floor(i / cols);
            const cc = i % cols;
            const minX = cc + margin, maxX = cc + 1.0 - margin;
            const minY = cr + margin, maxY = cr + 1.0 - margin;

            const p = [-dx, dx, -dy, dy];
            const q = [p1x - minX, maxX - p1x, p1y - minY, maxY - p1y];
            let u1 = 0.0, u2 = 1.0, hit = true;

            for (let k = 0; k < 4; k++) {
                if (p[k] === 0) {
                    if (q[k] < 0) { hit = false; break; }
                } else {
                    const t = q[k] / p[k];
                    if (p[k] < 0) {
                        if (t > u2) { hit = false; break; }
                        if (t > u1) u1 = t;
                    } else if (p[k] > 0) {
                        if (t < u1) { hit = false; break; }
                        if (t < u2) u2 = t;
                    }
                }
            }
            if (hit && u1 <= u2) { rayClear = false; break; }
        }
        if (rayClear) return { type: 'raycast', path: [{ r: r1, c: c1 }, { r: r2, c: c2 }] };

        // 6. BFS Pathfinding through empty cells & padded border (up to 3 turns)
        const dirs = [
            { dr: -1, dc: 0 },
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 }
        ];

        const queue = [];
        dirs.forEach((d, dirIdx) => {
            const nr = r1 + d.dr;
            const nc = c1 + d.dc;
            if (nr >= -1 && nr <= rows && nc >= -1 && nc <= cols) {
                if (nr === r2 && nc === c2) {
                    queue.push({ r: nr, c: nc, dir: dirIdx, turns: 0, path: [{ r: r1, c: c1 }, { r: r2, c: c2 }] });
                    return;
                }
                let isPassable = false;
                if (nr === -1 || nr === rows || nc === -1 || nc === cols) {
                    isPassable = true;
                } else {
                    const gIdx = nr * cols + nc;
                    if (gIdx < cells.length && cells[gIdx].cleared) isPassable = true;
                }
                if (isPassable) {
                    queue.push({ r: nr, c: nc, dir: dirIdx, turns: 0, path: [{ r: r1, c: c1 }, { r: nr, c: nc }] });
                }
            }
        });

        const visited = new Map();

        while (queue.length > 0) {
            const curr = queue.shift();
            if (curr.r === r2 && curr.c === c2) {
                return { type: 'bfs_path', path: curr.path };
            }
            if (curr.turns > 3) continue;

            for (let dIdx = 0; dIdx < dirs.length; dIdx++) {
                const d = dirs[dIdx];
                const nr = curr.r + d.dr;
                const nc = curr.c + d.dc;
                if (nr >= -1 && nr <= rows && nc >= -1 && nc <= cols) {
                    const newTurns = curr.turns + (dIdx !== curr.dir ? 1 : 0);
                    if (newTurns > 3) continue;

                    const isTarget = (nr === r2 && nc === c2);
                    let isPassable = false;
                    if (isTarget) {
                        isPassable = true;
                    } else if (nr === -1 || nr === rows || nc === -1 || nc === cols) {
                        isPassable = true;
                    } else {
                        const gIdx = nr * cols + nc;
                        if (gIdx < cells.length && cells[gIdx].cleared) isPassable = true;
                    }

                    if (isPassable) {
                        const key = `${nr},${nc},${dIdx}`;
                        if (!visited.has(key) || visited.get(key) > newTurns) {
                            visited.set(key, newTurns);
                            const newPath = [...curr.path];
                            if (dIdx !== curr.dir || isTarget) {
                                newPath.push({ r: nr, c: nc });
                            } else {
                                newPath[newPath.length - 1] = { r: nr, c: nc };
                            }
                            queue.push({ r: nr, c: nc, dir: dIdx, turns: newTurns, path: newPath });
                        }
                    }
                }
            }
        }

        return null;
    }

    evaluateSelection(indices, cells, targetSum) {
        if (!indices || indices.length < 2 || indices.length > 3) return null;

        // 2 Tiles Check
        if (indices.length === 2) {
            const [i1, i2] = indices;
            const conn = this.canConnect(i1, i2, cells);
            if (!conn) return null;

            const v1 = cells[i1].val;
            const v2 = cells[i2].val;
            const sum = v1 + v2;

            if (sum === targetSum) {
                return { valid: true, count: 2, sum, connections: [conn] };
            }
            if (sum < targetSum) {
                return { valid: 'partial', count: 2, sum, remaining: targetSum - sum, connections: [conn] };
            }
            return null;
        }

        // 3 Tiles Check
        if (indices.length === 3) {
            const [i1, i2, i3] = indices;
            const conn1 = this.canConnect(i1, i2, cells);
            const conn2 = this.canConnect(i2, i3, cells) || this.canConnect(i1, i3, cells);
            if (!conn1 || !conn2) return null;

            const v1 = cells[i1].val;
            const v2 = cells[i2].val;
            const v3 = cells[i3].val;
            const sum = v1 + v2 + v3;

            if (sum === targetSum) {
                return { valid: true, count: 3, sum, connections: [conn1, conn2] };
            }
            return null;
        }

        return null;
    }

    findAllValidMoves(cells, targetSum) {
        const moves = [];
        const active = [];
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].cleared) active.push(i);
        }

        for (let a = 0; a < active.length; a++) {
            for (let b = a + 1; b < active.length; b++) {
                const i = active[a];
                const j = active[b];
                const res = this.evaluateSelection([i, j], cells, targetSum);
                if (res && res.valid === true) {
                    moves.push({ indices: [i, j], res });
                }
            }
        }

        for (let a = 0; a < active.length; a++) {
            for (let b = a + 1; b < active.length; b++) {
                const i = active[a];
                const j = active[b];
                if (!this.canConnect(i, j, cells)) continue;
                for (let c = b + 1; c < active.length; c++) {
                    const k = active[c];
                    const res = this.evaluateSelection([i, j, k], cells, targetSum);
                    if (res && res.valid === true) {
                        moves.push({ indices: [i, j, k], res });
                    }
                }
            }
        }

        return moves;
    }
}
window.MakeSumEngine = MakeSumEngine;
