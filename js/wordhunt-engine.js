/**
 * Kawaii Word Hunter (단어 스펠링 찾기) Engine
 * Supports 6x6 (초급) / 9x9 (고급)
 * Korean (가~힣) & English (A~Z)
 * Sequential Spelling Validation & Multi-Word Stage Chains
 */
class WordHuntEngine {
    constructor() {
        this.dictionaries = {
            ko_easy: [
                '딸기', '모찌', '사과', '포도', '수박', '체리', '레몬', '망고', '푸딩',
                '쿠키', '우유', '초코', '마카롱', '케이크', '토끼', '고양이', '강아지',
                '나비', '햇살', '하늘', '바다', '꽃잎', '단풍', '구름', '별빛', '달님'
            ],
            ko_hard: [
                '무지개', '프린세스', '에메랄드', '다이아몬드', '크리스탈', '해바라기',
                '은하수', '별똥별', '사파이어', '루비반지', '솜사탕동산', '블루베리',
                '티아라왕관', '달콤디저트', '생일파티', '마법지팡이', '달빛요정'
            ],
            en_easy: [
                'PINK', 'CAKE', 'STAR', 'MOON', 'LOVE', 'SWEET', 'CANDY', 'BERRY',
                'MAGIC', 'FAIRY', 'ROSE', 'HEART', 'CUTE', 'LULU', 'SNOW', 'MINT',
                'RUBY', 'GOLD', 'BEAR', 'BABY', 'DEER', 'LILY', 'PEACH', 'COOKIE'
            ],
            en_hard: [
                'PRINCESS', 'GALAXY', 'CRYSTAL', 'RAINBOW', 'DIAMOND', 'UNICORN',
                'SPARKLE', 'BUTTERFLY', 'SUNSHINE', 'CHOCOLATE', 'SWEETHEART',
                'BLOSSOM', 'PARADISE', 'FAIRYTALE', 'STARLIGHT', 'CUPCAKE'
            ]
        };

        this.koreanAlphabet = '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후기니디리미비시이지치키티피히';
        this.englishAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        this.stageConfigs = {
            // World 1: 6x6 한국어 디저트 & 자연 (초급 2~3글자 단어 3개)
            '1-1': { world: 1, size: 6, lang: 'ko', dict: 'ko_easy', wordsCount: 3, timeLimit: 45, name: '1-1 딸기 모찌 🍓', desc: '6x6 한글 디저트 스펠링 찾기' },
            '1-2': { world: 1, size: 6, lang: 'ko', dict: 'ko_easy', wordsCount: 3, timeLimit: 45, name: '1-2 달콤 사과 🍎', desc: '6x6 달콤 과일 단어' },
            '1-3': { world: 1, size: 6, lang: 'ko', dict: 'ko_easy', wordsCount: 3, timeLimit: 44, name: '1-3 귀여운 토끼 🐰', desc: '6x6 동물 & 디저트' },
            '1-4': { world: 1, size: 6, lang: 'ko', dict: 'ko_easy', wordsCount: 3, timeLimit: 44, name: '1-4 마카롱 파티 🍭', desc: '6x6 알록달록 스펠링' },
            '1-5': { world: 1, size: 6, lang: 'ko', dict: 'ko_easy', wordsCount: 4, timeLimit: 52, name: '1-5 루루의 한글 왕관 👑', desc: '월드 1 마스터! (단어 4개)' },

            // World 2: 6x6 English Sweet Candy (초급 3~4 Letters 3 Words)
            '2-1': { world: 2, size: 6, lang: 'en', dict: 'en_easy', wordsCount: 3, timeLimit: 48, name: '2-1 Sweet Pink 💖', desc: '6x6 Basic English Spelling' },
            '2-2': { world: 2, size: 6, lang: 'en', dict: 'en_easy', wordsCount: 3, timeLimit: 48, name: '2-2 Star Moon 🌙', desc: '6x6 Starlight Words' },
            '2-3': { world: 2, size: 6, lang: 'en', dict: 'en_easy', wordsCount: 3, timeLimit: 46, name: '2-3 Magic Fairy 🧚', desc: '6x6 Magic Candy English' },
            '2-4': { world: 2, size: 6, lang: 'en', dict: 'en_easy', wordsCount: 3, timeLimit: 46, name: '2-4 Lovely Peach 🍑', desc: '6x6 Sweet Fruity Words' },
            '2-5': { world: 2, size: 6, lang: 'en', dict: 'en_easy', wordsCount: 4, timeLimit: 54, name: '2-5 Princess Wing 🪽', desc: 'World 2 Master! (4 Words)' },

            // World 3: 9x9 한국어 프린세스 왕국 (고급 3~5글자 단어 3개)
            '3-1': { world: 3, size: 9, lang: 'ko', dict: 'ko_hard', wordsCount: 3, timeLimit: 70, name: '3-1 무지개 회랑 🌈', desc: '9x9 고난도 한글 단어 찾기' },
            '3-2': { world: 3, size: 9, lang: 'ko', dict: 'ko_hard', wordsCount: 3, timeLimit: 68, name: '3-2 루비 반지 💖', desc: '9x9 보석 단어 스펠링' },
            '3-3': { world: 3, size: 9, lang: 'ko', dict: 'ko_hard', wordsCount: 3, timeLimit: 66, name: '3-3 에메랄드 분수 🍀', desc: '9x9 자연 & 보석' },
            '3-4': { world: 3, size: 9, lang: 'ko', dict: 'ko_hard', wordsCount: 3, timeLimit: 66, name: '3-4 은하수 오솔길 🌌', desc: '9x9 장문 단어 집중력' },
            '3-5': { world: 3, size: 9, lang: 'ko', dict: 'ko_hard', wordsCount: 4, timeLimit: 78, name: '3-5 다이아몬드 여왕 👑💎', desc: '월드 3 마스터! (단어 4개)' },

            // World 4: 9x9 English Galaxy Master (고급 5~8 Letters 3 Words)
            '4-1': { world: 4, size: 9, lang: 'en', dict: 'en_hard', wordsCount: 3, timeLimit: 75, name: '4-1 Galaxy Starlight 🌌', desc: '9x9 Advanced English Spelling' },
            '4-2': { world: 4, size: 9, lang: 'en', dict: 'en_hard', wordsCount: 3, timeLimit: 72, name: '4-2 Crystal Rainbow 🌈', desc: '9x9 Sparkling Words' },
            '4-3': { world: 4, size: 9, lang: 'en', dict: 'en_hard', wordsCount: 3, timeLimit: 72, name: '4-3 Diamond Unicorn 🦄', desc: '9x9 Fantasy Word Master' },
            '4-4': { world: 4, size: 9, lang: 'en', dict: 'en_hard', wordsCount: 3, timeLimit: 70, name: '4-4 Sweetheart Castle 🏰', desc: '9x9 Grand Challenge' },
            '4-5': { world: 4, size: 9, lang: 'en', dict: 'en_hard', wordsCount: 4, timeLimit: 82, name: '4-5 Grand Brain Master 🌟', desc: '최고 목표: 9x9 그랜드 피날레!' }
        };
        this.stageOrder = Object.keys(this.stageConfigs);
    }

    getStageWords(stageId) {
        const config = this.stageConfigs[stageId] || this.stageConfigs['1-1'];
        const wordPool = [...this.dictionaries[config.dict]];
        const selected = [];
        for (let i = 0; i < config.wordsCount; i++) {
            if (wordPool.length === 0) break;
            const idx = Math.floor(Math.random() * wordPool.length);
            selected.push(wordPool.splice(idx, 1)[0]);
        }
        return selected;
    }

        generatePuzzle(size, lang, targetWords) {
        const total = size * size;
        const words = Array.isArray(targetWords) ? targetWords : [targetWords];
        
        // Collect all letters of all target words in this stage
        const allLetters = [];
        words.forEach((w, wIdx) => {
            w.split('').forEach((ch, lIdx) => {
                allLetters.push({
                    char: ch,
                    wordIdx: wIdx,
                    letterIdx: lIdx,
                    word: w
                });
            });
        });

        const availableIndices = Array.from({ length: total }, (_, i) => i);
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }

        const cells = Array.from({ length: total }, (_, i) => ({
            id: i,
            char: '',
            isTarget: false,
            found: false,
            cleared: false
        }));

        // Place all letters of all stage words
        allLetters.forEach((item, idx) => {
            if (idx < total) {
                const pos = availableIndices[idx];
                cells[pos].char = item.char;
                cells[pos].isTarget = true;
            }
        });

        // Fill remaining spaces with decoy alphabet letters
        const rawAlphabet = (lang === 'ko' ? this.koreanAlphabet : this.englishAlphabet).split('');
        for (let i = allLetters.length; i < total; i++) {
            const pos = availableIndices[i];
            cells[pos].char = rawAlphabet[Math.floor(Math.random() * rawAlphabet.length)];
        }

        return {
            size,
            lang,
            stageWords: words,
            cells
        };
    }
}
window.WordHuntEngine = WordHuntEngine;
