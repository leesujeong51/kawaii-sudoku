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
        this.timer = null;
        this.init();
    }
    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeAdModal());
        }
    }
    showRewardedVideo(rewardType, onRewarded) {
        this.onRewardCallback = onRewarded;
        let timeLeft = 5;
        if (this.adTitle) {
            this.adTitle.textContent = rewardType === 'hint' ? '🎬 리워드 광고 - 힌트 1개 충전' : '🎬 리워드 광고 - 보너스 하트 1개 충전';
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
    }
}
window.AdMobManager = AdMobManager;
