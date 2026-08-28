/**
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
