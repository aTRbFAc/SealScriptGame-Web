# SealScriptGame Web（图章文篇游戏交互架构）

**开发者：文幻工作室**

一个基于Web的图章文篇游戏交互架构，支持图文展示、剧情分支、音效控制等功能，适用于制作视觉小说、图文类游戏。

## 使用说明

### 一、基础教程（零基础小白快速上手篇）
1.在config.css中添加首页背景图路径（第16-17行）
2.在data.js中添加游戏章节剧情配置（可以直接按照模板替换）
3.在浏览器打开index.html预览游戏

### 二、进阶教程（轻松制作完整H5游戏）
1.在index.html中修改游戏版本号配置（第18行）
2.在config.css中添加首页背景图路径（第16-17行）
3.在config.js中修改游戏配置（第4-26行）
4.在data.js中添加游戏章节剧情配置（可以直接按照模板替换）
5.在浏览器打开index.html预览游戏（或者将项目放置在Web服务器上、使用http-server等）

### 三、Web大师级使用方法（自定义项目）
1.在index.html中修改游戏版本号配置（第18行）
2.在config.css中添加首页背景图路径（第16-17行）
3.在config.css中自定义自己的游戏样式、主题颜色等……
3.在config.js中修改游戏配置（第4-26行）
4.在data.js中添加游戏章节剧情配置（可以直接按照模板替换）
5.可以修改整个游戏核心逻辑、自定义自己专属的游戏引擎
6.将项目放置在Web服务器上、使用http-server、打包为软件程序等


## 目录结构
SealScriptGame Web/ 
├── css/                        # 样式文件夹
│ ├── config.css                # 游戏界面配置文件 
│ └── style.css                 # 游戏样式文件 
├── data/                       # 游戏数据文件夹
│ └── data.js                   # 游戏剧情数据文件 
├── js/                         # JS逻辑文件夹
│ ├── SealScriptGame_core.js    # 游戏核心逻辑 
│ ├── config.js                 # 游戏配置文件 
│ ├── game-over.js              # 游戏结束处理 
│ ├── main.js                   # 游戏主入口文件 
│ └── start-game.js             # 游戏开始界面 
├── audio/                      # 音频文件夹
├── images/                     # 图片文件夹
├── fonts/                      # 字体文件夹
├── index.html                  # 游戏主HTML文件
├── CHANGELOG.md                # 项目更新日志
├── LICENSE                     # 许可证文件
└── README.md                   # 项目说明文件


## 功能特性

### 1. 游戏流程管理
- 开始游戏界面
- 游戏主界面
- 结局显示界面
- 设置界面

### 2. 剧情展示系统
- 图文并茂的剧情展示
- 打字机效果文本
- 分支剧情选择

### 3. 音频系统
- 背景音乐播放（循环）
- 音效播放
- 旁白语音
- 音量控制（背景音乐、音效、旁白）

### 4. 用户界面
- 响应式设计
- 可定制的UI样式
- 移动端适配
- 设置界面

### 5. 数据持久化
- 音量设置本地存储
- 支持多章节剧情配置
- 支持游戏进度本地存储

## 安装与运行

### 环境要求
- 任意现代浏览器（Chrome, Firefox, Safari, Edge等）
- 本地服务器（推荐）或直接打开HTML文件

### 运行方法
1. 克隆或下载项目代码
2. 将项目放置在Web服务器上，或者直接双击[index.html]打开
3. 在浏览器中查看游戏

### 开发环境配置
如果您计划开发或修改游戏：
1. 安装Node.js（可选，用于本地开发服务器）
2. 使用VSCode或其他编辑器打开项目
3. 推荐安装Live Server插件进行实时预览

## 配置说明

### CSS配置（config.css）
主要配置项包括：
- 背景图片设置
- 颜色主题
- 字体大小、样式
- 按钮尺寸
- 动画效果

### 游戏配置（config.js）
主要配置项包括：
- 打字机效果速度
- 默认音量设置
- 按钮音效路径
- 字体全局生效
- 默认结局配置
- 本地存储键名

### 剧情数据（data.js）
示例数据结构模板请查看data.js

## 自定义开发

### 添加新章节
在data/data1.js中添加新的章节数据对象，确保章节编号唯一

### 更换资源
图片：替换image.png或在剧情数据中指定新路径
音频：替换audio.mp3或在剧情数据中指定新路径
背景：在CSS或剧情数据中设置
字体样式：在CSS中设置

### 修改样式
在css/config.css中调整颜色、字体、字体样式、尺寸等参数
在css/style.css中修改具体的样式规则

### API接口
SealScriptGame类方法
initPage() - 初始化页面内容
typeWriterEffect(text) - 执行打字机效果
playBackgroundMusic(audioPath) - 播放背景音乐
playSoundEffect(audioPath) - 播放音效
playNarration(audioPath) - 播放旁白
goToChapter(chapterNumber) - 跳转到指定章节
triggerWin(message) - 触发胜利结局
triggerLose(message) - 触发失败结局
restartGame() - 重新开始游戏
StartGame类方法
showMainInterface() - 显示主界面
hideMainInterface() - 隐藏主界面
showSettings() - 显示设置界面
startGame() - 开始游戏


## 贡献者：文幻工作室
如有问题或建议，请联系项目维护者。
本项目采用 **MIT 许可证** 开源。
详细内容请查看 [LICENSE](LICENSE) 文件。
GitHub 仓库：[SealScriptGame-Web](https://github.com/aTRbFAc/SealScriptGame-Web)
工作室官网：[文幻工作室](https://atrbfac.top)
