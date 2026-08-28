/**
 * Kawaii Sudoku - Sudoku Engine
 * Supports 4x4 (2x2 subgrid), 6x6 (2x3 subgrid), 9x9 (3x3 subgrid)
 * Guaranteed unique solutions using backtracking solver & validator.
 */

class SudokuEngine {
    constructor() {
        this.configs = {
            4: { size: 4, boxRows: 2, boxCols: 2, digits: [1, 2, 3, 4] },
            6: { size: 6, boxRows: 2, boxCols: 3, digits: [1, 2, 3, 4, 5, 6] },
            9: { size: 9, boxRows: 3, boxCols: 3, digits: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
        };
    }

    getConfig(size) {
        return this.configs[size] || this.configs[9];
    }

    generateFullBoard(size) {
        const config = this.getConfig(size);
        const board = Array.from({ length: size }, () => Array(size).fill(0));
        this.fillBoard(board, config);
        return board;
    }

    fillBoard(board, config) {
        const { size, digits } = config;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === 0) {
                    const shuffledDigits = [...digits].sort(() => Math.random() - 0.5);
                    for (const num of shuffledDigits) {
                        if (this.isValidPlacement(board, r, c, num, config)) {
                            board[r][c] = num;
                            if (this.fillBoard(board, config)) {
                                return true;
                            }
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValidPlacement(board, row, col, num, config) {
        const { size, boxRows, boxCols } = config;

        // Check row
        for (let c = 0; c < size; c++) {
            if (board[row][c] === num) return false;
        }

        // Check col
        for (let r = 0; r < size; r++) {
            if (board[r][col] === num) return false;
        }

        // Check subgrid
        const startRow = Math.floor(row / boxRows) * boxRows;
        const startCol = Math.floor(col / boxCols) * boxCols;

        for (let r = 0; r < boxRows; r++) {
            for (let c = 0; c < boxCols; c++) {
                if (board[startRow + r][startCol + c] === num) return false;
            }
        }

        return true;
    }

    countSolutions(board, config, count = { val: 0 }) {
        const { size, digits } = config;
        let emptyRow = -1;
        let emptyCol = -1;

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === 0) {
                    emptyRow = r;
                    emptyCol = c;
                    break;
                }
            }
            if (emptyRow !== -1) break;
        }

        if (emptyRow === -1) {
            count.val += 1;
            return;
        }

        for (const num of digits) {
            if (this.isValidPlacement(board, emptyRow, emptyCol, num, config)) {
                board[emptyRow][emptyCol] = num;
                this.countSolutions(board, config, count);
                board[emptyRow][emptyCol] = 0;

                if (count.val >= 2) return;
            }
        }
    }

    generatePuzzle(size = 9, difficulty = 'easy') {
        const config = this.getConfig(size);
        const solution = this.generateFullBoard(size);
        const puzzle = solution.map(row => [...row]);

        let targetHoles = 0;
        if (size === 4) {
            targetHoles = difficulty === 'easy' ? 4 : 6;
        } else if (size === 6) {
            targetHoles = difficulty === 'easy' ? 12 : 16;
        } else {
            if (difficulty === 'easy') targetHoles = 32;
            else if (difficulty === 'normal') targetHoles = 42;
            else targetHoles = 50;
        }

        const cells = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                cells.push({ r, c });
            }
        }
        cells.sort(() => Math.random() - 0.5);

        let holesRemoved = 0;
        for (const { r, c } of cells) {
            if (holesRemoved >= targetHoles) break;

            const temp = puzzle[r][c];
            puzzle[r][c] = 0;

            const testBoard = puzzle.map(row => [...row]);
            const counter = { val: 0 };
            this.countSolutions(testBoard, config, counter);

            if (counter.val !== 1) {
                puzzle[r][c] = temp;
            } else {
                holesRemoved++;
            }
        }

        return {
            size,
            difficulty,
            puzzle,
            solution,
            initialBoard: puzzle.map(row => [...row]),
            targetHoles: holesRemoved
        };
    }

    isBoardComplete(currentBoard, solutionBoard, size) {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (currentBoard[r][c] !== solutionBoard[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }
}

if (typeof window !== 'undefined') {
    window.SudokuEngine = SudokuEngine;
}
