const root = document.documentElement;
const gameWrap = document.querySelector('.game-wrap');
const gameContainer = document.querySelector('.game-container');
const textScript = document.querySelector('.text-script');

function calculateScaleAndHeight() {
  if (!gameWrap || !gameContainer || !textScript) return;
  // 强制触发重排，获取准确的DOM尺寸
  gameContainer.offsetHeight; 
  const baseWidth = parseFloat(getComputedStyle(root).getPropertyValue('--game-container-base-width'));
  const wrapWidth = gameWrap.clientWidth;
  const scaleRatio = Math.min(wrapWidth / baseWidth, 1);
  root.style.setProperty('--game-container-scale-ratio', scaleRatio);
  const scaledContainerHeight = gameContainer.offsetHeight * scaleRatio;
  const availableHeight = gameWrap.clientHeight - scaledContainerHeight;
  root.style.setProperty('--text-script-flex', availableHeight > 20 ? '4' : '2');
}

document.addEventListener('DOMContentLoaded', () => {
  // 延迟20ms，等CSS样式完全应用
  setTimeout(calculateScaleAndHeight, 20);
});

window.addEventListener('resize', calculateScaleAndHeight);
document.querySelector('#sceneImage')?.addEventListener('load', calculateScaleAndHeight);

// 游戏主函数
class SealScriptGame {
    constructor(savedProgress = null) {
        if (savedProgress) {
            // 如果有存档，加载存档数据
            this.currentPageIndex = savedProgress.currentPageIndex;
            this.storyData = savedProgress.storyData || window.storyData;
            this.bgmVolume = savedProgress.bgmVolume;
            this.seVolume = savedProgress.seVolume;
            this.narrationVolume = savedProgress.narrationVolume;
        } else {
            this.currentPageIndex = 0; // 从第一页开始
            this.storyData = window.storyData;
        }
        this.bgmAudio = null; // 背景音乐音频对象
        this.seAudio = null; // 音效音频对象
        this.narrationAudio = null; // 旁白音频对象
        this.videoElement = null; // 视频元素
        this.typewriterTimeoutId = null; // 添加打字机效果的超时ID
        this.isTyping = false; // 添加打字状态标识
        
        // 获取存储的音量值，如果未找到则使用配置中的默认值
        if (!savedProgress) {
            this.bgmVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.bgmVolume)) / 100 || gameConfig.defaultBgmVolume / 100;
            this.seVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.seVolume)) / 100 || gameConfig.defaultSeVolume / 100;
            this.narrationVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.narrationVolume)) / 100 || gameConfig.defaultNarrationVolume / 100;
        }
        
        this.initPage();
        this.bindEvents();
    }

    // 保存游戏进度
    saveGameProgress() {
        const progressData = {
            currentPageIndex: this.currentPageIndex,
            storyData: this.storyData, // 注意：这可能包含大量数据，根据需要可以只保存关键数据
            bgmVolume: this.bgmVolume,
            seVolume: this.seVolume,
            narrationVolume: this.narrationVolume,
            timestamp: Date.now()
        };
        localStorage.setItem(gameConfig.storageKeys.gameProgress, JSON.stringify(progressData));
        console.log("游戏进度已保存");
    }

    // 加载游戏进度
    static loadGameProgress() {
        const savedProgress = localStorage.getItem(gameConfig.storageKeys.gameProgress);
        if (savedProgress) {
            try {
                return JSON.parse(savedProgress);
            } catch (error) {
                console.error("加载游戏进度失败:", error);
                return null;
            }
        }
        return null;
    }

    // 清除游戏进度
    static clearGameProgress() {
        localStorage.removeItem(gameConfig.storageKeys.gameProgress);
        console.log("游戏进度已清除");
    }

   
    playButtonClickSound() {
        if (gameConfig.buttonClickSound) {
            const clickSound = new Audio(gameConfig.buttonClickSound);
            clickSound.volume = this.seVolume;
            clickSound.play().catch(error => {
                console.warn("按钮音效播放失败:", error);
            });
        }
    }

    initPage() {
        const currentData = this.storyData[this.currentPageIndex];
        if (!currentData) {
            alert("无任何剧情数据！");
            return;
        }

        // 显示图片或视频
        this.showSceneMedia(currentData);

        this.stopTypewriterEffect();
        if(this.narrationAudio) {
            this.narrationAudio.pause();
            this.narrationAudio = null;
        }
        this.typeWriterEffect(currentData.text);

        // 更新章节标题
        if(currentData.gameOver) {
            document.getElementById(gameConfig.elementIds.chapterTitle).textContent = `第${this.currentPageIndex + 1}章`;
        } else {
            document.getElementById(gameConfig.elementIds.chapterTitle).textContent = currentData.chapterTitle || `第${currentData.pageIndex + 1}章`;
        }

        // 更换背景
        if(currentData.background) {
            document.getElementById(gameConfig.elementIds.appContainer).style.backgroundImage = `url(${currentData.background})`;
        }

        // 设置背景音乐
        if(currentData.bgm) {
            this.playBackgroundMusic(currentData.bgm);
        }
        
        // 设置旁白
        if(currentData.narration) {
            this.playNarration(currentData.narration);
        }

        // 处理选项和按钮显示
        this.handleChoicesAndButtons(currentData);
        console.log("已渲染剧情：", currentData);
    }

    // 显示场景媒体（图片或视频）
    showSceneMedia(data) {
        const sceneContainer = document.getElementById(gameConfig.elementIds.sceneContainer);
        const sceneImage = document.getElementById(gameConfig.elementIds.sceneImage);
        
        // 清空场景容器
        sceneContainer.innerHTML = '';
        
        if (data.video) {
            // 如果有视频，则显示视频
            this.createVideoElement(data);
        } else if (data.image) {
            // 如果没有视频但有图片，则显示图片
            sceneImage.src = data.image;
            sceneImage.style.display = 'block';
            sceneContainer.appendChild(sceneImage);
        } else {
            // 如果既没有视频也没有图片，则隐藏场景容器
            sceneImage.style.display = 'none';
        }
    }

    // 创建视频元素
    createVideoElement(data) {
        const sceneContainer = document.getElementById(gameConfig.elementIds.sceneContainer);
        const sceneImage = document.getElementById(gameConfig.elementIds.sceneImage);
        
        // 移除旧的视频元素（如果有）
        if (this.videoElement) {
            this.videoElement.pause();
            sceneContainer.removeChild(this.videoElement);
        }

        // 创建新的视频元素
        this.videoElement = document.createElement('video');
        this.videoElement.src = data.video;
        this.videoElement.autoplay = data.videoAutoplay !== undefined ? data.videoAutoplay : true;
        this.videoElement.loop = data.videoLoop !== undefined ? data.videoLoop : false;
        this.videoElement.controls = false;
        this.videoElement.muted = data.videoMuted !== undefined ? data.videoMuted : false;
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = 'auto';
        this.videoElement.style.maxHeight = '50vh';
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('webkit-playsinline', '');
        this.videoElement.setAttribute('preload', 'metadata');

        this.videoElement.onended = () => {
            console.log('视频播放完成');
            // 可以在这里添加视频播放完成后要执行的操作
        };

        // 添加错误处理
        this.videoElement.onerror = (e) => {
            console.error('视频加载或播放失败:', e);
            // 如果视频播放失败，尝试显示替代内容或图片
            if (data.image) {
                sceneImage.src = data.image;
                sceneImage.style.display = 'block';
                sceneContainer.appendChild(sceneImage);
            }
        };

        // 确保视频元数据加载完成后才播放
        this.videoElement.onloadedmetadata = () => {
            console.log('视频元数据加载完成，准备播放');
            if (data.videoAutoplay !== false) {
                this.videoElement.play().catch(error => {
                    console.warn('视频自动播放失败，可能需要用户交互:', error);
                    this.videoElement.style.display = 'none';
                    if (data.image) {
                        sceneImage.src = data.image;
                        sceneImage.style.display = 'block';
                        sceneContainer.appendChild(sceneImage);
                    }
                });
            }
        };

        // 将视频元素添加到场景容器
        sceneContainer.appendChild(this.videoElement);
    }

    // 停止打字机效果
    stopTypewriterEffect() {
        if (this.typewriterTimeoutId) {
            clearTimeout(this.typewriterTimeoutId);
            this.typewriterTimeoutId = null;
        }
        this.isTyping = false;
    }

    // 打字机效果
    typeWriterEffect(text) {
        // 停止之前的打字机效果
        this.stopTypewriterEffect();
        
        // 标记正在打字
        this.isTyping = true;
        
        const scriptContentElement = document.getElementById(gameConfig.elementIds.scriptContent);
        scriptContentElement.innerHTML = '';
        
        let i = 0;
        const speed = gameConfig.typeWriterSpeed; // 使用配置的速度
        
        // 定义打字函数
        const type = () => {
            // 如果当前不在打字状态，则停止
            if (!this.isTyping) {
                return;
            }
            
            if (i < text.length) {
                // 处理特殊字符（如换行符）
                if (text.charAt(i) === '\n') {
                    scriptContentElement.innerHTML += '<br>';
                } else {
                    scriptContentElement.innerHTML += text.charAt(i);
                }
                i++;
                this.typewriterTimeoutId = setTimeout(type, speed);
            } else {
                // 打字完成，更新状态
                this.isTyping = false;
            }
        };
        type();
    }

    // 播放背景音乐
    playBackgroundMusic(audioPath) {
        // 暂停正在播放的背景音乐
        if(this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio = null;
        }

        // 创建新的音频对象
        this.bgmAudio = new Audio(audioPath);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
        
        // 尝试播放音乐
        this.bgmAudio.play().catch(error => {
            console.warn("背景音乐自动播放失败，可能需要用户交互:", error);
        });
    }

    // 播放音效
    playSoundEffect(audioPath) {
        // 停止之前播放的音效
        if(this.seAudio) {
            this.seAudio.pause();
            this.seAudio = null;
        }
        
        this.seAudio = new Audio(audioPath);
        this.seAudio.volume = this.seVolume;
        this.seAudio.play().catch(error => {
            console.warn("音效播放失败:", error);
        });
    }

    // 播放旁白
    playNarration(audioPath) {
        // 暂停正在播放的旁白
        if(this.narrationAudio) {
            this.narrationAudio.pause();
            this.narrationAudio = null;
        }

        // 创建新的音频对象
        this.narrationAudio = new Audio(audioPath);
        this.narrationAudio.volume = this.narrationVolume;
        this.narrationAudio.play().catch(error => {
            console.warn("旁白播放失败:", error);
        });
    }

    handleChoicesAndButtons(data) {
        const buttonGroup = document.querySelector(gameConfig.elementIds.buttonGroup);
        const nextPageBtn = document.getElementById(gameConfig.elementIds.nextPageBtn);

        if (data.hasChoices && data.choices && data.choices.length > 0) {
            nextPageBtn.style.display = "none";
            buttonGroup.style.display = "flex";
            buttonGroup.innerHTML = "";

            // 创建选项按钮
            data.choices.forEach((choice, index) => {
                const choiceBtn = document.createElement("div");
                choiceBtn.className = "game-btn";
                choiceBtn.textContent = choice.text;
                
                choiceBtn.addEventListener("click", () => {
                    this.playButtonClickSound();
                    
                    if (choice.gameOver) {
                        // 如果选项直接触发游戏结束
                        this.triggerEnd(
                            choice.gameOver === "win", 
                            choice.gameOverMessage || null,
                            choice.gameOverSound || null
                        );
                    } else if (choice.targetPageIndex !== undefined) {
                        // 跳转到指定页数
                        this.goToPage(choice.targetPageIndex);
                    }
                });

                buttonGroup.appendChild(choiceBtn);
            });
        } else {
            nextPageBtn.style.display = "block";
            buttonGroup.style.display = "none";

            // 检查是否直接触发游戏结束
            if (data.gameOver) {
                setTimeout(() => {
                    this.triggerEnd(
                        data.gameOver === "win", 
                        data.gameOverMessage || null,
                        data.gameOverSound || null
                    );
                }, 100);
            }
        }
    }

    // 绑定事件
    bindEvents() {
        const closeBtn = document.getElementById(gameConfig.elementIds.closeBtn);
        const settingsBtn = document.querySelectorAll(`#${gameConfig.elementIds.settingsBtn}`);
        const restartBtn = document.getElementById(gameConfig.elementIds.restartBtn);
        const settingCloseBtn = document.getElementById(gameConfig.elementIds.settingCloseBtn);
        const backToMainBtn = document.getElementById(gameConfig.elementIds.backToMainBtn);
        const exitConfirmModal = document.getElementById(gameConfig.elementIds.exitConfirmModal);
        const confirmExitBtn = document.getElementById(gameConfig.elementIds.confirmExitBtn);
        const cancelExitBtn = document.getElementById(gameConfig.elementIds.cancelExitBtn);

        // 绑定下一页按钮事件
        const nextPageBtn = document.getElementById(gameConfig.elementIds.nextPageBtn);
        if (nextPageBtn) {
            nextPageBtn.replaceWith(nextPageBtn.cloneNode(true));
            const newNextPageBtn = document.getElementById(gameConfig.elementIds.nextPageBtn);
            newNextPageBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                this.nextPage();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                this.saveGameProgress();
                exitConfirmModal.style.display = "flex";
            });
        }
        
        if (settingsBtn) {
            settingsBtn.forEach(btn => {
                btn.replaceWith(btn.cloneNode(true));
                const newBtn = document.querySelector(`#${btn.id}:not([data-cloned])`);
                if(newBtn) {
                    newBtn.setAttribute('data-cloned', 'true');
                    newBtn.addEventListener("click", () => {
                        this.playButtonClickSound();
                        
                        // 显示设置界面
                        document.getElementById(gameConfig.elementIds.settingContainer).style.display = "flex";
                        
                        // 初始化音量控制，使用配置中的默认值
                        const bgmVolume = localStorage.getItem(gameConfig.storageKeys.bgmVolume) || gameConfig.defaultBgmVolume.toString();
                        const seVolume = localStorage.getItem(gameConfig.storageKeys.seVolume) || gameConfig.defaultSeVolume.toString();
                        const narrationVolume = localStorage.getItem(gameConfig.storageKeys.narrationVolume) || gameConfig.defaultNarrationVolume.toString();
                        
                        document.getElementById(gameConfig.elementIds.bgmVolumeSlider).value = bgmVolume;
                        document.getElementById(gameConfig.elementIds.seVolumeSlider).value = seVolume;
                        document.getElementById(gameConfig.elementIds.narrationVolumeSlider).value = narrationVolume;
                        
                        document.getElementById(gameConfig.elementIds.bgmVolumeValue).textContent = `${bgmVolume}%`;
                        document.getElementById(gameConfig.elementIds.seVolumeValue).textContent = `${seVolume}%`;
                        document.getElementById(gameConfig.elementIds.narrationVolumeValue).textContent = `${narrationVolume}%`;
                    });
                }
            });
        }
        
        // 绑定设置界面的关闭按钮
        if(settingCloseBtn) {
            settingCloseBtn.replaceWith(settingCloseBtn.cloneNode(true));
            const newSettingCloseBtn = document.getElementById(gameConfig.elementIds.settingCloseBtn);
            newSettingCloseBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                document.getElementById(gameConfig.elementIds.settingContainer).style.display = "none";
            });
        }
        
        // 绑定音量滑块事件
        this.bindVolumeControlEvents();

        // 绑定重新开始按钮事件
        if(restartBtn) {
            restartBtn.replaceWith(restartBtn.cloneNode(true));
            const newRestartBtn = document.getElementById(gameConfig.elementIds.restartBtn);
            newRestartBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                this.restartGame();
            });
        }
        
        // 绑定返回主界面按钮事件
        if(backToMainBtn) {
            backToMainBtn.replaceWith(backToMainBtn.cloneNode(true));
            const newBackToMainBtn = document.getElementById(gameConfig.elementIds.backToMainBtn);
            newBackToMainBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                this.backToMainInterface();
            });
        }
        
        // 绑定退出确认模态框的确认按钮
        if(confirmExitBtn) {
            confirmExitBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                this.backToMainInterface();
                exitConfirmModal.style.display = "none";
            });
        }
        
        // 绑定退出确认模态框的取消按钮
        if(cancelExitBtn) {
            cancelExitBtn.addEventListener("click", () => {
                this.playButtonClickSound();
                exitConfirmModal.style.display = "none";
            });
        }
        
        // 绑定模态框背景点击事件（点击背景关闭模态框）
        if(exitConfirmModal) {
            exitConfirmModal.addEventListener("click", (e) => {
                if(e.target === exitConfirmModal) {
                    exitConfirmModal.style.display = "none";
                }
            });
        }
    }

    // 绑定音量控制事件
    bindVolumeControlEvents() {
        const bgmSlider = document.getElementById(gameConfig.elementIds.bgmVolumeSlider);
        const seSlider = document.getElementById(gameConfig.elementIds.seVolumeSlider);
        const narrationSlider = document.getElementById(gameConfig.elementIds.narrationVolumeSlider);
        
        const bgmValue = document.getElementById(gameConfig.elementIds.bgmVolumeValue);
        const seValue = document.getElementById(gameConfig.elementIds.seVolumeValue);
        const narrationValue = document.getElementById(gameConfig.elementIds.narrationVolumeValue);

        if(bgmSlider && bgmValue) {
            bgmSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                bgmValue.textContent = `${volume}%`;
                this.bgmVolume = volume / 100;
                
                // 如果正在播放背景音乐，更新其音量
                if(this.bgmAudio) {
                    this.bgmAudio.volume = this.bgmVolume;
                }
                localStorage.setItem(gameConfig.storageKeys.bgmVolume, volume);
            });
        }

        if(seSlider && seValue) {
            seSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                seValue.textContent = `${volume}%`;
                this.seVolume = volume / 100;
                localStorage.setItem(gameConfig.storageKeys.seVolume, volume);
            });
        }

        if(narrationSlider && narrationValue) {
            narrationSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                narrationValue.textContent = `${volume}%`;
                this.narrationVolume = volume / 100;
                
                // 如果正在播放旁白，更新其音量
                if(this.narrationAudio) {
                    this.narrationAudio.volume = this.narrationVolume;
                }
                
                localStorage.setItem(gameConfig.storageKeys.narrationVolume, volume);
            });
        }
    }

    // 重启游戏
    restartGame() {
        // 重置游戏状态
        this.currentPageIndex = 0; // 从第一页开始
        
        // 重置容器显示状态
        document.getElementById(gameConfig.elementIds.appContainer).style.display = "flex";
        document.getElementById(gameConfig.elementIds.endContainer).style.display = "none";
        
        // 重置游戏音量
        this.bgmVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.bgmVolume)) / 100 || gameConfig.defaultBgmVolume / 100;
        this.seVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.seVolume)) / 100 || gameConfig.defaultSeVolume / 100;
        this.narrationVolume = parseInt(localStorage.getItem(gameConfig.storageKeys.narrationVolume)) / 100 || gameConfig.defaultNarrationVolume / 100;
        
        // 重新初始化游戏
        this.initPage();
        this.bindEvents();
    }

    // 返回主界面
    backToMainInterface() {
        // 停止所有音频
        if(this.bgmAudio) {
            this.bgmAudio.pause();
        }
        if(this.narrationAudio) {
            this.narrationAudio.pause();
        }
        // 停止视频
        if(this.videoElement) {
            this.videoElement.pause();
        }
        this.stopTypewriterEffect();
        
        // 隐藏游戏容器和结束容器
        document.getElementById(gameConfig.elementIds.appContainer).style.display = "none";
        document.getElementById(gameConfig.elementIds.endContainer).style.display = "none";
        document.getElementById(gameConfig.elementIds.settingContainer).style.display = "none";
        
        // 显示主界面
        document.getElementById(gameConfig.elementIds.mainInterface).style.display = "flex";
    }

    // 下一页
    nextPage() {
        const currentData = this.storyData[this.currentPageIndex];
        this.stopTypewriterEffect();
        
        if (currentData && currentData.nextpageIndex !== undefined) {
            // 如果当前数据指定了下一页，则跳转到指定页
            this.goToPage(currentData.nextpageIndex);
        } else {
            // 否则按顺序查找下一页
            const nextPageIndex = this.currentPageIndex + 1;
            const nextData = this.storyData[nextPageIndex];
            
            if (nextData) {
                this.goToPage(nextData.pageIndex);
            } else {
                // 没有下一页，触发默认结局（不推荐使用，请手动配置完整的游戏结束逻辑）
                if(gameConfig.defaultEnd.triggerOnNoNextChapter) {
                    this.triggerEnd(gameConfig.defaultEnd.defaultResult);
                }
            }
        }
    }

 // 跳转到指定页
    goToPage(pageIndex) {
        // 停止视频播放（如果有的话）
        if(this.videoElement) {
            this.videoElement.pause();
        }
        this.stopTypewriterEffect();
        this.currentPageIndex = pageIndex;
        this.saveGameProgress();
        this.initPage(); // 重新初始化页面
        this.bindEvents(); // 重新绑定事件
    }

    // 触发游戏结束
    triggerEnd(isWin = false, customMessage = null, gameOverSound = null) {
        // 停止背景音乐
        if(this.bgmAudio) {
            this.bgmAudio.pause();
        }
        
        // 停止旁白
        if(this.narrationAudio) {
            this.narrationAudio.pause();
        }
        // 停止视频
        if(this.videoElement) {
            this.videoElement.pause();
        }
        // 停止打字效果
        this.stopTypewriterEffect();
        
        // 播放结局音效
        if(gameOverSound) {
            this.playSoundEffect(gameOverSound);
        }
        
        // 清除游戏进度
        SealScriptGame.clearGameProgress();
        
        // 隐藏游戏容器
        document.getElementById(gameConfig.elementIds.appContainer).style.display = "none";
        
        // 显示结束容器
        const endContainer = document.getElementById(gameConfig.elementIds.endContainer);
        endContainer.style.display = "flex";
        
        // 设置结局标题和消息
        const endTitle = document.getElementById(gameConfig.elementIds.endTitle);
        const endMessage = document.getElementById(gameConfig.elementIds.endMessage);
        
        if (isWin) {
            endTitle.textContent = gameConfig.defaultEnd.defaultWinMessage;
            endMessage.textContent = customMessage || "您已成功完成游戏！";
            endContainer.classList.add('win');
            endContainer.classList.remove('lose');
        } else {
            endTitle.textContent = "游戏结束";
            endMessage.textContent = customMessage || gameConfig.defaultEnd.defaultLoseMessage;
            endContainer.classList.add('lose');
            endContainer.classList.remove('win');
        }
    }

    // 提供外部调用的方法来触发胜利结局
    triggerWin(message = null) {
        this.triggerEnd(true, message);
    }

    // 提供外部调用的方法来触发失败结局
    triggerLose(message = null) {
        this.triggerEnd(false, message);
    }
}