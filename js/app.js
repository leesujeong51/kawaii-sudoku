/**
 * Kawaii Sudoku & 썸링크 (SumLink) Hub - Main Application Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    // Safe Event Listener Helper
    function safeAddListener(id, event, handler) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, handler);
        } else {
            console.warn(`[SafeListener] Element with id "${id}" not found.`);
        }
    }

    window.soundManager = new SoundManager();
    window.particleSystem = new ParticleSystem('sakura-bg-canvas', 'fx-canvas');
    window.mascotManager = new MascotManager();
    window.economy = new GameEconomy();
    window.adMobManager = new AdMobManager();
    window.sudokuEngine = new SudokuEngine();
    window.makeSumEngine = new MakeSumEngine();

    const appWrapper = document.querySelector('.app-wrapper');

    // All Screens
    const screenHub = document.getElementById('screen-hub');
    const screenSudokuLobby = document.getElementById('screen-sudoku-lobby');
    const screenSudokuGame = document.getElementById('screen-sudoku-game');
    const screenMakeSumLobby = document.getElementById('screen-makesum-lobby');
    const screenMakeSumGame = document.getElementById('screen-makesum-game');
    const screenWordHuntLobby = document.getElementById('screen-wordhunt-lobby');
    const screenWordHuntGame = document.getElementById('screen-wordhunt-game');
    const screenSichuanLobby = document.getElementById('screen-sichuan-lobby');
    const screenSichuanGame = document.getElementById('screen-sichuan-game');

    // Header Stats
    const heartsCountElems = document.querySelectorAll('.hearts-count-val');
    const gemsCountElems = document.querySelectorAll('.gems-count-val');
    const sumlinkHeartsCountElems = document.querySelectorAll('.sumlink-hearts-count-val');
    const wordhuntHeartsCountElems = document.querySelectorAll('.wordhunt-hearts-count-val');
    const hubStarsElem = document.getElementById('hub-stars-val');
    const sudokuStarsElem = document.getElementById('sudoku-stars-val');
    const makeSumStarsElem = document.getElementById('makesum-stars-val');
    const wordHuntStarsElem = document.getElementById('wordhunt-stars-val');
    const hubHomeBtns = document.querySelectorAll('.btn-hub-home');

    // Global WordHunt State Variables
    let wordHuntStageId = '1-1';
    let wordHuntStageDef = null;
    let wordHuntStageWords = [];
    let wordHuntCurrentWordIdx = 0;
    let wordHuntPuzzleData = null;
    let wordHuntCurrentMatchedIndices = [];
    let wordHuntExpectedLetterIdx = 0;
    let wordHuntScore = 0;
    let wordHuntElapsedSeconds = 0;
    let wordHuntTimerSeconds = 40;
    let wordHuntTimerInterval = null;
    let wordHuntIsPaused = false;

    // Common Modals
    const pauseModal = document.getElementById('pause-modal');
    const stageLaunchModal = document.getElementById('stage-launch-modal');
    const clearModal = document.getElementById('clear-modal');
    const outOfHeartsModal = document.getElementById('out-of-hearts-modal');
    const dailyRewardModal = document.getElementById('daily-reward-modal');

    // -------------------------------------------------------------
    // 1. Global Navigation & Stats Sync
    // -------------------------------------------------------------
    let currentActiveGame = 'hub';
    let continueAdUsed = false;

        function updateHeaderStats() {
        economy.checkMidnightReset();
        heartsCountElems.forEach(el => { el.textContent = economy.state.hearts; });
        sumlinkHeartsCountElems.forEach(el => { el.textContent = `${economy.state.sumlinkHearts}/3`; });
        gemsCountElems.forEach(el => { el.textContent = economy.state.gems; });
        
        if (hubStarsElem) hubStarsElem.textContent = `${economy.totalHubStars}⭐`;
        if (sudokuStarsElem) sudokuStarsElem.textContent = `${economy.state.sudoku.totalStars}/60`;
        if (makeSumStarsElem) makeSumStarsElem.textContent = `${economy.state.makesum.totalStars}/60`;
        if (wordHuntStarsElem) wordHuntStarsElem.textContent = `${economy.state.wordhunt.totalStars}/60`;
        wordhuntHeartsCountElems.forEach(el => { el.textContent = `${economy.state.wordhuntHearts}/3`; });
        const sichuanHeartsCountElems = document.querySelectorAll('.sichuan-hearts-count-val');
        sichuanHeartsCountElems.forEach(el => { el.textContent = `${economy.state.sichuanHearts}/3`; });
        const sichuanStarsElem = document.getElementById('sichuan-stars-val');
        if (sichuanStarsElem && economy.state.sichuan) sichuanStarsElem.textContent = `${economy.state.sichuan.totalStars}/54`;
        document.querySelectorAll('.tetris-hearts-count-val').forEach(el => { el.textContent = `${economy.state.tetrisHearts}/3`; });
        const tetrisBestElem = document.getElementById('tetris-best-val');
        if (tetrisBestElem) tetrisBestElem.textContent = (economy.state.tetris.best || 0).toLocaleString();
    }

    setInterval(() => {
        }, 1000);

    function showScreen(screenId) {
        if (window.particleSystem) window.particleSystem.clearFX();
        [screenHub, screenSudokuLobby, screenSudokuGame, screenMakeSumLobby, screenMakeSumGame, screenWordHuntLobby, screenWordHuntGame, screenSichuanLobby, screenSichuanGame, document.getElementById('screen-tetris-game')].forEach(s => {
            if (s) s.classList.remove('active');
        });
        // 새 판이 시작될 때마다 '광고 보고 이어하기' 1회 기회 재충전
        if (screenId.endsWith('-game')) continueAdUsed = false;

        if (screenId === 'hub') {
            screenHub.classList.add('active');
            currentActiveGame = 'hub';
            mascotManager.setState('idle', '오늘은 어떤 두뇌 트레이닝을 해볼까요? 🌸');
        } else if (screenId === 'sudoku-lobby') {
            screenSudokuLobby.classList.add('active');
            currentActiveGame = 'sudoku';
            renderSudokuRoadmap();
            mascotManager.setState('idle', '루루 스도쿠의 숲으로 모험을 떠나요! 🍓');
        } else if (screenId === 'sudoku-game') {
            screenSudokuGame.classList.add('active');
            currentActiveGame = 'sudoku';
        } else if (screenId === 'makesum-lobby') {
            screenMakeSumLobby.classList.add('active');
            currentActiveGame = 'makesum';
            renderMakeSumRoadmap();
            mascotManager.setState('idle', '하루 3번! 썸링크로 힐링 두뇌 스트레칭해요! 🔢💖');
        } else if (screenId === 'makesum-game') {
            screenMakeSumGame.classList.add('active');
            currentActiveGame = 'makesum';
        } else if (screenId === 'wordhunt-lobby') {
            screenWordHuntLobby.classList.add('active');
            currentActiveGame = 'wordhunt';
            renderWordHuntRoadmap();
            mascotManager.setState('idle', '단어 스펠링을 순서대로 찾아 뇌를 깨워봐요! 🔤💖');
        } else if (screenId === 'wordhunt-game') {
            screenWordHuntGame.classList.add('active');
            currentActiveGame = 'wordhunt';
        } else if (screenId === 'sichuan-lobby') {
            if (screenSichuanLobby) screenSichuanLobby.classList.add('active');
            currentActiveGame = 'sichuan';
            renderSichuanRoadmap();
            mascotManager.setState('idle', '두 번 이하로 꺾어 같은 그림을 쏙쏙 짝지어요! 쏙쏙! 같은그림 짝꿍에 오신 걸 환영해요 🀄💖');
        } else if (screenId === 'sichuan-game') {
            if (screenSichuanGame) screenSichuanGame.classList.add('active');
            currentActiveGame = 'sichuan';
        } else if (screenId === 'tetris-game') {
            document.getElementById('screen-tetris-game').classList.add('active');
            currentActiveGame = 'tetris';
        }
        updateHeaderStats();
    }

    // Hub Card Event Handlers (Safe Check)
    const cardSudoku = document.getElementById('card-open-sudoku');
    if (cardSudoku) {
        cardSudoku.addEventListener('click', () => {
            soundManager.playTileSelect();
            showScreen('sudoku-lobby');
        });
    }
    const cardMakeSum = document.getElementById('card-open-makesum');
    if (cardMakeSum) {
        cardMakeSum.addEventListener('click', () => {
            soundManager.playTileSelect();
            showScreen('makesum-lobby');
        });
    }
    const cardSichuan = document.getElementById('card-open-sichuan');
    if (cardSichuan) {
        cardSichuan.addEventListener('click', () => {
            soundManager.playTileSelect();
            showScreen('sichuan-lobby');
        });
    }
    const cardWordHunt = document.getElementById('card-open-wordhunt');
    if (cardWordHunt) {
        cardWordHunt.addEventListener('click', () => {
            soundManager.playTileSelect();
            showScreen('wordhunt-lobby');
        });
    }

        // In-game Direct Back to Lobby Handlers
    safeAddListener('btn-sudoku-back', 'click', () => {
        soundManager.playTileSelect();
        if (sudokuTimerInterval) clearInterval(sudokuTimerInterval);
        showScreen('sudoku-lobby');
    });

    safeAddListener('btn-ms-back', 'click', () => {
        soundManager.playTileSelect();
        if (makeSumTimerInterval) clearInterval(makeSumTimerInterval);
        showScreen('makesum-lobby');
    });

    safeAddListener('btn-sichuan-back', 'click', () => {
        soundManager.playTileSelect();
        if (sichuanTimerInterval) clearInterval(sichuanTimerInterval);
        showScreen('sichuan-lobby');
    });
    safeAddListener('btn-wh-back', 'click', () => {
        soundManager.playTileSelect();
        if (wordHuntTimerInterval) clearInterval(wordHuntTimerInterval);
        showScreen('wordhunt-lobby');
    });

    hubHomeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundManager.playTileSelect();
            if (sudokuTimerInterval) clearInterval(sudokuTimerInterval);
            if (makeSumTimerInterval) clearInterval(makeSumTimerInterval);
            if (wordHuntTimerInterval) clearInterval(wordHuntTimerInterval);
            if (sichuanTimerInterval) clearInterval(sichuanTimerInterval);
            showScreen('hub');
        });
    });

    // -------------------------------------------------------------
    // 2. KAWAII SUDOKU CONTROLLER
    // -------------------------------------------------------------
    let sudokuStageId = '1-1';
    let sudokuStageDef = null;
    let sudokuCurrentBoard = [];
    let sudokuInitialBoard = [];
    let sudokuSolutionBoard = [];
    let sudokuNotesBoard = [];
    let sudokuSelectedCell = null;
    let sudokuIsNoteMode = false;
    let sudokuMistakes = 0;
    let sudokuElapsedSeconds = 0;
    let sudokuTimerInterval = null;
    let sudokuIsPaused = false;

    const sudokuGrid = document.getElementById('sudoku-grid');
    const sudokuNumpad = document.getElementById('numpad-bar');
    const sudokuTimerText = document.getElementById('timer-text');
    const sudokuMistakesText = document.getElementById('mistakes-count');
    const sudokuNoteBtn = document.getElementById('btn-note');

    function renderSudokuRoadmap() {
        const container = document.getElementById('sudoku-stages-list');
        if (!container) return;
        container.innerHTML = '';

        const welcomeBanner = document.createElement('div');
        welcomeBanner.className = 'welcome-freepass-banner';
        welcomeBanner.innerHTML = '🎁 <strong>초보자 혜택</strong>: <strong>Stage 2-5</strong>까지 하트 소모 없이 무제한 플레이! 💖';
        container.appendChild(welcomeBanner);

        let currentWorld = 0;
        const worldNames = {
            1: '🍓 WORLD 1 : 모찌 디저트 동산 (4x4 미니)',
            2: '🌸 WORLD 2 : 벚꽃 숲의 오솔길 (6x6 스도쿠)',
            3: '💎 WORLD 3 : 크리스탈 프린세스 캐슬 (9x9 정통)'
        };

        economy.sudokuOrder.forEach((stageId, idx) => {
            const def = economy.sudokuStages[stageId];
            const isUnlocked = economy.state.sudoku.unlockedStages.includes(stageId);
            const clearData = economy.state.sudoku.clearedStages[stageId];
            const isCurrent = economy.state.sudoku.currentStageId === stageId;
            const isFree = economy.isFreePassStage('sudoku', stageId);

            if (def.world !== currentWorld) {
                currentWorld = def.world;
                const header = document.createElement('div');
                header.className = 'world-divider-badge';
                header.textContent = worldNames[currentWorld];
                container.appendChild(header);
            }

            const node = document.createElement('div');
            node.className = `roadmap-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current-active' : ''} ${clearData ? 'cleared' : ''}`;
            const alignClass = idx % 3 === 0 ? 'align-left' : (idx % 3 === 1 ? 'align-center' : 'align-right');
            node.classList.add(alignClass);

            let starsHtml = '';
            const starsCount = clearData ? clearData.stars : 0;
            for (let s = 1; s <= 3; s++) {
                starsHtml += `<span class="star-icon ${s <= starsCount ? 'earned' : 'empty'}">★</span>`;
            }

            node.innerHTML = `
                ${isCurrent ? '<div class="cur-mascot-marker"><span class="marker-speech">여기야! 💖</span><span class="marker-owl">🦉</span></div>' : ''}
                <div class="node-circle">${isUnlocked ? (clearData ? '✓' : idx + 1) : '🔒'}</div>
                <div class="node-details">
                    <div class="node-title">${def.name} ${isFree ? '<span class="freepass-tag">무료✨</span>' : ''}</div>
                    <div class="node-stars">${starsHtml}</div>
                </div>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    soundManager.playStageStart();
                    openSudokuLaunchModal(stageId);
                });
            } else {
                node.addEventListener('click', () => {
                    soundManager.playWrong();
                    mascotManager.setState('sad', '이전 스테이지를 먼저 클리어해야 열려요! 🔒', 2500);
                });
            }
            container.appendChild(node);
        });
    }

    function openSudokuLaunchModal(stageId) {
        const def = economy.sudokuStages[stageId];
        sudokuStageId = stageId;
        sudokuStageDef = def;
        const isFree = economy.isFreePassStage('sudoku', stageId);

        document.getElementById('launch-stage-title').textContent = def.name;
        const descElem = document.getElementById('launch-stage-desc');
        const startBtn = document.getElementById('btn-confirm-start-stage');

        if (isFree) {
            startBtn.innerHTML = '✨ 프리패스로 바로 시작 (하트 0개) 💖';
            descElem.innerHTML = `${def.desc} <br><span style="color:#E25072; font-weight:900; font-size:0.85rem;">🎁 2-5 스테이지까지 하트 소모 없음!</span>`;
        } else {
            startBtn.innerHTML = '💖 하트 1개로 시작하기';
            descElem.textContent = `${def.desc} (목표 시간: ${Math.floor(def.targetTime / 60)}분 ${def.targetTime % 60}초)`;
        }

        const clearData = economy.state.sudoku.clearedStages[stageId];
        document.getElementById('launch-best-record').textContent = clearData ? `최고 기록: ★ ${clearData.stars}개 (${Math.floor(clearData.bestTime / 60)}분 ${clearData.bestTime % 60}초)` : '기록 없음 (★ 0개)';

        startBtn.onclick = () => {
            stageLaunchModal.classList.remove('active');
            soundManager.startBGM();
            launchSudokuGame(stageId);
        };
        stageLaunchModal.classList.add('active');
    }

    function launchSudokuGame(stageId) {
        sudokuStageId = stageId;
        sudokuStageDef = economy.sudokuStages[stageId];
        const isFree = economy.isFreePassStage('sudoku', stageId);

        if (!isFree && economy.state.hearts <= 0) {
            openOutOfHeartsModal('sudoku', () => launchSudokuGame(stageId));
            return;
        }

        economy.consumeHeart('sudoku', stageId);
        showScreen('sudoku-game');

        document.getElementById('ingame-stage-name').textContent = sudokuStageDef.name;
        sudokuMistakes = 0;
        sudokuMistakesText.textContent = `${sudokuMistakes}/3`;
        sudokuSelectedCell = null;
        sudokuIsNoteMode = false;
        sudokuIsPaused = false;
        if (sudokuNoteBtn) sudokuNoteBtn.classList.remove('active');

        const puzzleData = sudokuEngine.generatePuzzle(sudokuStageDef.size, sudokuStageDef.diff);
        sudokuCurrentBoard = puzzleData.puzzle.map(r => [...r]);
        sudokuInitialBoard = puzzleData.initialBoard.map(r => [...r]);
        sudokuSolutionBoard = puzzleData.solution.map(r => [...r]);
        sudokuNotesBoard = Array.from({ length: sudokuStageDef.size }, () => Array.from({ length: sudokuStageDef.size }, () => new Set()));

        sudokuElapsedSeconds = 0;
        if (sudokuTimerInterval) clearInterval(sudokuTimerInterval);
        sudokuTimerInterval = setInterval(() => {
            if (sudokuIsPaused) return;
            sudokuElapsedSeconds++;
            const m = Math.floor(sudokuElapsedSeconds / 60);
            const s = sudokuElapsedSeconds % 60;
            sudokuTimerText.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }, 1000);

        renderSudokuGrid();
        renderSudokuNumpad();
        mascotManager.setState('idle', `화이팅! ${sudokuStageDef.name} 시작이에요! 🌸`);
    }

    function renderSudokuGrid() {
        const size = sudokuStageDef.size;
        sudokuGrid.className = `sudoku-grid size-${size}`;
        sudokuGrid.innerHTML = '';

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                const val = sudokuCurrentBoard[r][c];
                const isGiven = sudokuInitialBoard[r][c] !== 0;

                if (isGiven) {
                    cell.classList.add('given');
                    cell.textContent = val;
                } else if (val !== 0) {
                    cell.textContent = val;
                    if (val !== sudokuSolutionBoard[r][c]) cell.classList.add('error');
                } else {
                    const notes = sudokuNotesBoard[r][c];
                    if (notes.size > 0) {
                        const noteBox = document.createElement('div');
                        noteBox.className = 'cell-notes';
                        for (let n = 1; n <= size; n++) {
                            const noteNum = document.createElement('div');
                            noteNum.className = 'note-num';
                            if (notes.has(n)) noteNum.textContent = n;
                            noteBox.appendChild(noteNum);
                        }
                        cell.appendChild(noteBox);
                    }
                }
                cell.addEventListener('click', () => onSudokuCellClicked(r, c));
                sudokuGrid.appendChild(cell);
            }
        }
        updateSudokuHighlights();
    }

    function onSudokuCellClicked(r, c) {
        soundManager.playTileSelect();
        sudokuSelectedCell = { r, c };
        updateSudokuHighlights();
        mascotManager.setState('thinking', '음... 여기에 어떤 숫자가 들어갈까요? 💭');
    }

    function updateSudokuHighlights() {
        const cells = sudokuGrid.querySelectorAll('.sudoku-cell');
        const config = sudokuEngine.getConfig(sudokuStageDef.size);
        const selVal = sudokuSelectedCell ? sudokuCurrentBoard[sudokuSelectedCell.r][sudokuSelectedCell.c] : null;

        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            cell.classList.remove('selected', 'highlighted', 'same-number');
            if (!sudokuSelectedCell) return;

            if (r === sudokuSelectedCell.r && c === sudokuSelectedCell.c) cell.classList.add('selected');
            const sameRow = r === sudokuSelectedCell.r;
            const sameCol = c === sudokuSelectedCell.c;
            const sameBox = Math.floor(r / config.boxRows) === Math.floor(sudokuSelectedCell.r / config.boxRows) && Math.floor(c / config.boxCols) === Math.floor(sudokuSelectedCell.c / config.boxCols);
            if (sameRow || sameCol || sameBox) cell.classList.add('highlighted');
            if (selVal && sudokuCurrentBoard[r][c] !== 0 && sudokuCurrentBoard[r][c] === selVal) cell.classList.add('same-number');
        });
    }

    function renderSudokuNumpad() {
        const size = sudokuStageDef.size;
        sudokuNumpad.innerHTML = '';
        for (let n = 1; n <= size; n++) {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.textContent = n;
            btn.addEventListener('click', () => handleSudokuNumberInput(n));
            sudokuNumpad.appendChild(btn);
        }
    }

    function handleSudokuNumberInput(num) {
        if (!sudokuSelectedCell) return;
        const { r, c } = sudokuSelectedCell;
        if (sudokuInitialBoard[r][c] !== 0) return;

        if (sudokuIsNoteMode) {
            soundManager.playTileSelect();
            if (sudokuNotesBoard[r][c].has(num)) sudokuNotesBoard[r][c].delete(num);
            else sudokuNotesBoard[r][c].add(num);
            renderSudokuGrid();
            return;
        }

        if (num === sudokuSolutionBoard[r][c]) {
            soundManager.playMatchCombo(1);
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.45, 14);
            sudokuCurrentBoard[r][c] = num;
            sudokuNotesBoard[r][c].clear();
            renderSudokuGrid();
            mascotManager.setState('happy', '정답이에요! 똑똑한 당신 최고! 💖', 2500);

            checkSudokuLineComplete(r, c);
            checkSudokuVictory();
        } else {
            soundManager.playWrong();
            sudokuMistakes++;
            sudokuMistakesText.textContent = `${sudokuMistakes}/3`;
            sudokuCurrentBoard[r][c] = num;
            renderSudokuGrid();
            mascotManager.setState('sad', '앗! 겹치는 숫자가 있어요! 💧', 2500);
            if (sudokuMistakes >= 3) {
                alert('실수를 3번 하여 게임이 종료되었습니다! 🥺');
                showScreen('sudoku-lobby');
            }
        }
    }

        function checkSudokuVictory() {
        const size = sudokuStageDef.size;
        let isComplete = true;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (Number(sudokuCurrentBoard[i][j]) !== Number(sudokuSolutionBoard[i][j]) || sudokuCurrentBoard[i][j] === 0) {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }
        if (isComplete) {
            setTimeout(() => {
                triggerEuphoricVictory('sudoku', sudokuStageId);
            }, 250);
        }
    }

    function checkSudokuLineComplete(r, c) {
        const size = sudokuStageDef.size;
        let rowFull = true;
        for (let i = 0; i < size; i++) {
            if (sudokuCurrentBoard[r][i] !== sudokuSolutionBoard[r][i]) { rowFull = false; break; }
        }
        if (rowFull) {
            soundManager.playLineComplete();
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.4, 20);
        }
    }

    // ==========================================
    // 3. KAWAII 썸링크 (SUMLINK) CONTROLLER
    // ==========================================
    let makeSumStageId = '1-1';
    let makeSumStageDef = null;
    let makeSumCells = [];
    let makeSumSelectedIndices = [];
    let makeSumScore = 0;
    let makeSumCombo = 0;
    let makeSumLastMatchTime = 0;
    let makeSumComboResetTimer = null;
    const COMBO_WINDOW_MS = 3000; // 3초 이내 연속 매칭 시에만 콤보 유지!
    let makeSumIsTimeAttack = false;
    let makeSumTimeRemaining = 0;

    function spawnFloatingText(text, targetElem) {
        if (!targetElem) return;
        const rect = targetElem.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'floating-time-bonus';
        el.textContent = text;
        el.style.left = `${rect.left + rect.width / 2}px`;
        el.style.top = `${rect.top - 10}px`;
        document.body.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1100);
    }

    let makeSumTimerInterval = null;
    let makeSumElapsedSeconds = 0;
    let makeSumIsPaused = false;
    let makeSumItemMode = null;
    let makeSumUndoStack = [];

    const makeSumGrid = document.getElementById('makesum-grid');
    const makeSumLineCanvas = document.getElementById('makesum-line-canvas');
    const makeSumLineCtx = makeSumLineCanvas ? makeSumLineCanvas.getContext('2d') : null;
    const makeSumStageTitleElem = document.getElementById('ms-stage-title');
    const makeSumTargetValElem = document.getElementById('ms-target-val');
    const makeSumLiveFormulaElem = document.getElementById('ms-live-sum-formula');
    const makeSumLivePillElem = document.getElementById('ms-live-sum-pill');
    const makeSumScoreElem = document.getElementById('ms-score-val');
    const makeSumTimerElem = document.getElementById('ms-timer-val');

    function resizeMakeSumCanvas() {
        if (makeSumLineCanvas && makeSumGrid) {
            makeSumLineCanvas.width = makeSumGrid.clientWidth;
            makeSumLineCanvas.height = makeSumGrid.clientHeight;
        }
    }
    window.addEventListener('resize', resizeMakeSumCanvas);

    // 공용 실패 모달: '아깝다' 메시지 + 광고 보고 이어하기(판당 1회) + 재도전/나가기
    function openTimeOverModal({ title, desc, continueLabel, onContinue, onRetry, onExit }) {
        const modal = document.getElementById('timeover-modal');
        if (!modal) return;
        document.getElementById('timeover-title').textContent = title || 'TIME OVER! ⏰';
        document.getElementById('timeover-desc').innerHTML = desc || '아깝다! 조금만 더 하면 깰 수 있었어요 💧';
        const adBtn = document.getElementById('btn-timeover-ad');
        if (adBtn) {
            adBtn.style.display = onContinue && !continueAdUsed ? '' : 'none';
            adBtn.textContent = continueLabel || '🎬 광고 보고 +30초 이어하기';
            adBtn.onclick = () => {
                let rewarded = false;
                adMobManager.showRewardedVideo('continue', () => { rewarded = true; continueAdUsed = true; }, () => {
                    if (!rewarded) return;
                    modal.classList.remove('active');
                    onContinue();
                });
            };
        }
        document.getElementById('btn-timeover-retry').onclick = () => { modal.classList.remove('active'); onRetry(); };
        document.getElementById('btn-timeover-exit').onclick = () => { modal.classList.remove('active'); onExit(); };
        modal.classList.add('active');
    }

    function openMakeSumTimeOverModal() {
        soundManager.playWrong();
        mascotManager.setState('sad', '시간이 다 되었어요! ⏰ 조금만 더 서두르면 깰 수 있어요! 💧', 4000);
        openTimeOverModal({
            desc: `아깝다! 지금 점수 <b>${makeSumScore.toLocaleString()}점</b> 💧<br>30초만 더 있으면 깰 수 있어요!`,
            onContinue: () => { makeSumTimeRemaining += 30; makeSumIsPaused = false; },
            onRetry: () => launchMakeSumGame(makeSumStageId),
            onExit: () => { clearInterval(makeSumTimerInterval); showScreen('makesum-lobby'); }
        });
    }

    function renderMakeSumRoadmap() {
        const container = document.getElementById('makesum-stages-list');
        if (!container) return;
        container.innerHTML = '';

        const banner = document.createElement('div');
        banner.className = 'welcome-freepass-banner';
        banner.innerHTML = '✨ <strong>하루 3회 무료 힐링 플레이</strong> (2~3개 숫자를 이어 목표 합을 달성하세요! 💖)';
        container.appendChild(banner);

        let currentWorld = 0;
        const worldNames = {
            1: '🍓 WORLD 1 : 달콤 디저트 (힐링 모드 • 목표 합: 10 ~ 12 🎯)',
            2: '🌸 WORLD 2 : 벚꽃 숲의 멜로디 (⚡ 타임어택 80초 • 목표 합: 10 ~ 13 🎯)',
            3: '💎 WORLD 3 : 크리스탈 팰리스 (⚡ 타임어택 70초 • 목표 합: 10 ~ 14 🎯)',
            4: '🌌 WORLD 4 : 은하수 마스터 (⚡ 하이퍼 타임어택 60초 • 목표 합: 10 ~ 15 🎯)'
        };

        makeSumEngine.stageOrder.forEach((stageId, idx) => {
            const def = makeSumEngine.stageConfigs[stageId];
            const isUnlocked = economy.state.makesum.unlockedStages.includes(stageId);
            const clearData = economy.state.makesum.clearedStages[stageId];
            const isCurrent = economy.state.makesum.currentStageId === stageId;

            if (def.world !== currentWorld) {
                currentWorld = def.world;
                const header = document.createElement('div');
                header.className = 'world-divider-badge';
                header.textContent = worldNames[currentWorld];
                container.appendChild(header);
            }

            const node = document.createElement('div');
            node.className = `roadmap-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current-active' : ''} ${clearData ? 'cleared' : ''}`;
            const alignClass = idx % 3 === 0 ? 'align-left' : (idx % 3 === 1 ? 'align-center' : 'align-right');
            node.classList.add(alignClass);

            let starsHtml = '';
            const starsCount = clearData ? clearData.stars : 0;
            for (let s = 1; s <= 3; s++) {
                starsHtml += `<span class="star-icon ${s <= starsCount ? 'earned' : 'empty'}">★</span>`;
            }

            node.innerHTML = `
                ${isCurrent ? '<div class="cur-mascot-marker"><span class="marker-speech">여기야! 💖</span><span class="marker-owl">🦉</span></div>' : ''}
                <div class="node-circle">${isUnlocked ? (clearData ? '✓' : idx + 1) : '🔒'}</div>
                <div class="node-details">
                    <div class="node-title">${def.name} ${def.isTimeAttack ? `<span class="target-chip" style="background:#FEE2E2; color:#DC2626; border-color:#FCA5A5;">⚡ ${def.timeLimit}s • 목표 ${def.target}</span>` : `<span class="target-chip">목표 ${def.target}</span>`}</div>
                    <div class="node-stars">${starsHtml}</div>
                </div>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    soundManager.playStageStart();
                    openMakeSumLaunchModal(stageId);
                });
            } else {
                node.addEventListener('click', () => {
                    soundManager.playWrong();
                    mascotManager.setState('sad', '이전 스테이지를 먼저 클리어해야 열려요! 🔒', 2500);
                });
            }
            container.appendChild(node);
        });
    }

    function openMakeSumLaunchModal(stageId) {
        const def = makeSumEngine.stageConfigs[stageId];
        makeSumStageId = stageId;
        makeSumStageDef = def;

        document.getElementById('launch-stage-title').textContent = def.name;
        const descElem = document.getElementById('launch-stage-desc');
        const startBtn = document.getElementById('btn-confirm-start-stage');

        startBtn.innerHTML = `💖 썸링크 1회 소모 (남은 횟수: ${economy.state.sumlinkHearts}/3)`;
        const modeBadge = def.isTimeAttack
            ? `<span style="background:#EF4444; color:#FFF; padding:2px 8px; border-radius:8px; font-weight:900; font-size:0.82rem; margin-left:6px;">⚡ 타임어택 ${def.timeLimit}초</span>`
            : `<span style="background:#10B981; color:#FFF; padding:2px 8px; border-radius:8px; font-weight:900; font-size:0.82rem; margin-left:6px;">🌸 힐링 모드</span>`;
        descElem.innerHTML = `${def.desc} <br><span style="color:#FF4D80; font-weight:900; font-size:1.05rem;">🎯 목표 합: <strong>${def.target}</strong> (2~3개 연결)</span> ${modeBadge}`;

        const clearData = economy.state.makesum.clearedStages[stageId];
        if (clearData) {
            const m = Math.floor((clearData.bestTime || 0) / 60);
            const s = (clearData.bestTime || 0) % 60;
            const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            document.getElementById('launch-best-record').textContent = `최고 기록: ★ ${clearData.stars}개 (${clearData.score.toLocaleString()}점 • ⏱️ ${timeStr})`;
        } else {
            document.getElementById('launch-best-record').textContent = '기록 없음 (★ 0개)';
        }

        startBtn.onclick = () => {
            stageLaunchModal.classList.remove('active');
            soundManager.startBGM();
            launchMakeSumGame(stageId);
        };
        stageLaunchModal.classList.add('active');
    }

    function launchMakeSumGame(stageId) {
        makeSumStageId = stageId;
        makeSumStageDef = makeSumEngine.stageConfigs[stageId];

        if (economy.state.sumlinkHearts <= 0) {
            openOutOfHeartsModal('makesum', () => launchMakeSumGame(stageId));
            return;
        }

        economy.consumeHeart('makesum', stageId);
        showScreen('makesum-game');

        makeSumScore = 0;
        makeSumCombo = 0;
        makeSumLastMatchTime = 0;
        if (makeSumComboResetTimer) { clearTimeout(makeSumComboResetTimer); makeSumComboResetTimer = null; }
        makeSumSelectedIndices = [];
        makeSumItemMode = null;
        makeSumUndoStack = [];
        makeSumIsPaused = false;

        makeSumStageTitleElem.textContent = makeSumStageDef.name;
        if (makeSumTargetValElem) makeSumTargetValElem.textContent = makeSumStageDef.target;
        if (makeSumLiveFormulaElem) makeSumLiveFormulaElem.textContent = '2개 또는 3개의 숫자를 연결하세요! 🌸';
        if (makeSumLivePillElem) makeSumLivePillElem.className = 'target-live-sum-pill';
        makeSumScoreElem.textContent = '0';

        const generated = makeSumEngine.generateBoard(stageId);
        makeSumCells = generated.cells;

        makeSumIsTimeAttack = Boolean(makeSumStageDef.isTimeAttack);
        makeSumTimeRemaining = makeSumStageDef.timeLimit || 0;
        makeSumElapsedSeconds = 0;
        if (makeSumTimerInterval) clearInterval(makeSumTimerInterval);

        if (makeSumIsTimeAttack) {
            const tm = Math.floor(makeSumTimeRemaining / 60);
            const ts = makeSumTimeRemaining % 60;
            makeSumTimerElem.textContent = `${String(tm).padStart(2, '0')}:${String(ts).padStart(2, '0')}`;
        } else {
            makeSumTimerElem.classList.remove('timer-danger');
            makeSumTimerElem.textContent = '00:00';
        }

        makeSumTimerInterval = setInterval(() => {
            if (makeSumIsPaused) return;
            makeSumElapsedSeconds++;
            let timerM, timerS;
            if (makeSumIsTimeAttack) {
                makeSumTimeRemaining--;
                if (makeSumTimeRemaining < 0) makeSumTimeRemaining = 0;
                timerM = Math.floor(makeSumTimeRemaining / 60);
                timerS = makeSumTimeRemaining % 60;
                makeSumTimerElem.textContent = `${String(timerM).padStart(2, '0')}:${String(timerS).padStart(2, '0')}`;
                if (makeSumTimeRemaining <= 15) {
                    makeSumTimerElem.classList.add('timer-danger');
                } else {
                    makeSumTimerElem.classList.remove('timer-danger');
                }
                if (makeSumTimeRemaining <= 0) {
                    makeSumIsPaused = true;
                    openMakeSumTimeOverModal();
                }
            } else {
                makeSumTimerElem.classList.remove('timer-danger');
                timerM = Math.floor(makeSumElapsedSeconds / 60);
                timerS = makeSumElapsedSeconds % 60;
                makeSumTimerElem.textContent = `${String(timerM).padStart(2, '0')}:${String(timerS).padStart(2, '0')}`;
            }
        }, 1000);

        renderMakeSumGrid();
        setTimeout(resizeMakeSumCanvas, 100);
        updateMakeSumItemBadges();

        mascotManager.setState('idle', `썸링크 시작! 숫자 2~3개를 이어 목표 합 ${makeSumStageDef.target} 만들기! 🌸`, 3000); checkMakeSumNoMoreMoves();
    }

    function updateMakeSumItemBadges() {
        const isFreeAdd = makeSumCells.length < (makeSumEngine.maxFreeRows * makeSumEngine.cols);
        const addBadge = document.getElementById('badge-ms-add');
        if (addBadge) {
            if (isFreeAdd) {
                addBadge.textContent = 'FREE';
                addBadge.className = 'item-badge badge-free';
            } else {
                addBadge.textContent = economy.state.makesum.items.adds;
                addBadge.className = 'item-badge';
            }
        }
        document.getElementById('badge-ms-hint').textContent = economy.state.makesum.items.hints;
        document.getElementById('badge-ms-bomb').textContent = economy.state.makesum.items.bombs;
        }

    function renderMakeSumGrid() {
        makeSumGrid.innerHTML = '';
        makeSumCells.forEach((cell, idx) => {
            const tile = document.createElement('div');
            const isSelected = makeSumSelectedIndices.includes(idx);
            tile.className = `makesum-tile ${cell.cleared ? 'cleared' : ''} ${isSelected ? 'selected' : ''}`;
            tile.dataset.idx = idx;
            if (!cell.cleared) {
                tile.textContent = cell.val;
            }
            tile.addEventListener('click', () => onMakeSumTileClick(idx, tile));
            makeSumGrid.appendChild(tile);
        });
        resizeMakeSumCanvas();
    }

            function triggerComboPopup(title, points, animClass, combo) {
        const popup = document.getElementById('ms-combo-popup');
        if (popup) {
            popup.textContent = `${title} (+${points}점)`;
            popup.className = `combo-popup-banner ${animClass}`;
            setTimeout(() => {
                if (popup) popup.className = 'combo-popup-banner';
            }, 1100);
        }

        if (combo >= 3) {
            particleSystem.spawnFireworks(2);
            if (appWrapper) {
                appWrapper.classList.add('euphoria-screen-glow');
                setTimeout(() => { if (appWrapper) appWrapper.classList.remove('euphoria-screen-glow'); }, 1000);
            }
        }
    }

    function onMakeSumTileClick(idx, tileElem) {
        if (idx >= makeSumCells.length || makeSumCells[idx].cleared) return;

        // 1. Bomb Item Mode
        if (makeSumItemMode === 'bomb') {
            triggerBombAt(idx);
            makeSumItemMode = null;
            return;
        }

        soundManager.playTileSelect();

        // 3. Deselect if already selected
        if (makeSumSelectedIndices.includes(idx)) {
            makeSumSelectedIndices = makeSumSelectedIndices.filter(i => i !== idx);
            renderMakeSumGrid();
            drawMultiBeams();
            updateLiveFormula();
            return;
        }

        makeSumSelectedIndices.push(idx);

        if (makeSumSelectedIndices.length === 1) {
            renderMakeSumGrid();
            updateLiveFormula();
            mascotManager.setState('thinking', `${makeSumCells[idx].val}에 이어질 다음 숫자를 연결하세요! 💭`, 2000);
            return;
        }

        const evalResult = makeSumEngine.evaluateSelection(makeSumSelectedIndices, makeSumCells, makeSumStageDef.target);

        if (evalResult && evalResult.valid === true) {
            // STRICT SUCCESSFUL MATCH (Sum == Target)
            drawMultiBeams(evalResult);

            const now = Date.now();
            if (makeSumLastMatchTime > 0 && (now - makeSumLastMatchTime) <= COMBO_WINDOW_MS) {
                // 3초 이내에 연속으로 바로 풀었을 때만 콤보 증가!
                makeSumCombo++;
            } else {
                // 3초가 넘었거나 첫 성공일 때는 콤보 1부터 시작
                makeSumCombo = 1;
            }
            makeSumLastMatchTime = now;

            // 3초 후 콤보 자동 소멸 타이머 시작
            if (makeSumComboResetTimer) clearTimeout(makeSumComboResetTimer);
            makeSumComboResetTimer = setTimeout(() => {
                makeSumCombo = 0;
                makeSumLastMatchTime = 0;
            }, COMBO_WINDOW_MS);

            soundManager.playMatchCombo(makeSumCombo);

            const is3Tiles = makeSumSelectedIndices.length === 3;
            let basePoints = is3Tiles ? 250 : 100;
            let comboBonus = 0;
            let comboMultiplier = 1.0;
            let comboTitle = '';
            let comboAnimClass = '';

            if (makeSumCombo === 1) {
                comboMultiplier = 1.0;
                comboBonus = 0;
            } else if (makeSumCombo === 2) {
                comboMultiplier = 1.5;
                comboBonus = 50;
                comboTitle = '🔥 2 COMBO!';
                comboAnimClass = 'active-combo-2';
            } else if (makeSumCombo === 3) {
                comboMultiplier = 2.0;
                comboBonus = 300; // ⚡ 3연속 콤보 대박 보너스!
                comboTitle = '⚡ 3 MEGA COMBO!';
                comboAnimClass = 'active-combo-3';
            } else {
                comboMultiplier = 2.5;
                comboBonus = 500; // 👑 슈퍼 피버 보너스!
                comboTitle = `👑 ${makeSumCombo} SUPER FEVER!`;
                comboAnimClass = 'active-combo-fever';
            }

            const points = Math.round(basePoints * comboMultiplier) + comboBonus;
            makeSumScore += points;
            makeSumScoreElem.textContent = makeSumScore.toLocaleString();

            if (makeSumIsTimeAttack) {
                const bonusSeconds = makeSumCombo >= 3 ? 6 : (makeSumCombo >= 2 ? 4 : 3);
                makeSumTimeRemaining += bonusSeconds;
                const tm = Math.floor(makeSumTimeRemaining / 60);
                const ts = makeSumTimeRemaining % 60;
                makeSumTimerElem.textContent = `${String(tm).padStart(2, '0')}:${String(ts).padStart(2, '0')}`;
                spawnFloatingText(`+${bonusSeconds}s ⏳`, makeSumTimerElem);
            }

            if (makeSumCombo >= 2) {
                triggerComboPopup(comboTitle, points, comboAnimClass, makeSumCombo);
            }

            if (makeSumLiveFormulaElem) {
                const formula = makeSumSelectedIndices.map(i => makeSumCells[i].val).join(' + ');
                const comboTag = makeSumCombo >= 2 ? ` [${comboTitle}]` : '';
                makeSumLiveFormulaElem.textContent = `🎉 [ ${formula} = ${evalResult.sum} 🎯 성공! (+${points}점)${comboTag} ]`;
            }
            if (makeSumLivePillElem) makeSumLivePillElem.className = 'target-live-sum-pill pill-success';

            makeSumSelectedIndices.forEach(ti => {
                const rect = makeSumGrid.children[ti].getBoundingClientRect();
                const sparkCount = makeSumCombo >= 3 ? 24 : 14;
                particleSystem.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, sparkCount);
                makeSumGrid.children[ti].classList.add('pop-out');
            });

            const matchedIndices = [...makeSumSelectedIndices];
            makeSumUndoStack.push({
                type: 'match',
                indices: matchedIndices,
                values: matchedIndices.map(i => makeSumCells[i].val),
                score: points
            });

            setTimeout(() => {
                matchedIndices.forEach(i => { makeSumCells[i].cleared = true; });
                makeSumSelectedIndices = [];
                renderMakeSumGrid();
                clearConnectionLine();
                updateLiveFormula();

                if (makeSumCombo === 2) {
                    mascotManager.setState('happy', `멋져요! 2연속 썸링크 콤보! 🔥✨ (+${points}점)`, 2200);
                } else if (makeSumCombo === 3) {
                    mascotManager.setState('cheer', `대단해요! 3연속 메가 콤보 대폭발!! ⚡👑💖 (+${points}점)`, 2600);
                } else if (makeSumCombo >= 4) {
                    mascotManager.setState('cheer', `멈출 수 없는 두뇌 천재! ${makeSumCombo}연속 슈퍼 피버!! 🌟🔥👑 (+${points}점)`, 3000);
                } else {
                    mascotManager.setState('happy', is3Tiles ? `3단 썸링크 대성공! 💖 (+${points}점)` : '썸링크 성공! ✨ (+100점)', 2000);
                }

                checkMakeSumVictory();
                checkMakeSumNoMoreMoves();
            }, 260);

        } else if (evalResult && evalResult.valid === 'partial') {
            drawMultiBeams(evalResult);
            renderMakeSumGrid();
            updateLiveFormula();
            mascotManager.setState('thinking', `현재 합: ${evalResult.sum} (목표 ${makeSumStageDef.target}까지 ${evalResult.remaining} 남음!) 3번째 숫자를 터치하세요! 💡`, 2500);

        } else {
            soundManager.playWrong();
            tileElem.classList.add('shake');
            makeSumCombo = 0;
            makeSumLastMatchTime = 0;
            if (makeSumComboResetTimer) { clearTimeout(makeSumComboResetTimer); makeSumComboResetTimer = null; }
        makeSumLastMatchTime = 0;
        if (makeSumComboResetTimer) { clearTimeout(makeSumComboResetTimer); makeSumComboResetTimer = null; }
            if (makeSumLiveFormulaElem) makeSumLiveFormulaElem.textContent = '❌ 길이 막혔거나 목표 합과 맞지 않아요!';
            if (makeSumLivePillElem) makeSumLivePillElem.className = 'target-live-sum-pill';

            setTimeout(() => {
                makeSumSelectedIndices = [];
                renderMakeSumGrid();
                clearConnectionLine();
                updateLiveFormula();
            }, 400);
            mascotManager.setState('sad', '길이 막혔거나 합이 맞지 않아요! 💧', 2000);
        }
    }

    function updateLiveFormula() {
        if (!makeSumLiveFormulaElem) return;
        if (makeSumSelectedIndices.length === 0) {
            makeSumLiveFormulaElem.textContent = '2개 또는 3개의 숫자를 연결하세요! 🌸';
            if (makeSumLivePillElem) makeSumLivePillElem.className = 'target-live-sum-pill';
        } else {
            const vals = makeSumSelectedIndices.map(i => makeSumCells[i].val);
            const sum = vals.reduce((a, b) => a + b, 0);
            const formula = vals.join(' + ');
            const diff = makeSumStageDef.target - sum;
            if (diff > 0) {
                makeSumLiveFormulaElem.textContent = `[ ${formula} = ${sum} ] ➔ 목표까지 ${diff} 남음!`;
            } else if (diff === 0) {
                makeSumLiveFormulaElem.textContent = `🎯 [ ${formula} = ${sum} ] 정답 완성!`;
            } else {
                makeSumLiveFormulaElem.textContent = `[ ${formula} = ${sum} ] ➔ 목표(${makeSumStageDef.target}) 초과!`;
            }
            if (makeSumLivePillElem) makeSumLivePillElem.className = 'target-live-sum-pill pill-active';
        }
    }

    function drawMultiBeams(evalResult = null) {
        if (!makeSumLineCtx || !makeSumLineCanvas || makeSumSelectedIndices.length < 2) {
            clearConnectionLine();
            return;
        }

        const gridRect = makeSumGrid.getBoundingClientRect();
        const cols = makeSumEngine.cols;
        const cellW = gridRect.width / cols;
        const cellH = cellW;

        makeSumLineCtx.clearRect(0, 0, makeSumLineCanvas.width, makeSumLineCanvas.height);
        makeSumLineCtx.save();
        makeSumLineCtx.strokeStyle = '#FF4D80';
        makeSumLineCtx.lineWidth = 5.5;
        makeSumLineCtx.lineCap = 'round';
        makeSumLineCtx.lineJoin = 'round';
        makeSumLineCtx.shadowColor = '#FF8DA1';
        makeSumLineCtx.shadowBlur = 14;

        makeSumLineCtx.beginPath();

        const points = [];
        if (evalResult && evalResult.connections) {
            evalResult.connections.forEach(conn => {
                if (conn && conn.path) {
                    conn.path.forEach(pt => {
                        const px = (pt.c + 0.5) * cellW;
                        const py = (pt.r + 0.5) * cellH;
                        points.push({ x: px, y: py });
                    });
                }
            });
        }

        if (points.length >= 2) {
            makeSumLineCtx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                makeSumLineCtx.lineTo(points[i].x, points[i].y);
            }
        } else {
            makeSumSelectedIndices.forEach((idx, i) => {
                const el = makeSumGrid.children[idx];
                if (!el) return;
                const r = el.getBoundingClientRect();
                const x = r.left - gridRect.left + r.width / 2;
                const y = r.top - gridRect.top + r.height / 2;
                if (i === 0) makeSumLineCtx.moveTo(x, y);
                else makeSumLineCtx.lineTo(x, y);
            });
        }

        makeSumLineCtx.stroke();
        makeSumLineCtx.restore();
    }

    function clearConnectionLine() {
        if (makeSumLineCtx && makeSumLineCanvas) {
            makeSumLineCtx.clearRect(0, 0, makeSumLineCanvas.width, makeSumLineCanvas.height);
        }
    }

    
    function checkMakeSumNoMoreMoves() {
        const activeCount = makeSumCells.filter(c => !c.cleared).length;
        if (activeCount === 0) return;

        const validMoves = makeSumEngine.findAllValidMoves(makeSumCells, makeSumStageDef.target);
        const addBtn = document.getElementById('btn-ms-add');

        if (validMoves.length === 0) {
            if (makeSumLiveFormulaElem) {
                makeSumLiveFormulaElem.innerHTML = '⚠️ <strong>더 이상 연결할 숫자가 없어요!</strong> [숫자 추가 ➕]를 눌러보세요! 💡';
            }
            if (makeSumLivePillElem) {
                makeSumLivePillElem.className = 'target-live-sum-pill pill-warning';
            }
            if (addBtn) {
                addBtn.classList.add('item-btn-pulse');
            }
            mascotManager.setState('thinking', '더 이상 연결할 수 있는 숫자가 없어요! ➕ 숫자 추가를 눌러 새로운 짝꿍을 불러와요! 💡', 4000);
        } else {
            if (addBtn) {
                addBtn.classList.remove('item-btn-pulse');
            }
            if (makeSumSelectedIndices.length === 0) {
                if (makeSumLiveFormulaElem) makeSumLiveFormulaElem.textContent = '2개 또는 3개의 숫자를 연결하세요! 🌸';
                if (makeSumLivePillElem) makeSumLivePillElem.className = 'target-live-sum-pill';
            }
        }
    }

    function checkMakeSumVictory() {
        const remaining = makeSumCells.filter(c => !c.cleared).length;
        if (remaining === 0) {
            triggerEuphoricVictory('makesum', makeSumStageId);
        }
    }

    // ==========================================
    // 🌟 ULTIMATE EUPHORIC STAGE CLEAR SEQUENCE
    // ==========================================
    function triggerEuphoricVictory(gameType, stageId) {
        if (sudokuTimerInterval) clearInterval(sudokuTimerInterval);
        if (makeSumTimerInterval) clearInterval(makeSumTimerInterval);
        if (wordHuntTimerInterval) clearInterval(wordHuntTimerInterval);
        if (sichuanTimerInterval) clearInterval(sichuanTimerInterval);

        soundManager.playVictory();
        particleSystem.spawnFireworks(6);
        particleSystem.spawnMassiveConfetti(100);
        particleSystem.spawnGemShower(60);

        if (appWrapper) {
            appWrapper.classList.remove('euphoria-screen-glow');
            void appWrapper.offsetWidth;
            appWrapper.classList.add('euphoria-screen-glow');
        }

                let res;
        function formatClearTime(sec) {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        const scoreElem = document.getElementById('clear-score-val');
        const scoreLbl = document.getElementById('clear-score-lbl');
        const timeElem = document.getElementById('clear-time-val');
        const timeLbl = document.getElementById('clear-time-lbl');

        if (gameType === 'sudoku') {
            res = economy.completeSudokuStage(stageId, sudokuElapsedSeconds, sudokuMistakes);
            if (timeElem) timeElem.textContent = formatClearTime(sudokuElapsedSeconds);
            if (timeLbl) timeLbl.textContent = '소요 시간 ⏱️';
            if (scoreElem) scoreElem.textContent = sudokuMistakes === 0 ? '노미스 🏆' : `실수 ${sudokuMistakes}회`;
            if (scoreLbl) scoreLbl.textContent = '플레이 성과';
        } else if (gameType === 'sichuan') {
            res = economy.completeSichuanStage(stageId, sichuanScore, sichuanElapsedSeconds, sichuanEngine.stageOrder);
            if (timeElem) timeElem.textContent = formatClearTime(sichuanElapsedSeconds);
            if (timeLbl) timeLbl.textContent = '소요 시간 ⏱️';
            if (scoreElem) scoreElem.textContent = `${sichuanScore.toLocaleString()}점`;
            if (scoreLbl) scoreLbl.textContent = '최종 점수 ⭐';
        } else if (gameType === 'wordhunt') {
            res = economy.completeWordHuntStage(stageId, wordHuntScore, wordHuntElapsedSeconds, wordHuntEngine.stageOrder);
            if (timeElem) timeElem.textContent = formatClearTime(wordHuntElapsedSeconds);
            if (timeLbl) timeLbl.textContent = '소요 시간 ⏱️';
            if (scoreElem) scoreElem.textContent = `${wordHuntScore.toLocaleString()}점`;
            if (scoreLbl) scoreLbl.textContent = '최종 점수 ⭐';
        } else {
            res = economy.completeMakeSumStage(stageId, makeSumScore, makeSumElapsedSeconds, makeSumEngine.stageOrder);
            if (timeElem) timeElem.textContent = formatClearTime(makeSumElapsedSeconds);
            if (timeLbl) timeLbl.textContent = '소요 시간 ⏱️';
            if (scoreElem) scoreElem.textContent = `${makeSumScore.toLocaleString()}점`;
            if (scoreLbl) scoreLbl.textContent = '최종 점수 ⭐';
        }
        const gemsValElem = document.getElementById('clear-gems-val');
        // 변동 보상(럭키 보너스): 가끔 터지는 추가 보석이 '한 판 더'의 기대감을 만든다
        let luckyGems = 0;
        if (Math.random() < 0.3) {
            luckyGems = 5 + Math.floor(Math.random() * 16);
            economy.addGems(luckyGems);
            setTimeout(() => mascotManager.setState('happy', `🍀 럭키 보너스 당첨! 보석 +${luckyGems}개 추가! 🍀`, 3500), 1900);
        }
        let totalGems = res.rewardGems + luckyGems;
        gemsValElem.textContent = luckyGems ? `+${totalGems} 💎 🍀` : `+${totalGems} 💎`;
        updateHeaderStats();

        const doubleBtn = document.getElementById('btn-clear-double-ad');
        if (doubleBtn) {
            doubleBtn.style.display = res.rewardGems > 0 ? '' : 'none';
            doubleBtn.textContent = `🎬 광고 보고 보석 2배! (+${res.rewardGems} 💎)`;
            doubleBtn.onclick = () => {
                adMobManager.showRewardedVideo('double', () => {
                    economy.addGems(res.rewardGems);
                    totalGems += res.rewardGems;
                    gemsValElem.textContent = `+${totalGems} 💎 x2`;
                    doubleBtn.style.display = 'none';
                    updateHeaderStats();
                });
            };
        }

        const starContainer = document.getElementById('clear-stars-display');
        starContainer.innerHTML = `
            <span class="star-slam-anim" id="slam-star-1">⭐</span>
            <span class="star-slam-anim" id="slam-star-2">⭐</span>
            <span class="star-slam-anim" id="slam-star-3">⭐</span>
        `;

        clearModal.classList.add('active');

        setTimeout(() => {
            if (res.stars >= 1) {
                soundManager.playStarSlam(1);
                document.getElementById('slam-star-1').classList.add('slammed');
                particleSystem.spawnSparkles(window.innerWidth / 2 - 40, window.innerHeight * 0.42, 16);
            }
        }, 400);

        setTimeout(() => {
            if (res.stars >= 2) {
                soundManager.playStarSlam(2);
                document.getElementById('slam-star-2').classList.add('slammed');
                particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.42, 20);
            }
        }, 900);

        setTimeout(() => {
            if (res.stars >= 3) {
                soundManager.playStarSlam(3);
                document.getElementById('slam-star-3').classList.add('slammed');
                particleSystem.spawnSparkles(window.innerWidth / 2 + 40, window.innerHeight * 0.42, 30);
                mascotManager.setState('happy', '와아아아! 3스타 완벽 클리어!! 당신은 브레인 챔피언! 👑💖🎉', 5000);
            }
        }, 1400);

        const nextBtn = document.getElementById('btn-next-stage');
        if (res.nextStageId) {
            nextBtn.textContent = '다음 스테이지로 💖';
            nextBtn.onclick = () => {
                clearModal.classList.remove('active');
                if (gameType === 'sudoku') launchSudokuGame(res.nextStageId);
                else if (gameType === 'sichuan') launchSichuanGame(res.nextStageId);
                else if (gameType === 'wordhunt') launchWordHuntGame(res.nextStageId);
                else launchMakeSumGame(res.nextStageId);
            };
        } else {
            nextBtn.textContent = '로드맵으로 나가기 🌸';
            nextBtn.onclick = () => {
                clearModal.classList.remove('active');
                if (gameType === 'sudoku') showScreen('sudoku-lobby');
                else if (gameType === 'sichuan') showScreen('sichuan-lobby');
                else if (gameType === 'wordhunt') showScreen('wordhunt-lobby');
                else showScreen('makesum-lobby');
            };
        }
        document.getElementById('btn-clear-to-map').onclick = () => {
            clearModal.classList.remove('active');
            if (gameType === 'sudoku') showScreen('sudoku-lobby');
            else if (gameType === 'sichuan') showScreen('sichuan-lobby');
            else if (gameType === 'wordhunt') showScreen('wordhunt-lobby');
            else showScreen('makesum-lobby');
        };
    }

    // Item Usage Helper - Checks Item Count Strictly & Asks Confirmation before Gem Purchase
    function executeItemUsage(itemType, actionCallback) {
        const res = economy.useMakeSumItem(itemType);
        if (res.success) {
            actionCallback();
            updateMakeSumItemBadges();
            updateHeaderStats();
            return;
        }

        // When 0 items remain, ask user explicitly if they want to buy with 20 gems
        if (economy.state.gems >= 20) {
            const itemNames = { adds: '숫자 추가 ➕', hints: '힌트 💡', bombs: '폭탄 💣' };
            const name = itemNames[itemType] || '아이템';
            const ok = confirm(`[${name}] 아이템이 0개입니다.\n보석 20개(💎)를 사용하여 1회 구매할까요?`);
            if (ok) {
                const buyRes = economy.buyAndUseMakeSumItem(itemType);
                if (buyRes.success) {
                    actionCallback();
                    updateMakeSumItemBadges();
                    updateHeaderStats();
                    soundManager.playGem();
                }
            }
        } else {
            alert('아이템과 보석이 모두 부족해요! 🥺');
        }
    }

    // Item Boosters Handlers
    safeAddListener('btn-ms-add', 'click', () => {
        const isFreeAdd = makeSumCells.length < (makeSumEngine.maxFreeRows * makeSumEngine.cols);

        if (isFreeAdd) {
            // Free addition up to the bottom of the board!
            soundManager.playStageStart();
            makeSumCells = makeSumEngine.addNumbers(makeSumCells, makeSumStageDef.target);
            renderMakeSumGrid();
            updateMakeSumItemBadges();
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.7, 24);
            mascotManager.setState('happy', '화면 아래까지는 무료로 짝꿍 숫자를 채워드려요! 💖 짝을 맞춰봐요!');
            checkMakeSumNoMoreMoves();
        } else {
            // Extra additions beyond the bottom (Item / Gems)
            executeItemUsage('adds', () => {
                soundManager.playStageStart();
                makeSumCells = makeSumEngine.addNumbers(makeSumCells, makeSumStageDef.target);
                renderMakeSumGrid();
                updateMakeSumItemBadges();
                particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.7, 24);
                mascotManager.setState('happy', '보너스 짝꿍 숫자 추가 완료! ➕✨');
                checkMakeSumNoMoreMoves();
            });
        }
    });

    safeAddListener('btn-ms-hint', 'click', () => {
        const validMoves = makeSumEngine.findAllValidMoves(makeSumCells, makeSumStageDef.target);
        if (validMoves.length === 0) {
            soundManager.playWrong();
            mascotManager.setState('thinking', '더 이상 연결할 수 있는 짝이 없어요! [숫자 추가 ➕]를 눌러보세요! 💡');
            return;
        }

        executeItemUsage('hints', () => {
            soundManager.playGem();
            const move = validMoves[0];
            makeSumSelectedIndices = [...move.indices];
            drawMultiBeams();
            renderMakeSumGrid();
            updateLiveFormula();
            move.indices.forEach(idx => {
                if (makeSumGrid.children[idx]) makeSumGrid.children[idx].classList.add('hint-pulse');
            });
            mascotManager.setState('happy', `반짝이는 숫자들을 썸링크로 연결해봐요! 💡 (목표 합: ${makeSumStageDef.target})`);
        });
    });

    safeAddListener('btn-ms-bomb', 'click', () => {
        executeItemUsage('bombs', () => {
            soundManager.playTileSelect();
            makeSumItemMode = 'bomb';
            mascotManager.setState('thinking', '제거하고 싶은 숫자 주변(3x3)을 터치하세요! 💣');
        });
    });

    function triggerBombAt(idx) {
        soundManager.playBombBoom();
        const cols = makeSumEngine.cols;
        const r = Math.floor(idx / cols);
        const c = idx % cols;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nc >= 0 && nc < cols) {
                    const checkIdx = nr * cols + nc;
                    if (checkIdx < makeSumCells.length && !makeSumCells[checkIdx].cleared) {
                        makeSumCells[checkIdx].cleared = true;
                    }
                }
            }
        }
        particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.45, 30);
        renderMakeSumGrid();
        mascotManager.setState('happy', '펑! 폭탄으로 시원하게 장애물 제거 완료! 💣💥');
        checkMakeSumVictory();
    }

    safeAddListener('btn-ms-undo', 'click', () => {
        if (makeSumUndoStack.length > 0) {
            soundManager.playTileSelect();
            const last = makeSumUndoStack.pop();
            if (last.type === 'match') {
                last.indices.forEach(idx => { makeSumCells[idx].cleared = false; });
                makeSumScore = Math.max(0, makeSumScore - last.score);
                makeSumScoreElem.textContent = makeSumScore.toLocaleString();
            }
            makeSumSelectedIndices = [];
            renderMakeSumGrid();
            clearConnectionLine();
            updateLiveFormula();
            mascotManager.setState('idle', '이전 상태로 되돌렸어요! ↩️');
        }
    });

    safeAddListener('btn-ms-pause', 'click', () => {
        makeSumIsPaused = true;
        soundManager.playTileSelect();
        document.getElementById('pause-title').textContent = '잠시 쉬어가요 ☕';
        document.getElementById('pause-desc').textContent = '루루가 향긋한 밀크티를 준비했어요!';
        document.getElementById('btn-resume-game').onclick = () => { makeSumIsPaused = false; pauseModal.classList.remove('active'); };
        document.getElementById('btn-restart-game').onclick = () => { pauseModal.classList.remove('active'); launchMakeSumGame(makeSumStageId); };
        document.getElementById('btn-exit-to-lobby').onclick = () => { pauseModal.classList.remove('active'); showScreen('makesum-lobby'); };
        pauseModal.classList.add('active');
    });

    safeAddListener('btn-sudoku-pause', 'click', () => {
        sudokuIsPaused = true;
        soundManager.playTileSelect();
        document.getElementById('pause-title').textContent = '잠시 쉬어가요 ☕';
        document.getElementById('pause-desc').textContent = '루루가 따뜻한 차를 준비했어요!';
        document.getElementById('btn-resume-game').onclick = () => { sudokuIsPaused = false; pauseModal.classList.remove('active'); };
        document.getElementById('btn-restart-game').onclick = () => { pauseModal.classList.remove('active'); launchSudokuGame(sudokuStageId); };
        document.getElementById('btn-exit-to-lobby').onclick = () => { pauseModal.classList.remove('active'); showScreen('sudoku-lobby'); };
        pauseModal.classList.add('active');
    });

    safeAddListener('btn-quick-play-ms', 'click', () => {
        soundManager.playStageStart();
        openMakeSumLaunchModal(economy.state.makesum.currentStageId || '1-1');
    });

    safeAddListener('btn-quick-play', 'click', () => {
        soundManager.playStageStart();
        openSudokuLaunchModal(economy.state.sudoku.currentStageId || '1-1');
    });

    safeAddListener('btn-note', 'click', () => {
        sudokuIsNoteMode = !sudokuIsNoteMode;
        sudokuNoteBtn.classList.toggle('active', sudokuIsNoteMode);
        soundManager.playTileSelect();
    });

    safeAddListener('btn-erase', 'click', () => {
        if (!sudokuSelectedCell) return;
        const { r, c } = sudokuSelectedCell;
        if (sudokuInitialBoard[r][c] === 0) {
            soundManager.playTileSelect();
            sudokuCurrentBoard[r][c] = 0;
            sudokuNotesBoard[r][c].clear();
            renderSudokuGrid();
        }
    });

    safeAddListener('btn-hint', 'click', () => {
        if (!sudokuSelectedCell) {
            const size = sudokuStageDef.size;
            for (let hr = 0; hr < size; hr++) {
                for (let hc = 0; hc < size; hc++) {
                    if (sudokuInitialBoard[hr][hc] === 0 && sudokuCurrentBoard[hr][hc] !== sudokuSolutionBoard[hr][hc]) {
                        sudokuSelectedCell = { r: hr, c: hc };
                        break;
                    }
                }
                if (sudokuSelectedCell) break;
            }
        }
        if (!sudokuSelectedCell) return;
        const { r, c } = sudokuSelectedCell;
        if (sudokuInitialBoard[r][c] === 0 && sudokuCurrentBoard[r][c] !== sudokuSolutionBoard[r][c]) {
            soundManager.playGem();
            sudokuCurrentBoard[r][c] = sudokuSolutionBoard[r][c];
            sudokuNotesBoard[r][c].clear();
            renderSudokuGrid();
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 20);
            checkSudokuLineComplete(r, c);
            checkSudokuVictory();
        }
    });

    // BGM ON/OFF Toggle Wiring
    const bgmToggleBtns = document.querySelectorAll('.btn-bgm-toggle, .btn-sound-toggle');
    bgmToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundManager.toggleBGM();
        });
    });
    soundManager.updateBgmButtonsUI();

    // Daily Attendance
    function renderDailyRewardModal() {
        const day = economy.getNextStreakDay();
        const amountEl = document.getElementById('daily-reward-amount');
        if (amountEl) amountEl.textContent = `+${economy.getDailyRewardAmount()} 💎`;
        const row = document.getElementById('daily-streak-row');
        if (row) {
            row.innerHTML = GameEconomy.STREAK_REWARDS.map((g, i) => {
                const cls = i + 1 < day ? 'done' : (i + 1 === day ? 'today' : '');
                return `<div class="streak-day ${cls}"><b>${i + 1}일</b><span>${i === 6 ? '🎁' : '💎'}${g}</span></div>`;
            }).join('');
        }
        const sub = document.getElementById('daily-streak-sub');
        if (sub) sub.textContent = day === 7 ? '🎉 7일 연속 출석! 오늘은 특별 대박 선물이에요!' : `${day}일째 연속 출석 중! 7일째엔 120 💎 대박 선물 🎁`;
    }

    safeAddListener('btn-claim-daily', 'click', () => {
        const dailyAmount = economy.claimDailyReward();
        soundManager.playGem();
        particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 30);
        dailyRewardModal.classList.remove('active');
        updateHeaderStats();
        mascotManager.setState('happy', `연속 출석 보너스 ${dailyAmount} 보석 획득! 내일도 꼭 만나요 🎁✨`);
    });

    if (economy.hasDailyReward) {
        renderDailyRewardModal();
        dailyRewardModal.classList.add('active');
    }

    // Out of Hearts Modals
    let outOfHeartsTargetGame = 'sudoku';
    let outOfHeartsRelaunch = null;
    function openOutOfHeartsModal(gameType, relaunch) {
        outOfHeartsTargetGame = gameType;
        outOfHeartsRelaunch = relaunch || null;
        const adLeft = economy.adPlaysLeft(gameType);
        const adBtn = document.getElementById('btn-ad-heart');
        if (adBtn) {
            adBtn.textContent = adLeft > 0 ? `🎬 광고 보고 바로 1판 더! (오늘 ${adLeft}회 남음)` : '🎬 오늘 광고 보너스를 모두 사용했어요';
            adBtn.disabled = adLeft <= 0;
        }
        const gameNames = {
            sudoku: '루루 스도쿠 하트',
            makesum: '썸링크 플레이 기회',
            wordhunt: '단어 스펠링 찾기 기회',
            sichuan: '쏙쏙! 같은그림 짝꿍 플레이 기회',
            tetris: '자유 테트리스 플레이 기회'
        };
        const gameName = gameNames[gameType] || '플레이 기회';
        document.getElementById('out-modal-subtitle').innerHTML = `오늘의 무료 ${gameName}를 다 썼어요! 🥺<br>짧은 광고 한 편이면 <b>바로 이어서</b> 플레이할 수 있어요 💖<br><small>무료 기회는 매일 자정(00:00)에 다시 충전돼요</small>`;
        outOfHeartsModal.classList.add('active');
    }

    safeAddListener('btn-buy-heart-gems', 'click', () => {
        const res = economy.buyHeartWithGems(outOfHeartsTargetGame);
        if (res.success) {
            soundManager.playGem();
            updateHeaderStats();
            outOfHeartsModal.classList.remove('active');
            mascotManager.setState('happy', '기회 충전 완료! 신나게 플레이해요! 💖');
            if (outOfHeartsRelaunch) outOfHeartsRelaunch();
        } else {
            alert(res.reason === 'limit_reached' ? '오늘은 보석으로 더 이상 구매할 수 없어요! (하루 2회 한도)' : '보석이 부족해요! 💎');
        }
    });

    safeAddListener('btn-ad-heart', 'click', () => {
        if (economy.adPlaysLeft(outOfHeartsTargetGame) <= 0) return;
        let granted = false;
        adMobManager.showRewardedVideo('heart', () => {
            granted = economy.grantAdHeart(outOfHeartsTargetGame).success;
            updateHeaderStats();
            outOfHeartsModal.classList.remove('active');
            mascotManager.setState('happy', '광고 시청 완료! 보너스 게임 시작! 🎬💖');
        }, () => {
            // 광고 닫으면 고민할 틈 없이 바로 게임 시작
            if (granted && outOfHeartsRelaunch) outOfHeartsRelaunch();
        });
    });

    safeAddListener('close-out-modal', 'click', () => {
        outOfHeartsModal.classList.remove('active');
    });

    

    // =============================================================
    // 4. KAWAII WORD HUNTER (단어 스펠링 찾기) CONTROLLER
    // =============================================================
    window.wordHuntEngine = new WordHuntEngine();

    const whGrid = document.getElementById('wordhunt-grid');
    const whTargetBox = document.getElementById('wh-target-box');
    const whTimerFill = document.getElementById('wh-timer-fill');
    const whTimerText = document.getElementById('wh-timer-text');
    const whScoreText = document.getElementById('wh-score-text');
    const whStageTitle = document.getElementById('wh-stage-title');
    const whWordProgress = document.getElementById('wh-word-progress');

    // Hub Card Event for Word Hunt
    const cardOpenWordHunt = document.getElementById('card-open-wordhunt');
    if (cardOpenWordHunt) {
        cardOpenWordHunt.addEventListener('click', () => {
            soundManager.playTileSelect();
            showScreen('wordhunt-lobby');
        });
    }

    function renderWordHuntRoadmap() {
        const container = document.getElementById('wordhunt-stages-list');
        if (!container) return;
        container.innerHTML = '';

        const banner = document.createElement('div');
        banner.className = 'welcome-freepass-banner';
        banner.style.background = 'linear-gradient(135deg, #F3E8FF 0%, #FFE4E6 100%)';
        banner.style.borderColor = '#D8B4FE';
        banner.style.color = '#6B21A8';
        banner.innerHTML = '🔤 <strong>단어 스펠링 찾기</strong> : 제시된 단어의 스펠링을 순서대로 찾아 완성하세요! 💖';
        container.appendChild(banner);

        let currentWorld = 0;
        const worldNames = {
            1: '🍓 WORLD 1 : 달콤 한글 디저트 (6x6 초급)',
            2: '🍬 WORLD 2 : Sweet English Candy (6x6 초급)',
            3: '👑 WORLD 3 : 프린세스 왕국 한글 (9x9 고급)',
            4: '🌌 WORLD 4 : Galaxy Master English (9x9 고급)'
        };

        wordHuntEngine.stageOrder.forEach((stageId, idx) => {
            const def = wordHuntEngine.stageConfigs[stageId];
            const isUnlocked = economy.state.wordhunt.unlockedStages.includes(stageId);
            const clearData = economy.state.wordhunt.clearedStages[stageId];
            const isCurrent = economy.state.wordhunt.currentStageId === stageId;

            if (def.world !== currentWorld) {
                currentWorld = def.world;
                const header = document.createElement('div');
                header.className = 'world-divider-badge';
                header.style.background = 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)';
                header.style.borderColor = '#C084FC';
                header.style.color = '#6B21A8';
                header.textContent = worldNames[currentWorld];
                container.appendChild(header);
            }

            const node = document.createElement('div');
            node.className = `roadmap-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current-active' : ''} ${clearData ? 'cleared' : ''}`;
            const alignClass = idx % 3 === 0 ? 'align-left' : (idx % 3 === 1 ? 'align-center' : 'align-right');
            node.classList.add(alignClass);

            let starsHtml = '';
            const starsCount = clearData ? clearData.stars : 0;
            for (let s = 1; s <= 3; s++) {
                starsHtml += `<span class="star-icon ${s <= starsCount ? 'earned' : 'empty'}">★</span>`;
            }

            node.innerHTML = `
                ${isCurrent ? '<div class="cur-mascot-marker"><span class="marker-speech">여기야! 💖</span><span class="marker-owl">🦉</span></div>' : ''}
                <div class="node-circle" style="border-color:#C084FC; color:#6B21A8;">${isUnlocked ? (clearData ? '✓' : idx + 1) : '🔒'}</div>
                <div class="node-details">
                    <div class="node-title">${def.name} <span class="target-chip" style="background:#F3E8FF; color:#7E22CE; border-color:#D8B4FE;">${def.size}x${def.size} • ${def.lang.toUpperCase()}</span></div>
                    <div class="node-stars">${starsHtml}</div>
                </div>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    soundManager.playStageStart();
                    openWordHuntLaunchModal(stageId);
                });
            } else {
                node.addEventListener('click', () => {
                    soundManager.playWrong();
                    mascotManager.setState('sad', '이전 스테이지를 먼저 클리어해야 열려요! 🔒', 2500);
                });
            }
            container.appendChild(node);
        });
    }

    function openWordHuntLaunchModal(stageId) {
        const def = wordHuntEngine.stageConfigs[stageId];
        wordHuntStageId = stageId;
        wordHuntStageDef = def;

        document.getElementById('launch-stage-title').textContent = def.name;
        const descElem = document.getElementById('launch-stage-desc');
        const startBtn = document.getElementById('btn-confirm-start-stage');

        startBtn.innerHTML = `💖 기회 1회 소모 (남은 횟수: ${economy.state.wordhuntHearts}/3)`;
        descElem.innerHTML = `${def.desc} <br><span style="color:#A855F7; font-weight:900; font-size:1.05rem;">🔤 격자 크기: <strong>${def.size}x${def.size}</strong> (${def.lang === 'ko' ? '한국어' : 'English'})</span>`;

        const clearData = economy.state.wordhunt.clearedStages[stageId];
        if (clearData) {
            const m = Math.floor((clearData.bestTime || 0) / 60);
            const s = (clearData.bestTime || 0) % 60;
            const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            document.getElementById('launch-best-record').textContent = `최고 기록: ★ ${clearData.stars}개 (${clearData.score.toLocaleString()}점 • ⏱️ ${timeStr})`;
        } else {
            document.getElementById('launch-best-record').textContent = '기록 없음 (★ 0개)';
        }

        startBtn.onclick = () => {
            stageLaunchModal.classList.remove('active');
            soundManager.startBGM();
            launchWordHuntGame(stageId);
        };
        stageLaunchModal.classList.add('active');
    }

    function launchWordHuntGame(stageId) {
        wordHuntStageId = stageId;
        wordHuntStageDef = wordHuntEngine.stageConfigs[stageId];

        if (economy.state.wordhuntHearts <= 0) {
            openOutOfHeartsModal('wordhunt', () => launchWordHuntGame(stageId));
            return;
        }

        economy.consumeHeart('wordhunt', stageId);
        showScreen('wordhunt-game');

        wordHuntScore = 0;
        wordHuntElapsedSeconds = 0;
        wordHuntCurrentWordIdx = 0;
        wordHuntCurrentMatchedIndices = [];
        wordHuntIsPaused = false;
        wordHuntStageWords = wordHuntEngine.getStageWords(stageId);

        whStageTitle.textContent = wordHuntStageDef.name;
        whScoreText.textContent = '0';

        // Generate ONE continuous board containing all words for this stage!
        wordHuntPuzzleData = wordHuntEngine.generatePuzzle(wordHuntStageDef.size, wordHuntStageDef.lang, wordHuntStageWords);

        renderWordHuntGrid();
        loadNextWordHuntWord();
        updateWordHuntItemBadges();

        mascotManager.setState('idle', `스펠링 찾기 시작! 제시된 글자를 순서대로 터치하세요! 🔤✨`, 3000);
    }

    function loadNextWordHuntWord() {
        if (wordHuntCurrentWordIdx >= wordHuntStageWords.length) {
            triggerEuphoricVictory('wordhunt', wordHuntStageId);
            return;
        }

        wordHuntExpectedLetterIdx = 0;
        wordHuntCurrentMatchedIndices = [];
        wordHuntTimerSeconds = wordHuntStageDef.timeLimit;

        whWordProgress.textContent = `단어 ${wordHuntCurrentWordIdx + 1}/${wordHuntStageWords.length}`;
        renderWordHuntTargetWord();

        if (wordHuntTimerInterval) clearInterval(wordHuntTimerInterval);
        whTimerFill.style.width = '100%';
        whTimerFill.classList.remove('warning');
        whTimerText.textContent = `${wordHuntTimerSeconds}s`;

        wordHuntTimerInterval = setInterval(() => {
            if (wordHuntIsPaused) return;
            wordHuntElapsedSeconds++;
            wordHuntTimerSeconds--;

            const pct = Math.max(0, (wordHuntTimerSeconds / wordHuntStageDef.timeLimit) * 100);
            whTimerFill.style.width = `${pct}%`;
            whTimerText.textContent = `${wordHuntTimerSeconds}s`;

            if (wordHuntTimerSeconds <= 10) {
                whTimerFill.classList.add('warning');
            } else {
                whTimerFill.classList.remove('warning');
            }

            if (wordHuntTimerSeconds <= 0) {
                wordHuntIsPaused = true;
                soundManager.playWrong();
                openTimeOverModal({
                    desc: '아깝다! 단어가 거의 다 보였는데 💧<br>20초만 더 찾아볼까요?',
                    continueLabel: '🎬 광고 보고 +20초 이어하기',
                    onContinue: () => { wordHuntTimerSeconds += 20; wordHuntIsPaused = false; },
                    onRetry: () => launchWordHuntGame(wordHuntStageId),
                    onExit: () => { clearInterval(wordHuntTimerInterval); showScreen('wordhunt-lobby'); }
                });
            }
        }, 1000);
    }

    function renderWordHuntTargetWord() {
        whTargetBox.innerHTML = '';
        const targetWord = wordHuntStageWords[wordHuntCurrentWordIdx];
        if (!targetWord) return;
        const letters = targetWord.split('');

        letters.forEach((letter, idx) => {
            const pill = document.createElement('div');
            pill.className = 'target-letter-pill';
            pill.textContent = letter;
            if (idx < wordHuntExpectedLetterIdx) {
                pill.classList.add('found');
                pill.textContent = '✓ ' + letter;
            } else if (idx === wordHuntExpectedLetterIdx) {
                pill.classList.add('current');
            }
            whTargetBox.appendChild(pill);
        });
    }

    function renderWordHuntGrid() {
        whGrid.className = `wordhunt-grid size-${wordHuntStageDef.size}`;
        whGrid.innerHTML = '';

        wordHuntPuzzleData.cells.forEach((cell, idx) => {
            const tile = document.createElement('div');
            tile.className = `wordhunt-tile ${cell.cleared ? 'cleared' : (cell.found ? 'found' : '')}`;
            tile.textContent = cell.cleared ? '' : cell.char;
            tile.dataset.idx = idx;

            tile.addEventListener('click', () => onWordHuntTileClick(idx, cell, tile));
            whGrid.appendChild(tile);
        });
    }

    function onWordHuntTileClick(idx, cell, tileElem) {
        if (cell.cleared || cell.found) return;

        const targetWord = wordHuntStageWords[wordHuntCurrentWordIdx];
        if (!targetWord) return;
        const letters = targetWord.split('');
        const expectedChar = letters[wordHuntExpectedLetterIdx];

        // Flexible letter recognition: match ANY visible, uncleared tile that matches expectedChar!
        if (cell.char && cell.char.toUpperCase() === expectedChar.toUpperCase()) {
            // SUCCESSFUL LETTER MATCH!
            cell.found = true;
            wordHuntCurrentMatchedIndices.push(idx);
            wordHuntExpectedLetterIdx++;
            wordHuntScore += 100;
            whScoreText.textContent = wordHuntScore.toLocaleString();

            soundManager.playMatchCombo(wordHuntExpectedLetterIdx);
            const rect = tileElem.getBoundingClientRect();
            particleSystem.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);

            tileElem.classList.add('found');
            renderWordHuntTargetWord();

            if (wordHuntExpectedLetterIdx >= letters.length) {
                // WORD COMPLETED!
                soundManager.playLineComplete();
                wordHuntScore += 300;
                whScoreText.textContent = wordHuntScore.toLocaleString();
                particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.45, 30);
                mascotManager.setState('happy', `[ ${targetWord} ] 완성! 대단해요! 💖 (+300점)`, 2500);

                // DELETE ONLY COMPLETED WORD LETTERS FROM THE BOARD!
                const matchedToClear = [...wordHuntCurrentMatchedIndices];
                wordHuntCurrentMatchedIndices = [];

                setTimeout(() => {
                    matchedToClear.forEach(ti => {
                        wordHuntPuzzleData.cells[ti].cleared = true;
                        wordHuntPuzzleData.cells[ti].found = false;
                        const el = whGrid.children[ti];
                        if (el) {
                            el.classList.add('pop-out');
                            setTimeout(() => {
                                el.className = 'wordhunt-tile cleared';
                                el.textContent = '';
                            }, 250);
                        }
                    });

                    setTimeout(() => {
                        wordHuntCurrentWordIdx++;
                        if (wordHuntCurrentWordIdx >= wordHuntStageWords.length) {
                            triggerEuphoricVictory('wordhunt', wordHuntStageId);
                        } else {
                            loadNextWordHuntWord();
                            mascotManager.setState('cheer', `다음 단어 [ ${wordHuntStageWords[wordHuntCurrentWordIdx]} ] 를 남은 글자에서 찾아보세요! 🔤✨`, 2500);
                        }
                    }, 350);
                }, 400);

            } else {
                mascotManager.setState('happy', `좋아요! 다음 글자 [ ${letters[wordHuntExpectedLetterIdx]} ] 를 찾아보세요! ✨`, 1500);
            }
        } else {
            // WRONG LETTER CLICKED!
            soundManager.playWrong();
            tileElem.classList.add('shake');
            wordHuntTimerSeconds = Math.max(1, wordHuntTimerSeconds - 2); // 2s penalty
            setTimeout(() => { tileElem.classList.remove('shake'); }, 400);

            mascotManager.setState('sad', `앗! 지금 찾아야 할 글자는 [ ${expectedChar} ] 예요! 💡`, 2000);
        }
    }

    function updateWordHuntItemBadges() {
        document.getElementById('badge-wh-hint').textContent = economy.state.wordhunt.items.hints;
        document.getElementById('badge-wh-time').textContent = economy.state.wordhunt.items.times;
        document.getElementById('badge-wh-bomb').textContent = economy.state.wordhunt.items.bombs;
        document.getElementById('badge-wh-skip').textContent = economy.state.wordhunt.items.skips;
    }

    function executeWordHuntItemUsage(itemType, actionCallback) {
        const res = economy.useWordHuntItem(itemType);
        if (res.success) {
            actionCallback();
            updateWordHuntItemBadges();
            updateHeaderStats();
            return;
        }

        if (economy.state.gems >= 20) {
            const itemNames = { hints: '힌트 💡', times: '시간 추가 ⏳', bombs: '폭탄 💣', skips: '자동 스킵 🔤' };
            const name = itemNames[itemType] || '아이템';
            const ok = confirm(`[${name}] 아이템이 0개입니다.
보석 20개(💎)를 사용하여 1회 구매할까요?`);
            if (ok) {
                const buyRes = economy.buyAndUseWordHuntItem(itemType);
                if (buyRes.success) {
                    actionCallback();
                    updateWordHuntItemBadges();
                    updateHeaderStats();
                    soundManager.playGem();
                }
            }
        } else {
            alert('아이템과 보석이 모두 부족해요! 🥺');
        }
    }

    // Word Hunt Item Handlers
    safeAddListener('btn-wh-hint', 'click', () => {
        executeWordHuntItemUsage('hints', () => {
            soundManager.playGem();
            const hintTargetWord = wordHuntStageWords[wordHuntCurrentWordIdx];
            if (!hintTargetWord) return;
            const hintExpectedChar = hintTargetWord[wordHuntExpectedLetterIdx];
            let hintIdx = -1;
            wordHuntPuzzleData.cells.forEach((c, idx) => {
                if (!c.cleared && !c.found && c.char && c.char.toUpperCase() === hintExpectedChar.toUpperCase() && hintIdx === -1) {
                    hintIdx = idx;
                }
            });
            if (hintIdx !== -1 && whGrid.children[hintIdx]) {
                whGrid.children[hintIdx].classList.add('hint-pulse');
                setTimeout(() => {
                    if (whGrid.children[hintIdx]) whGrid.children[hintIdx].classList.remove('hint-pulse');
                }, 3000);
            }
            mascotManager.setState('happy', `반짝이는 칸에 [ ${hintExpectedChar} ] 가 있어요! 💡`);
        });
    });

    safeAddListener('btn-wh-time', 'click', () => {
        executeWordHuntItemUsage('times', () => {
            soundManager.playGem();
            wordHuntTimerSeconds += 15;
            whTimerText.textContent = `${wordHuntTimerSeconds}s`;
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.45, 20);
            mascotManager.setState('happy', '시간 +15초 연장 완료! ⏳✨');
        });
    });

    safeAddListener('btn-wh-bomb', 'click', () => {
        executeWordHuntItemUsage('bombs', () => {
            soundManager.playBombBoom();
            const bombTargetWord = wordHuntStageWords[wordHuntCurrentWordIdx];
            if (!bombTargetWord) return;
            const bombExpectedChar = bombTargetWord[wordHuntExpectedLetterIdx];
            let clearedCount = 0;
            wordHuntPuzzleData.cells.forEach((cell, idx) => {
                if (!cell.cleared && !cell.found && cell.char && cell.char.toUpperCase() !== bombExpectedChar.toUpperCase() && clearedCount < 5) {
                    cell.cleared = true;
                    if (whGrid.children[idx]) {
                        whGrid.children[idx].classList.add('pop-out');
                        setTimeout(() => {
                            if (whGrid.children[idx]) {
                                whGrid.children[idx].className = 'wordhunt-tile cleared';
                                whGrid.children[idx].textContent = '';
                            }
                        }, 250);
                    }
                    clearedCount++;
                }
            });
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.5, 24);
            mascotManager.setState('happy', '폭탄으로 방해 글자들을 제거했어요! 💣💥');
        });
    });

    safeAddListener('btn-wh-skip', 'click', () => {
        executeWordHuntItemUsage('skips', () => {
            soundManager.playGem();
            const skipTargetWord = wordHuntStageWords[wordHuntCurrentWordIdx];
            if (!skipTargetWord) return;
            const skipTargetChar = skipTargetWord[wordHuntExpectedLetterIdx];
            let skipIdx = -1;
            wordHuntPuzzleData.cells.forEach((c, idx) => {
                if (!c.cleared && !c.found && c.char && c.char.toUpperCase() === skipTargetChar.toUpperCase() && skipIdx === -1) {
                    skipIdx = idx;
                }
            });
            if (skipIdx !== -1 && whGrid.children[skipIdx]) {
                const targetCell = wordHuntPuzzleData.cells[skipIdx];
                onWordHuntTileClick(skipIdx, targetCell, whGrid.children[skipIdx]);
            }
        });
    });

    safeAddListener('btn-wh-pause', 'click', () => {
        wordHuntIsPaused = true;
        soundManager.playTileSelect();
        document.getElementById('pause-title').textContent = '잠시 쉬어가요 ☕';
        document.getElementById('pause-desc').textContent = '루루가 향긋한 딸기 주스를 준비했어요!';
        document.getElementById('btn-resume-game').onclick = () => { wordHuntIsPaused = false; pauseModal.classList.remove('active'); };
        document.getElementById('btn-restart-game').onclick = () => { pauseModal.classList.remove('active'); launchWordHuntGame(wordHuntStageId); };
        document.getElementById('btn-exit-to-lobby').onclick = () => { pauseModal.classList.remove('active'); showScreen('wordhunt-lobby'); };
        pauseModal.classList.add('active');
    });

    safeAddListener('btn-quick-play-wh', 'click', () => {
        soundManager.playStageStart();
        openWordHuntLaunchModal(economy.state.wordhunt.currentStageId || '1-1');
    });

    // =============================================================
    // FINAL INITIALIZATION
    // =============================================================
    updateHeaderStats();
    showScreen('hub');

    // =============================================================
    // 5. KAWAII SICHUAN (카와이 사천성 / Shisen-Sho) CONTROLLER
    // =============================================================
    window.sichuanEngine = new SichuanEngine();

    const sichuanGrid = document.getElementById('sichuan-grid');
    const sichuanSvg = document.getElementById('sichuan-line-svg');
    const scLevelText = document.getElementById('sichuan-level-text');
    const scScoreText = document.getElementById('sichuan-score-text');
    const scTimeText = document.getElementById('sichuan-time-text');
    const scRemainText = document.getElementById('sichuan-remain-text');

    let sichuanStageId = '1-1';
    let sichuanStageDef = null;
    let sichuanScore = 0;
    let sichuanTimerSeconds = 60;
    let sichuanElapsedSeconds = 0;
    let sichuanTimerInterval = null;
    let sichuanIsPaused = false;
    let selectedTileCoord = null; // { r, c, el }

    function renderSichuanRoadmap() {
        const container = document.getElementById('sichuan-stages-list');
        if (!container) return;
        container.innerHTML = '';

        const banner = document.createElement('div');
        banner.className = 'welcome-freepass-banner';
        banner.style.background = 'linear-gradient(135deg, #FFF0F5 0%, #FFD1DC 100%)';
        banner.style.borderColor = '#FF8DA1';
        banner.style.color = '#D81159';
        banner.innerHTML = '🀄 <strong>쏙쏙 짝꿍 랜드</strong> : 같은 그림 두 개를 두 번 이하로 꺾어 이어보세요! 🌸✨';
        container.appendChild(banner);

        let currentWorld = 0;
        const worldNames = {
            1: '🍓 WORLD 1 : 달콤한 딸기 동산',
            2: '🍰 WORLD 2 : 향긋한 디저트 카페',
            3: '🐾 WORLD 3 : 포근한 동물 농장',
            4: '🌸 WORLD 4 : 만발한 꽃향기 정원',
            5: '🌈 WORLD 5 : 꿈꾸는 무지개 언덕',
            6: '⭐ WORLD 6 : 환상의 별빛 판타지'
        };

        sichuanEngine.stageOrder.forEach((stageId, idx) => {
            const def = sichuanEngine.stagesConfig[stageId];
            const isUnlocked = economy.state.sichuan.unlockedStages.includes(stageId);
            const clearData = economy.state.sichuan.clearedStages[stageId];
            const isCurrent = economy.state.sichuan.currentStageId === stageId;

            if (def.world !== currentWorld) {
                currentWorld = def.world;
                const header = document.createElement('div');
                header.className = 'world-divider-badge';
                header.style.background = 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)';
                header.style.borderColor = '#FFB6C1';
                header.style.color = '#D81159';
                header.textContent = worldNames[currentWorld];
                container.appendChild(header);
            }

            const node = document.createElement('div');
            node.className = `roadmap-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current-active' : ''} ${clearData ? 'cleared' : ''}`;
            const alignClass = idx % 3 === 0 ? 'align-left' : (idx % 3 === 1 ? 'align-center' : 'align-right');
            node.classList.add(alignClass);

            let starsHtml = '';
            const starsCount = clearData ? clearData.stars : 0;
            for (let s = 1; s <= 3; s++) {
                starsHtml += `<span class="star-icon ${s <= starsCount ? 'earned' : 'empty'}">★</span>`;
            }

            node.innerHTML = `
                ${isCurrent ? '<div class="cur-mascot-marker"><span class="marker-speech">연결해봐요! 🀄</span><span class="marker-owl">🦉</span></div>' : ''}
                <div class="node-circle" style="border-color:#FF8DA1; color:#D81159;">${isUnlocked ? (clearData ? '✓' : idx + 1) : '🔒'}</div>
                <div class="node-details">
                    <div class="node-title">${def.name} <span class="target-chip" style="background:#FFF0F5; color:#D81159; border-color:#FFB6C1;">목표: ${def.targetScore}점 • ⏱️ ${def.time}s</span></div>
                    <div class="node-stars">${starsHtml}</div>
                </div>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    soundManager.playStageStart();
                    openSichuanLaunchModal(stageId);
                });
            } else {
                node.addEventListener('click', () => {
                    soundManager.playWrong();
                    mascotManager.setState('sad', '이전 짝꿍 스테이지를 먼저 클리어해야 열려요! 🔒', 2500);
                });
            }
            container.appendChild(node);
        });
    }

    function openSichuanLaunchModal(stageId) {
        const def = sichuanEngine.stagesConfig[stageId];
        sichuanStageId = stageId;
        sichuanStageDef = def;

        document.getElementById('launch-stage-title').textContent = def.name;
        const descElem = document.getElementById('launch-stage-desc');
        const startBtn = document.getElementById('btn-confirm-start-stage');

        startBtn.innerHTML = `💖 기회 1회 소모 (남은 횟수: ${economy.state.sichuanHearts}/3)`;
        descElem.innerHTML = `2번 이하로 꺾어지는 경로의 같은 타일을 터치하여 모두 제거하세요! 🀄🌸<br><span style="color:#D81159; font-weight:900; font-size:1.05rem;">🎯 목표 점수: <strong>${def.targetScore.toLocaleString()}점</strong> | ⏱️ <strong>${def.time}초</strong></span>`;

        const clearData = economy.state.sichuan.clearedStages[stageId];
        if (clearData) {
            const m = Math.floor((clearData.bestTime || 0) / 60);
            const s = (clearData.bestTime || 0) % 60;
            const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            document.getElementById('launch-best-record').textContent = `최고 기록: ★ ${clearData.stars}개 (${clearData.score.toLocaleString()}점 • ⏱️ ${timeStr})`;
        } else {
            document.getElementById('launch-best-record').textContent = '기록 없음 (★ 0개)';
        }

        startBtn.onclick = () => {
            stageLaunchModal.classList.remove('active');
            soundManager.startBGM();
            launchSichuanGame(stageId);
        };
        stageLaunchModal.classList.add('active');
    }

    function launchSichuanGame(stageId) {
        sichuanStageId = stageId;
        sichuanStageDef = sichuanEngine.stagesConfig[stageId];

        if (economy.state.sichuanHearts <= 0) {
            openOutOfHeartsModal('sichuan', () => launchSichuanGame(stageId));
            return;
        }

        economy.consumeHeart('sichuan', stageId);
        showScreen('sichuan-game');

        sichuanScore = 0;
        sichuanElapsedSeconds = 0;
        sichuanIsPaused = false;
        selectedTileCoord = null;
        sichuanTimerSeconds = sichuanStageDef.time;

        if (scLevelText) scLevelText.textContent = `LEVEL: ${stageId}`;
        if (scScoreText) scScoreText.textContent = '0';
        if (scTimeText) {
            scTimeText.textContent = `TIME: ${sichuanTimerSeconds}`;
            scTimeText.classList.remove('danger');
        }

        const stageData = sichuanEngine.initStage(stageId);
        if (scRemainText) scRemainText.textContent = `남은 타일: ${stageData.remainingTiles}`;

        renderSichuanGrid();
        updateSichuanItemBadges();

        if (sichuanTimerInterval) clearInterval(sichuanTimerInterval);
        sichuanTimerInterval = setInterval(() => {
            if (sichuanIsPaused) return;
            sichuanElapsedSeconds++;
            sichuanTimerSeconds--;

            if (scTimeText) {
                scTimeText.textContent = `TIME: ${sichuanTimerSeconds}`;
                if (sichuanTimerSeconds <= 15) {
                    scTimeText.classList.add('danger');
                } else {
                    scTimeText.classList.remove('danger');
                }
            }

            if (sichuanTimerSeconds <= 0) {
                sichuanIsPaused = true;
                soundManager.playWrong();
                openTimeOverModal({
                    desc: `아깝다! 남은 그림이 <b>${sichuanEngine.remainingTiles}개</b>뿐이에요 💧<br>30초만 더 있으면 다 맞출 수 있어요!`,
                    onContinue: () => { sichuanTimerSeconds += 30; sichuanIsPaused = false; },
                    onRetry: () => launchSichuanGame(sichuanStageId),
                    onExit: () => { clearInterval(sichuanTimerInterval); showScreen('sichuan-lobby'); }
                });
            }
        }, 1000);

        mascotManager.setState('idle', `쏙쏙 짝꿍 시작! 같은 그림을 찾아 이어보세요! 🀄✨`, 3000);
    }

    function renderSichuanGrid() {
        if (!sichuanGrid) return;
        sichuanGrid.innerHTML = '';
        selectedTileCoord = null;
        if (sichuanSvg) sichuanSvg.innerHTML = '';

        sichuanGrid.style.gridTemplateColumns = `repeat(${sichuanEngine.cols}, 1fr)`;
        sichuanGrid.style.gridTemplateRows = `repeat(${sichuanEngine.rows}, 1fr)`;

        for (let r = 1; r <= sichuanEngine.rows; r++) {
            for (let c = 1; c <= sichuanEngine.cols; c++) {
                const tile = sichuanEngine.board[r][c];
                const tileElem = document.createElement('div');
                tileElem.className = 'sichuan-tile';
                tileElem.dataset.r = r;
                tileElem.dataset.c = c;

                if (!tile || tile.cleared) {
                    tileElem.classList.add('cleared');
                } else {
                    tileElem.textContent = tile.icon;
                    tileElem.style.background = tile.bg;
                    tileElem.style.borderColor = tile.border;
                    tileElem.addEventListener('click', () => onSichuanTileClick(r, c, tileElem));
                }
                sichuanGrid.appendChild(tileElem);
            }
        }
    }

    function clearHintGlows() {
        const glows = document.querySelectorAll('.sichuan-tile.hint-glow');
        glows.forEach(el => el.classList.remove('hint-glow'));
    }

    function onSichuanTileClick(r, c, tileElem) {
        if (sichuanIsPaused) return;
        const tile = sichuanEngine.board[r][c];
        if (!tile || tile.cleared) return;

        clearHintGlows();

        // If no tile selected yet
        if (!selectedTileCoord) {
            selectedTileCoord = { r, c, el: tileElem };
            tileElem.classList.add('selected');
            soundManager.playTileTap();
            return;
        }

        // If clicked the currently selected tile again -> Deselect
        if (selectedTileCoord.r === r && selectedTileCoord.c === c) {
            tileElem.classList.remove('selected');
            selectedTileCoord = null;
            soundManager.playTileTap();
            return;
        }

        const prevR = selectedTileCoord.r;
        const prevC = selectedTileCoord.c;
        const prevEl = selectedTileCoord.el;
        const prevTile = sichuanEngine.board[prevR][prevC];

        // Check if types match
        if (prevTile.typeId === tile.typeId) {
            // Check path
            const path = sichuanEngine.findPath(prevR, prevC, r, c);
            if (path) {
                // MATCH SUCCESS!
                prevEl.classList.remove('selected');
                selectedTileCoord = null;

                // Animate laser connecting line
                drawSichuanConnectingLine(path);

                soundManager.playTileMatch();
                const matchRes = sichuanEngine.removePair(prevR, prevC, r, c);
                sichuanScore = sichuanEngine.score;
                if (scScoreText) scScoreText.textContent = sichuanScore.toLocaleString();
                if (scRemainText) scRemainText.textContent = `남은 타일: ${matchRes.remainingTiles}`;

                soundManager.playSichuanCombo(matchRes.combo);

                // Particles
                const r1 = prevEl.getBoundingClientRect();
                const r2 = tileElem.getBoundingClientRect();
                particleSystem.spawnTileBurst(r1.left + r1.width / 2, r1.top + r1.height / 2, prevTile.color || '#FF69B4');
                particleSystem.spawnTileBurst(r2.left + r2.width / 2, r2.top + r2.height / 2, tile.color || '#FF69B4');

                prevEl.classList.add('cleared');
                tileElem.classList.add('cleared');

                if (matchRes.combo >= 2) {
                    const scPopup = document.getElementById('sichuan-combo-popup');
                    if (scPopup) {
                        const title = matchRes.combo >= 4 ? `👑 ${matchRes.combo} SUPER FEVER!` : (matchRes.combo === 3 ? '⚡ 3 MEGA COMBO!' : '🔥 2 COMBO!');
                        const animCls = matchRes.combo >= 4 ? 'active-combo-fever' : (matchRes.combo === 3 ? 'active-combo-3' : 'active-combo-2');
                        scPopup.textContent = `${title} (+${matchRes.pointsEarned}점)`;
                        scPopup.className = `combo-popup-banner ${animCls}`;
                        setTimeout(() => { if (scPopup) scPopup.className = 'combo-popup-banner'; }, 1100);
                    }
                    mascotManager.setState('happy', `${matchRes.combo}연속 콤보 대성공! 💖 (+${matchRes.pointsEarned}점)`, 1800);
                } else {
                    mascotManager.setState('happy', `${tile.name} 짝 맞추기 성공! 🀄 (+${matchRes.pointsEarned}점)`, 1500);
                }

                if (matchRes.isCleared) {
                    setTimeout(() => checkSichuanVictory(), 400);
                } else {
                    // Check deadlock
                    const avail = sichuanEngine.findAvailableMatches();
                    if (avail.length === 0) {
                        setTimeout(() => {
                            soundManager.playTileShuffle();
                            mascotManager.setState('thinking', '더 이상 연결할 수 없어 자동으로 타일을 섞어요! 🎲✨', 2500);
                            sichuanEngine.shuffleRemainingTiles();
                            renderSichuanGrid();
                        }, 500);
                    }
                }
                return;
            }
        }

        // Mismatch or unreachable
        soundManager.playTileMismatch();
        prevEl.classList.remove('selected');
        tileElem.classList.add('shake');
        setTimeout(() => tileElem.classList.remove('shake'), 300);

        // Switch selection to new tile
        selectedTileCoord = { r, c, el: tileElem };
        tileElem.classList.add('selected');
    }

    function drawSichuanConnectingLine(path) {
        if (!sichuanSvg || !sichuanGrid) return;
        const gridRect = sichuanGrid.getBoundingClientRect();
        const svgRect = sichuanSvg.getBoundingClientRect();

        const cellW = gridRect.width / sichuanEngine.cols;
        const cellH = gridRect.height / sichuanEngine.rows;

        // Path is in padding coordinates: r in 0..paddingRows-1, c in 0..paddingCols-1
        // (r=1..rows corresponds to grid rows 0..rows-1)
        const points = path.map(pt => {
            const x = (gridRect.left - svgRect.left) + (pt.c - 0.5) * cellW;
            const y = (gridRect.top - svgRect.top) + (pt.r - 0.5) * cellH;
            return `${x},${y}`;
        }).join(' ');

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points);
        polyline.setAttribute('class', 'sichuan-line-path');
        sichuanSvg.appendChild(polyline);

        setTimeout(() => {
            if (polyline.parentNode) {
                polyline.parentNode.removeChild(polyline);
            }
        }, 320);
    }

    function checkSichuanVictory() {
        if (sichuanTimerInterval) clearInterval(sichuanTimerInterval);
        triggerEuphoricVictory('sichuan', sichuanStageId);
    }

    function updateSichuanItemBadges() {
        const bHint = document.getElementById('badge-sichuan-hint');
        const bShuffle = document.getElementById('badge-sichuan-shuffle');
        const bTime = document.getElementById('badge-sichuan-time');
        const bBomb = document.getElementById('badge-sichuan-bomb');
        if (bHint && economy.state.sichuan) bHint.textContent = economy.state.sichuan.items.hints;
        if (bShuffle && economy.state.sichuan) bShuffle.textContent = economy.state.sichuan.items.shuffles;
        if (bTime && economy.state.sichuan) bTime.textContent = economy.state.sichuan.items.times;
        if (bBomb && economy.state.sichuan) bBomb.textContent = economy.state.sichuan.items.bombs;
    }

    function executeSichuanItemUsage(itemType, actionCallback) {
        const res = economy.useSichuanItem(itemType);
        if (res.success) {
            actionCallback();
            updateSichuanItemBadges();
            updateHeaderStats();
            return;
        }

        if (economy.state.gems >= 20) {
            const itemNames = { hints: '힌트 🔍', shuffles: '셔플 🎲', times: '시간 추가 ⏳', bombs: '폭탄 ⚡' };
            const name = itemNames[itemType] || '아이템';
            const ok = confirm(`[${name}] 아이템이 0개입니다.\n보석 20개(💎)를 사용하여 1회 구매할까요?`);
            if (ok) {
                const buyRes = economy.buyAndUseSichuanItem(itemType);
                if (buyRes.success) {
                    actionCallback();
                    updateSichuanItemBadges();
                    updateHeaderStats();
                    soundManager.playGem();
                }
            }
        } else {
            alert('아이템과 보석이 모두 부족해요! 🥺');
        }
    }

    // Sichuan Item Button Listeners
    safeAddListener('btn-sichuan-hint', 'click', () => {
        executeSichuanItemUsage('hints', () => {
            soundManager.playGem();
            clearHintGlows();
            const moves = sichuanEngine.findAvailableMatches();
            if (moves.length > 0) {
                const m = moves[0];
                const elA = document.querySelector(`.sichuan-tile[data-r="${m.tileA.r}"][data-c="${m.tileA.c}"]`);
                const elB = document.querySelector(`.sichuan-tile[data-r="${m.tileB.r}"][data-c="${m.tileB.c}"]`);
                if (elA) elA.classList.add('hint-glow');
                if (elB) elB.classList.add('hint-glow');
                mascotManager.setState('happy', '반짝이는 두 타일을 연결해보세요! 🔍✨', 2500);
            } else {
                mascotManager.setState('thinking', '연결 가능한 타일이 없어요! 셔플을 사용해보세요! 🎲', 2000);
            }
        });
    });

    safeAddListener('btn-sichuan-shuffle', 'click', () => {
        executeSichuanItemUsage('shuffles', () => {
            soundManager.playTileShuffle();
            sichuanEngine.shuffleRemainingTiles();
            renderSichuanGrid();
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.45, 25);
            mascotManager.setState('happy', '타일을 새롭게 섞었어요! 🎲✨', 2000);
        });
    });

    safeAddListener('btn-sichuan-time', 'click', () => {
        executeSichuanItemUsage('times', () => {
            soundManager.playGem();
            sichuanTimerSeconds += 20;
            if (scTimeText) scTimeText.textContent = `TIME: ${sichuanTimerSeconds}`;
            particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight * 0.45, 20);
            mascotManager.setState('happy', '시간 +20초 연장 완료! ⏳✨');
        });
    });

    safeAddListener('btn-sichuan-bomb', 'click', () => {
        executeSichuanItemUsage('bombs', () => {
            soundManager.playGem();
            const moves = sichuanEngine.findAvailableMatches();
            if (moves.length > 0) {
                const m = moves[0];
                const elA = document.querySelector(`.sichuan-tile[data-r="${m.tileA.r}"][data-c="${m.tileA.c}"]`);
                const elB = document.querySelector(`.sichuan-tile[data-r="${m.tileB.r}"][data-c="${m.tileB.c}"]`);
                if (elA && elB) {
                    drawSichuanConnectingLine(m.path);
                    soundManager.playTileMatch();
                    const matchRes = sichuanEngine.removePair(m.tileA.r, m.tileA.c, m.tileB.r, m.tileB.c);
                    sichuanScore = sichuanEngine.score;
                    if (scScoreText) scScoreText.textContent = sichuanScore.toLocaleString();
                    if (scRemainText) scRemainText.textContent = `남은 타일: ${matchRes.remainingTiles}`;

                    const r1 = elA.getBoundingClientRect();
                    const r2 = elB.getBoundingClientRect();
                    particleSystem.spawnTileBurst(r1.left + r1.width / 2, r1.top + r1.height / 2, '#FFD700');
                    particleSystem.spawnTileBurst(r2.left + r2.width / 2, r2.top + r2.height / 2, '#FFD700');

                    elA.classList.add('cleared');
                    elB.classList.add('cleared');
                    mascotManager.setState('happy', '폭탄으로 타일 1쌍을 즉시 제거했어요! ⚡💥', 2000);

                    if (matchRes.isCleared) {
                        setTimeout(() => checkSichuanVictory(), 400);
                    }
                }
            }
        });
    });

    safeAddListener('btn-sichuan-pause', 'click', () => {
        sichuanIsPaused = true;
        soundManager.playTileSelect();
        document.getElementById('pause-title').textContent = '잠시 쉬어가요 ☕';
        document.getElementById('pause-desc').textContent = '루루가 달콤한 마카롱을 준비했어요!';
        document.getElementById('btn-resume-game').onclick = () => { sichuanIsPaused = false; pauseModal.classList.remove('active'); };
        document.getElementById('btn-restart-game').onclick = () => { pauseModal.classList.remove('active'); launchSichuanGame(sichuanStageId); };
        document.getElementById('btn-exit-to-lobby').onclick = () => { pauseModal.classList.remove('active'); showScreen('sichuan-lobby'); };
        pauseModal.classList.add('active');
    });

    safeAddListener('btn-quick-play-sichuan', 'click', () => {
        soundManager.playStageStart();
        openSichuanLaunchModal(economy.state.sichuan.currentStageId || '1-1');
    });

    // =============================================================
    // 6. 자유 테트리스 (FREE TETRIS) CONTROLLER
    // 블록을 고르고(다시 누르면 회전) 판을 터치해 미리보기 → 한 번 더 터치하면 놓기
    // =============================================================
    window.tetrisEngine = new TetrisFreeEngine(10);
    const ttBoard = document.getElementById('tetris-board');
    const ttTray = document.getElementById('tetris-tray');
    const ttScore = document.getElementById('tetris-score');
    const ttCombo = document.getElementById('tetris-combo');
    const ttCells = [];
    let tetrisActive = false;
    let tetrisSel = -1;
    let tetrisGhost = null; // { r0, c0 }
    let tetrisLastCell = null; // { r, c }
    let tetrisBestShown = false;
    const TETRIS_PRAISE = ['멋진 자리예요! ✨', '줄 삭제 대성공! 🎉', '완벽해요! 💖', '천재 블록러! 🧠', '시원~하다! 🌈'];

    function buildTetrisBoard() {
        if (!ttBoard || ttCells.length) return;
        for (let r = 0; r < tetrisEngine.size; r++) {
            ttCells.push([]);
            for (let c = 0; c < tetrisEngine.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'tt-cell';
                cell.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setTetrisGhost(r, c); });
                cell.addEventListener('click', () => onTetrisCellTap(r, c));
                ttBoard.appendChild(cell);
                ttCells[r].push(cell);
            }
        }
        ttBoard.addEventListener('mouseleave', () => { tetrisGhost = null; renderTetrisBoard(); });
    }

    function tetrisAnchor(r, c) {
        const p = tetrisEngine.tray[tetrisSel];
        const { h, w } = tetrisEngine.pieceSize(p.cells);
        return { r0: r - Math.floor((h - 1) / 2), c0: c - Math.floor((w - 1) / 2) };
    }

    function setTetrisGhost(r, c) {
        tetrisLastCell = { r, c };
        if (tetrisSel < 0 || !tetrisEngine.tray[tetrisSel]) return;
        tetrisGhost = tetrisAnchor(r, c);
        renderTetrisBoard();
    }

    function renderTetrisBoard(flash = []) {
        const g = tetrisEngine.grid;
        for (let r = 0; r < tetrisEngine.size; r++) {
            for (let c = 0; c < tetrisEngine.size; c++) {
                const el = ttCells[r][c];
                el.className = 'tt-cell' + (g[r][c] ? ' filled' : '');
                el.style.background = g[r][c] || '';
            }
        }
        flash.forEach(([r, c]) => ttCells[r][c].classList.add('line-flash'));
        const p = tetrisEngine.tray[tetrisSel];
        if (p && tetrisGhost) {
            const ok = tetrisEngine.canPlace(p.cells, tetrisGhost.r0, tetrisGhost.c0);
            p.cells.forEach(([dr, dc]) => {
                const rr = tetrisGhost.r0 + dr, cc = tetrisGhost.c0 + dc;
                if (ttCells[rr] && ttCells[rr][cc]) {
                    ttCells[rr][cc].classList.add(ok ? 'ghost-ok' : 'ghost-bad');
                    if (ok) ttCells[rr][cc].style.background = p.color;
                }
            });
        }
    }

    function renderTetrisTray() {
        if (!ttTray) return;
        ttTray.innerHTML = '';
        tetrisEngine.tray.forEach((p, idx) => {
            const slot = document.createElement('button');
            slot.type = 'button';
            slot.className = 'tt-slot' + (idx === tetrisSel ? ' selected' : '');
            if (!p) {
                slot.classList.add('empty');
                slot.disabled = true;
                slot.setAttribute('aria-label', '사용한 블록');
            } else {
                const { h, w } = tetrisEngine.pieceSize(p.cells);
                const mini = document.createElement('div');
                mini.className = 'tt-mini';
                mini.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
                mini.style.gridTemplateRows = `repeat(${h}, 1fr)`;
                mini.style.width = `${w * 18}px`;
                mini.style.height = `${h * 18}px`;
                p.cells.forEach(([r, c]) => {
                    const b = document.createElement('div');
                    b.className = 'tt-mini-cell';
                    b.style.gridRow = r + 1;
                    b.style.gridColumn = c + 1;
                    b.style.background = p.color;
                    mini.appendChild(b);
                });
                slot.appendChild(mini);
                if (!tetrisEngine.canPieceFitAnywhere(p.cells)) slot.classList.add('no-fit');
                slot.setAttribute('aria-label', idx === tetrisSel ? '선택된 블록 (다시 누르면 회전)' : '블록 선택');
                slot.addEventListener('click', () => onTetrisTrayTap(idx));
            }
            ttTray.appendChild(slot);
        });
    }

    function onTetrisTrayTap(idx) {
        if (idx === tetrisSel) {
            tetrisEngine.rotatePiece(idx);
            soundManager.playTileTap();
        } else {
            tetrisSel = idx;
            soundManager.playTileSelect();
        }
        if (tetrisLastCell && tetrisGhost) tetrisGhost = tetrisAnchor(tetrisLastCell.r, tetrisLastCell.c);
        renderTetrisTray();
        renderTetrisBoard();
    }

    function onTetrisCellTap(r, c) {
        if (!tetrisActive) return;
        if (tetrisSel < 0 || !tetrisEngine.tray[tetrisSel]) {
            mascotManager.setState('thinking', '먼저 아래에서 블록을 골라주세요! 👇', 1800);
            return;
        }
        const a = tetrisAnchor(r, c);
        // 터치: 첫 탭은 미리보기, 같은 자리 두 번째 탭에 놓기 (마우스는 호버가 미리보기라 바로 놓임)
        if (!tetrisGhost || tetrisGhost.r0 !== a.r0 || tetrisGhost.c0 !== a.c0) {
            setTetrisGhost(r, c);
            soundManager.playTileTap();
            return;
        }
        const res = tetrisEngine.place(tetrisSel, a.r0, a.c0);
        if (!res) {
            soundManager.playTileMismatch();
            ttBoard.classList.remove('shake');
            void ttBoard.offsetWidth;
            ttBoard.classList.add('shake');
            return;
        }
        tetrisSel = tetrisEngine.tray.findIndex(Boolean);
        tetrisGhost = null;

        const flash = [];
        res.rows.forEach(rr => { for (let cc = 0; cc < tetrisEngine.size; cc++) flash.push([rr, cc]); });
        res.cols.forEach(cc => { for (let rr = 0; rr < tetrisEngine.size; rr++) flash.push([rr, cc]); });
        renderTetrisBoard(flash);
        renderTetrisTray();
        if (ttScore) ttScore.textContent = tetrisEngine.score.toLocaleString();

        if (res.lines > 0) {
            soundManager.playTileMatch();
            if (res.combo >= 2) soundManager.playSichuanCombo(res.combo);
            const rect = ttBoard.getBoundingClientRect();
            particleSystem.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 14 + res.lines * 8);
            if (ttCombo) {
                ttCombo.textContent = res.combo >= 2 ? `🔥 ${res.combo} COMBO! +${res.points}` : `+${res.points}`;
                ttCombo.classList.remove('pop');
                void ttCombo.offsetWidth;
                ttCombo.classList.add('pop');
            }
            mascotManager.setState('happy', res.lines >= 2 ? `${res.lines}줄 동시 삭제!! 대박 🎉` : TETRIS_PRAISE[Math.floor(Math.random() * TETRIS_PRAISE.length)], 1500);
        } else {
            soundManager.playTileTap();
        }

        const best = economy.state.tetris.best || 0;
        if (!tetrisBestShown && best > 0 && tetrisEngine.score > best) {
            tetrisBestShown = true;
            soundManager.playStarSlam(3);
            mascotManager.setState('happy', '🏆 최고 기록 경신 중! 계속 가요!! 🏆', 2500);
        }

        if (res.gameOver) setTimeout(onTetrisGameOver, 450);
    }

    function finishTetrisGame() {
        if (!tetrisActive) return;
        tetrisActive = false;
        const r = economy.completeTetrisGame(tetrisEngine.score);
        updateHeaderStats();
        soundManager.playGem();
        if (r.isNewBest) {
            particleSystem.spawnFireworks(4);
            particleSystem.spawnGemShower(30);
        }
        mascotManager.setState('happy', `${r.isNewBest ? '🏆 신기록! ' : ''}보석 +${r.rewardGems}개 획득! 💎`, 3000);
    }

    function onTetrisGameOver() {
        soundManager.playWrong();
        const best = Math.max(economy.state.tetris.best || 0, tetrisEngine.score);
        openTimeOverModal({
            title: '블록이 꽉 찼어요! 🧱',
            desc: `이번 점수 <b>${tetrisEngine.score.toLocaleString()}점</b> · 최고 ${best.toLocaleString()}점<br>광고 보면 두 줄을 비우고 이어할 수 있어요!`,
            continueLabel: '🎬 광고 보고 두 줄 비우고 이어하기',
            onContinue: () => {
                tetrisEngine.rescue();
                tetrisSel = tetrisEngine.tray.findIndex(Boolean);
                renderTetrisBoard();
                renderTetrisTray();
                mascotManager.setState('happy', '두 줄을 비웠어요! 다시 힘내요 💪✨', 2000);
            },
            onRetry: () => { finishTetrisGame(); launchTetrisGame(); },
            onExit: () => { finishTetrisGame(); showScreen('hub'); }
        });
    }

    function launchTetrisGame() {
        if (tetrisActive) { showScreen('tetris-game'); return; } // 진행 중이던 판 이어서
        if (!economy.consumeHeart('tetris')) {
            openOutOfHeartsModal('tetris', launchTetrisGame);
            return;
        }
        buildTetrisBoard();
        tetrisEngine.reset();
        tetrisActive = true;
        tetrisSel = 0;
        tetrisGhost = null;
        tetrisLastCell = null;
        tetrisBestShown = false;
        if (ttScore) ttScore.textContent = '0';
        if (ttCombo) ttCombo.textContent = '';
        showScreen('tetris-game');
        renderTetrisBoard();
        renderTetrisTray();
        soundManager.startBGM();
        mascotManager.setState('idle', '블록을 원하는 곳에 쏙! 가로·세로 줄을 채우면 사라져요 🧱✨', 3500);
    }

    safeAddListener('card-open-tetris', 'click', () => {
        soundManager.playTileSelect();
        launchTetrisGame();
    });

});
