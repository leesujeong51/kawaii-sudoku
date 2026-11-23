/**
 * Google AdMob Manager & Rewarded Simulator
 */
class AdMobManager {
    constructor() {
        this.modal = document.getElementById('ad-modal');
        this.videoTimerText = document.getElementById('ad-timer-text');
        this.videoProgress = document.getElementById('ad-progress-bar');
        this.closeBtn = document.getElementById('ad-close-btn');
        this.rewardBadge = document.getElementById('ad-reward-badge');
        this.adTitle = document.getElementById('ad-title');
        this.onRewardCallback = null;
        this.onClosedCallback = null;
        this.timer = null;
        this.init();
    }
    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeAdModal());
        }
    }
    // onClosed: 보상 지급 후 '닫기'를 눌렀을 때 실행 (예: 바로 게임 시작)
    showRewardedVideo(rewardType, onRewarded, onClosed) {
        this.onRewardCallback = onRewarded;
        this.onClosedCallback = onClosed || null;
        let timeLeft = 5;
        const titles = {
            hint: '🎬 리워드 광고 - 힌트 1개 충전',
            heart: '🎬 광고 보고 1판 더! 💖',
            double: '🎬 광고 보고 보석 2배 받기 💎💎',
            continue: '🎬 광고 보고 이어하기 ⏳'
        };
        if (this.adTitle) {
            this.adTitle.textContent = titles[rewardType] || titles.heart;
        }
        if (this.rewardBadge) this.rewardBadge.style.display = 'none';
        if (this.closeBtn) this.closeBtn.style.display = 'none';
        if (this.videoProgress) this.videoProgress.style.width = '0%';
        if (this.videoTimerText) this.videoTimerText.textContent = `${timeLeft}초 후 보상 지급`;
        if (this.modal) this.modal.classList.add('active');

        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            timeLeft -= 1;
            const pct = ((5 - timeLeft) / 5) * 100;
            if (this.videoProgress) this.videoProgress.style.width = `${pct}%`;
            if (timeLeft > 0) {
                if (this.videoTimerText) this.videoTimerText.textContent = `${timeLeft}초 후 보상 지급`;
            } else {
                clearInterval(this.timer);
                if (this.videoTimerText) this.videoTimerText.textContent = '🎉 광고 시청 완료!';
                if (this.rewardBadge) this.rewardBadge.style.display = 'block';
                if (this.closeBtn) this.closeBtn.style.display = 'block';
                if (window.soundManager) window.soundManager.playGem();
                if (window.particleSystem) window.particleSystem.spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 16);
                if (typeof this.onRewardCallback === 'function') this.onRewardCallback();
            }
        }, 1000);
    }
    closeAdModal() {
        if (this.timer) clearInterval(this.timer);
        if (this.modal) this.modal.classList.remove('active');
        const cb = this.onClosedCallback;
        this.onClosedCallback = null;
        if (typeof cb === 'function') cb();
    }
}
window.AdMobManager = AdMobManager;
