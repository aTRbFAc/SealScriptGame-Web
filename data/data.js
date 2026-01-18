window.storyData = [
    {
        pageIndex: 0,  // 使用页数索引定位
        chapterTitle: "第一章",  // 自定义章节标题
        image: "../images/image.png", // 图片路径
        video: "", // 视频路径，(如果设置了此项会优先显示视频而不是图片,不需要可以删掉三个video开头的配置)
        videoAutoplay: true, // 是否自动播放视频
        videoLoop: false, // 是否循环播放视频
        text: "游戏剧情\n（换行）",    // 这里写游戏剧情（如需换行可以使用\n）
        background: "../images/background1.jpg", // 更换游戏图文背景图功能，如果不需要可以删掉不写（启用一次全局生效，不启用则使用默认背景，可前往style.css修改默认背景）      
        bgm: "../audio/audio1.mp3", // 背景音乐路径（循环播放），如果不需要可以删掉不写（启用一次全局生效，不启用则不使用背景音乐）
        narration: "../audio/narration1.mp3", // 旁白音频路径，如果不需要可以删掉不写（切换章节时自动停止，不启用则不使用旁白）
        hasChoices: true,   // 设置此章节是否有选项（true有，false没有）
        choices: [          // 定义选项
            {
                text: "前往第二章",
                targetPageIndex: 1  // 点击之后跳转到下一页
            },
            {
                text: "前往第三章", 
                targetPageIndex: 2
            }
        ]
    },
    {
        pageIndex: 1,  // 第二页
        chapterTitle: "第二章",
        video: "../videos/video.mp4", // 视频路径
        videoAutoplay: true, // 是否自动播放视频
        videoLoop: true, // 是否循环播放视频
        text: "这是第二章的内容",
        background: "../images/background2.jpg", // 更换第二章的背景图，如果不更换可以删掉不写，直接沿用上一章的背景图
        bgm: "../audio/chapter2.mp3", // 更换第二章的背景音乐，如果不更换可以删掉不写，直接沿用上一章的背景音乐
        narration: "../audio/narration2.mp3", // 第二章旁白，如果不更换可以删掉不写
        hasChoices: false, // 此章节无选项，显示下一页按钮
        nextpageIndex: 2     // 指定下一页跳转到第三页
    },
    {
        pageIndex: 2,  // 第三页
        chapterTitle: "第三章",
        image: "../images/image3.png", // 图片路径
        text: "这是第三章的内容。",
        hasChoices: true,  // 此章节有选项
        choices: [
            {
                text: "游戏结束（胜利）",
                gameOver: "win",   // 触发胜利结局
                gameOverMessage: "恭喜你完成了任务，取得了胜利！",  // 自定义结局内容
                gameOverSound: "../audio/audio.mp3" // 自定义胜利音效，如果不需要可以删掉不写（非循环播放，不启用则不使用游戏结束音效）
            },
            {
                text: "游戏结束（失败）",
                gameOver: "lose",  // 触发失败结局
                gameOverMessage: "很遗憾，你失败了，游戏结束。",   // 自定义结局内容
            }
        ]
    }
];