// 游戏主界面
class StartGame {
    constructor() {
        // 初始状态
        this.showMainInterface();
        this.bindStartEvent();
        this.bindSettingsEvent();
    }

    showMainInterface() {
        // 显示主界面容器
        document.getElementById(gameConfig.elementIds.mainInterface).style.display = "flex";
        document.getElementById(gameConfig.elementIds.appContainer).style.display = "none";
        document.getElementById(gameConfig.elementIds.endContainer).style.display = "none";
        document.getElementById(gameConfig.elementIds.settingContainer).style.display = "none";
    }

    hideMainInterface() {
        // 隐藏主界面容器
        document.getElementById(gameConfig.elementIds.mainInterface).style.display = "none";
    }

    bindStartEvent() {
        // 绑定开始游戏按钮事件
        const startBtn = document.getElementById("startGameBtn"); 
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                this.checkSavedProgress(); // 检查是否有存档
            });
        }
    }

    // 检查存档
    checkSavedProgress() {
        const savedProgress = SealScriptGame.loadGameProgress();
        if (savedProgress) {
            this.showContinueGameModal();
        } else {
            this.startGame();
        }
    }

    // 显示继续游戏确认模态框
    showContinueGameModal() {
        const modal = document.getElementById(gameConfig.elementIds.continueGameModal);
        const continueBtn = document.getElementById(gameConfig.elementIds.continueGameBtn);
        const newGameBtn = document.getElementById(gameConfig.elementIds.newGameBtn);
        const cancelBtn = document.createElement('div');
        cancelBtn.className = 'game-btn';
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.style.display = 'flex';

        // 绑定继续游戏按钮事件
        if (continueBtn) {
            continueBtn.onclick = () => {
                this.continueGame();
                modal.style.display = 'none';
            };
        }

        // 绑定新游戏按钮事件
        if (newGameBtn) {
            newGameBtn.onclick = () => {
                this.startGame();
                modal.style.display = 'none';
            };
        }

        // 绑定模态框背景点击事件（点击背景关闭模态框）
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 继续游戏
    continueGame() {
        const savedProgress = SealScriptGame.loadGameProgress();
        if (savedProgress) {
            this.hideMainInterface();
            document.getElementById(gameConfig.elementIds.appContainer).style.display = "flex"; // 显示游戏容器
            new SealScriptGame(savedProgress);
        } else {
            this.startGame();
        }
    }

    playButtonClickSound() {
        if (gameConfig.buttonClickSound) {
            const seVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.seVolume)) / 100 || gameConfig.defaultSeVolume / 100;
            const clickSound = new Audio(gameConfig.buttonClickSound);
            clickSound.volume = seVolume;
            clickSound.play().catch(error => {
                console.warn("按钮音效播放失败:", error);
            });
        }
    }

    bindSettingsEvent() {
        // 绑定设置按钮事件
        const settingsBtn = document.querySelectorAll(`#${gameConfig.elementIds.settingsBtn}`);
        if (settingsBtn) {
            settingsBtn.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.playButtonClickSound();
                    this.showSettings();
                });
            });
        }
    }

    showSettings() {
        // 显示设置界面
        document.getElementById(gameConfig.elementIds.settingContainer).style.display = "flex";
        this.initVolumeControls();
        this.bindSettingsCloseEvent();
        this.bindVolumeControlsInSettings();
    }

    initVolumeControls() {
        // 获取存储的音量值，如果没有则使用默认值
        const bgmVolume = localStorage.getItem(gameConfig.storageKeys.bgmVolume) || gameConfig.defaultBgmVolume;
        const seVolume = localStorage.getItem(gameConfig.storageKeys.seVolume) || gameConfig.defaultSeVolume;
        const narrationVolume = localStorage.getItem(gameConfig.storageKeys.narrationVolume) || gameConfig.defaultNarrationVolume;
        
        // 设置滑块值
        document.getElementById(gameConfig.elementIds.bgmVolumeSlider).value = bgmVolume;
        document.getElementById(gameConfig.elementIds.seVolumeSlider).value = seVolume;
        document.getElementById(gameConfig.elementIds.narrationVolumeSlider).value = narrationVolume;
        
        // 设置百分比显示
        document.getElementById(gameConfig.elementIds.bgmVolumeValue).textContent = `${bgmVolume}%`;
        document.getElementById(gameConfig.elementIds.seVolumeValue).textContent = `${seVolume}%`;
        document.getElementById(gameConfig.elementIds.narrationVolumeValue).textContent = `${narrationVolume}%`;
    }

    bindSettingsCloseEvent() {
        const settingCloseBtn = document.getElementById(gameConfig.elementIds.settingCloseBtn);
        if (settingCloseBtn) {
            settingCloseBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                document.getElementById(gameConfig.elementIds.settingContainer).style.display = "none";
            });
        }
    }
    
    // 为设置界面绑定音量控制事件
    bindVolumeControlsInSettings() {
        const bgmSlider = document.getElementById(gameConfig.elementIds.bgmVolumeSlider);
        const seSlider = document.getElementById(gameConfig.elementIds.seVolumeSlider);
        const narrationSlider = document.getElementById(gameConfig.elementIds.narrationVolumeSlider);
        
        const bgmValue = document.getElementById(gameConfig.elementIds.bgmVolumeValue);
        const seValue = document.getElementById(gameConfig.elementIds.seVolumeValue);
        const narrationValue = document.getElementById(gameConfig.elementIds.narrationVolumeValue);

        if(bgmSlider) {
            bgmSlider.removeEventListener('input', this.bgmVolumeHandler || (() => {}));
            this.bgmVolumeHandler = (e) => {
                const volume = e.target.value;
                bgmValue.textContent = `${volume}%`;
                localStorage.setItem(gameConfig.storageKeys.bgmVolume, volume);
            };
            bgmSlider.addEventListener('input', this.bgmVolumeHandler);
        }

        if(seSlider) {
            seSlider.removeEventListener('input', this.seVolumeHandler || (() => {}));
            this.seVolumeHandler = (e) => {
                const volume = e.target.value;
                seValue.textContent = `${volume}%`;
                localStorage.setItem(gameConfig.storageKeys.seVolume, volume);
            };
            seSlider.addEventListener('input', this.seVolumeHandler);
        }

        if(narrationSlider) {
            narrationSlider.removeEventListener('input', this.narrationVolumeHandler || (() => {}));
            this.narrationVolumeHandler = (e) => {
                const volume = e.target.value;
                narrationValue.textContent = `${volume}%`;
                localStorage.setItem(gameConfig.storageKeys.narrationVolume, volume);
            };
            narrationSlider.addEventListener('input', this.narrationVolumeHandler);
        }
    }

startGame() {
    
        // 开始游戏
        SealScriptGame.clearGameProgress();
        this.hideMainInterface();
        
        // 如果启用了开场视频，则播放开场视频后再进入游戏
        if (gameConfig.openingVideo.enabled) {
            this.playOpeningVideo();
        } else {
            // 直接开始游戏
            document.getElementById(gameConfig.elementIds.appContainer).style.display = "flex";
            new SealScriptGame();
        }
    }

    playOpeningVideo() {
        const videoContainer = document.getElementById(gameConfig.elementIds.openingVideoContainer);
        const videoElement = document.getElementById(gameConfig.elementIds.openingVideo);
        const skipButton = document.getElementById(gameConfig.elementIds.skipOpeningVideoBtn);
        
        // 设置视频源和属性
        videoElement.src = gameConfig.openingVideo.path;
        videoElement.muted = gameConfig.openingVideo.muted;
        videoElement.loop = gameConfig.openingVideo.loop;
        
        // 显示视频容器
        videoContainer.style.display = "flex";
        videoElement.style.display = "block";
        
        // 如果配置了显示跳过按钮
        if (gameConfig.openingVideo.showSkipButton) {
            skipButton.style.display = "block";
        } else {
            skipButton.style.display = "none";
        }

        // 绑定视频结束事件
        videoElement.onended = () => {
            this.finishOpeningVideo();
        };

        // 绑定跳过按钮事件
        if (skipButton) {
            skipButton.onclick = () => {
                this.finishOpeningVideo();
            };
        }

        // 如果设置了跳过按钮延迟显示时间
        if (gameConfig.openingVideo.skipDelay > 0) {
            skipButton.style.display = "none";
            setTimeout(() => {
                if (videoElement.currentTime < videoElement.duration || !videoElement.ended) {
                    skipButton.style.display = "block";
                }
            }, gameConfig.openingVideo.skipDelay);
        }

        // 播放视频
        if (gameConfig.openingVideo.autoplay) {
            videoElement.play().catch(error => {
                console.warn("开场视频自动播放失败，可能需要用户交互:", error);
                // 如果自动播放失败，仍然显示跳过按钮
                if (gameConfig.openingVideo.showSkipButton) {
                    skipButton.style.display = "block";
                }
            });
        } else {
            // 如果不自动播放，显示播放按钮或提示
            if (gameConfig.openingVideo.showSkipButton) {
                skipButton.style.display = "block";
            }
        }
    }

    finishOpeningVideo() {
        // 隐藏视频容器
        document.getElementById(gameConfig.elementIds.openingVideoContainer).style.display = "none";
        // 显示游戏容器并开始游戏
        document.getElementById(gameConfig.elementIds.appContainer).style.display = "flex";
        new SealScriptGame();
    }
}