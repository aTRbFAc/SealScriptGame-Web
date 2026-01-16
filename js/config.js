// 游戏配置文件
const gameConfig = {
    // 打字机效果配置
    typeWriterSpeed: 15, // 打字速度，单位毫秒
    
    // 默认音量
    defaultBgmVolume: 100,       // 背景音乐
    defaultSeVolume: 100,        // 游戏音效
    defaultNarrationVolume: 100, // 旁白音乐
    
    // 字体配置
    fontConfig: {
        globalFontEnabled: false,          // 是否启用全局字体样式
        textScriptOnly: true,              // 是否仅对文字框生效（当globalFontEnabled为false时此设置无效）
    },
    
    // 按钮音效路径
    buttonClickSound: '../audio/audio.mp3', // 全局按钮点击音效路径

    // 默认结局配置（不推荐使用，仅测试，建议手动配置游戏结束逻辑）
    defaultEnd: {
        triggerOnNoNextChapter: true,  // 当没有下一章节时是否触发默认结局
        defaultResult: true,           // 默认结局结果：true为胜利，false为失败
        defaultWinMessage: "恭喜获胜！",      // 默认胜利信息
        defaultLoseMessage: "很遗憾，游戏失败了。", // 默认失败信息
    },

 // 本地存储键名
    storageKeys: {
        bgmVolume: 'bgmVolume',
        seVolume: 'seVolume',
        narrationVolume: 'narrationVolume',
        gameProgress: 'gameProgress'  // 添加游戏进度存储键
    },
    
    // DOM元素ID
    elementIds: {
        mainInterface: 'main-interface',
        appContainer: 'app-container',
        endContainer: 'end-container',
        settingContainer: 'setting-container',
        sceneImage: 'sceneImage',
        scriptContent: 'scriptContent',
        chapterTitle: 'chapterTitle',
        buttonGroup: '.button-group',
        nextPageBtn: 'nextPageBtn',
        closeBtn: 'closeBtn',
        settingsBtn: 'settingshez',
        restartBtn: 'restartBtn',
        settingCloseBtn: 'close-setting',
        bgmVolumeSlider: 'bgm-volume',
        seVolumeSlider: 'se-volume',
        narrationVolumeSlider: 'narration-volume',
        bgmVolumeValue: 'bgm-volume-value',
        seVolumeValue: 'se-volume-value',
        narrationVolumeValue: 'narration-volume-value',
        endTitle: 'endTitle',
        endMessage: 'endMessage',
        backToMainBtn: 'backToMainBtn',
        exitConfirmModal: 'exit-confirm-modal',
        confirmExitBtn: 'confirm-exit-btn',
        cancelExitBtn: 'cancel-exit-btn',
        continueGameModal: 'continue-game-modal',  // 添加继续游戏模态框相关ID
        continueGameBtn: 'continue-game-btn',
        newGameBtn: 'new-game-btn'
    }
};

// 导出配置
window.gameConfig = gameConfig;