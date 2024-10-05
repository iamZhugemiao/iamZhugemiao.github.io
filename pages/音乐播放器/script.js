class MusicPlayer {
    constructor() {
        // 初始化状态
        this.state = {
            currentPlaylist: [],
            currentSongIndex: -1,
            isPlaying: false,
            volume: 1,
            platform: 'netease', // 默认网易云音乐
            currentLyrics: null,
            lastActiveIndex: -1,
            loopMode: 'none',
        };

        // API接口配置
        this.apiEndpoints = {
            netease: 'https://api.xingzhige.com/API/NetEase_CloudMusic_new/',
            kugou: 'https://api.xingzhige.com/API/Kugou_GN_new/',
            migu: 'https://api.xingzhige.com/API/Kuwo_BD_new/',
            qqmusic: 'https://api.treason.cn/API/v1/QQ-VIP/?msg=',
        };

        // 初始化DOM元素引用
        this.initElements();
        // 设置事件监听
        this.setupEventListeners();
        // 从本地存储恢复音量设置
        this.loadVolumeFromStorage();

        const savedLoopMode = localStorage.getItem('playerLoopMode');
        if (savedLoopMode) {
            this.state.loopMode = savedLoopMode;
            this.updateLoopButtonUI();
        }

        document.addEventListener('DOMContentLoaded', () => {
            const loopIcon = document.getElementById('loop-icon');
            loopIcon.innerHTML = ''; // 确保一开始是空的
            updateLoopButtonUI(); // 更新图标
        });        
    }

    initElements() {
        // 播放器核心元素
        this.audio = document.getElementById('audio-player');
        
        // 控制按钮
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        // 搜索相关元素
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.platformSelect = document.getElementById('platform-select');
        this.songList = document.getElementById('song-list');
        
        // 进度和音量控制
        this.progress = document.getElementById('progress');
        this.progressBar = document.querySelector('.progress-bar');
        this.volumeSlider = document.getElementById('volume-slider');
        
        // 时间显示
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        
        // 歌曲信息显示
        this.albumCover = document.getElementById('album-cover');
        this.songTitle = document.getElementById('current-song');
        this.artistName = document.getElementById('current-artist');
        this.albumName = document.getElementById('current-album');

        this.loopBtn = document.getElementById('loop-icon');
    }

    setupEventListeners() {
        // 播放控制
        this.playBtn.onclick = () => this.togglePlay();
        this.prevBtn.onclick = () => this.playPrevious();
        this.nextBtn.onclick = () => this.playNext();
        
        // 搜索相关
        this.searchBtn.onclick = () => this.searchSongs();
        this.searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') this.searchSongs();
        };
        this.platformSelect.onchange = () => {
            this.state.platform = this.platformSelect.value;
        };
        
        // 音频事件
        this.audio.onplay = () => this.updatePlayButton(true);
        this.audio.onpause = () => this.updatePlayButton(false);
        this.audio.ontimeupdate = () => this.updateProgress();
        this.audio.onended = () => this.playNext();
        this.audio.onloadedmetadata = () => this.updateDuration();
        
        // 进度控制
        this.progressBar.onclick = (e) => this.seek(e);
        
        // 音量控制
        this.volumeSlider.oninput = (e) => this.setVolume(e.target.value / 100);

        this.audio.ontimeupdate = () => {
            this.updateProgress();
            this.updateLyrics(this.audio.currentTime);
        };

        // 更新音频结束事件处理
        this.audio.onended = () => this.handleSongEnd();
        
        // 循环模式切换
        this.loopBtn.onclick = () => this.toggleLoopMode();
    }

    handleSongEnd() {
        switch (this.state.loopMode) {
            case 'single':
                this.audio.currentTime = 0;
                this.audio.play();
                break;
            case 'list':
                if (this.state.currentSongIndex === this.state.currentPlaylist.length - 1) {
                    this.playSong(0); // 播放列表第一首
                } else {
                    this.playNext();
                }
                break;
        }
    }

    toggleLoopMode() {
        const modes = ['single', 'list'];
        const currentIndex = modes.indexOf(this.state.loopMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.state.loopMode = modes[nextIndex];
 
        // 保存到本地存储
        localStorage.setItem('playerLoopMode', this.state.loopMode);
 
        // 更新 UI
        this.updateLoopButtonUI();
    }

    updateLoopButtonUI() {
        const loopIcon = document.getElementById('loop-icon');
    
        // 重置所有可能的类名
        loopIcon.classList.remove('loop-single', 'loop-list');
    
        // 根据当前模式设置图标和样式
        switch (this.state.loopMode) {
            case 'single':
                loopIcon.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="currentColor"/>
                        <text x="10" y="15" font-size="8" fill="currentColor">1</text>
                    </svg>`;
                loopIcon.classList.add('loop-single');
                break;
            case 'list':
                loopIcon.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="currentColor"/>
                    </svg>`;
                loopIcon.classList.add('loop-list');
                break;
        }
    
        // 设置 SVG 的宽度和高度属性
        const svg = loopIcon.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', '27');
            svg.setAttribute('height', '27');
        }
    }

    async getKugouLyrics(songHash) {
        try {
            const response = await fetch(`https://api.xingzhige.com//API/lyrc/?type=kugou&id=${songHash}`);
            const data = await response.json();
            if (data.code === 0 && data.data.encode.context) {
                return this.parseLyrics(data.data.encode.context);
            }
            return null;
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            return null;
        }
    }

    parseLyrics(lyricsText) {
        const lines = lyricsText.split('\n');
        const lyrics = [];
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
 
        lines.forEach(line => {
            // 跳过元数据行
            if (line.startsWith('[ti:') || line.startsWith('[ar:') ||
                line.startsWith('[al:') || line.startsWith('[by:')) {
                return;
            }
 
            const match = timeRegex.exec(line);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);
                // 统一转换为秒
                const timeInSeconds = minutes * 60 + seconds + (milliseconds / (match[3].length === 2? 100 : 1000));
 
                // 提取歌词文本，去除时间标记和空白
                const text = line.substring(line.indexOf(']') + 1).trim();
                if (text) {
                    lyrics.push({
                        time: timeInSeconds,
                        text: text
                    });
                }
            }
        });
 
        return lyrics.sort((a, b) => a.time - b.time);
    }

    renderLyrics(lyrics) {
        if (!lyrics || !Array.isArray(lyrics)) return;
        
        const lyricsContainer = document.querySelector('.lyrics-container');
        lyricsContainer.innerHTML = '';
        this.currentLyrics = lyrics;

        // 添加上部填充
        const paddingTop = document.createElement('div');
        paddingTop.className = 'lyric-line padding';
        paddingTop.style.height = (lyricsContainer.offsetHeight / 2) + 'px';
        lyricsContainer.appendChild(paddingTop);

        // 添加歌词行
        lyrics.forEach((lyric, index) => {
            const lyricEl = document.createElement('div');
            lyricEl.className = 'lyric-line';
            lyricEl.textContent = lyric.text;
            lyricEl.setAttribute('data-time', lyric.time);
            lyricEl.setAttribute('data-index', index);
            lyricsContainer.appendChild(lyricEl);
        });

        // 添加下部填充
        const paddingBottom = paddingTop.cloneNode(true);
        lyricsContainer.appendChild(paddingBottom);
    }

    updateLyrics(currentTime) {
        if (!this.currentLyrics || !this.currentLyrics.length) return;

        const lyricsContainer = document.querySelector('.lyrics-container');
        const lines = lyricsContainer.querySelectorAll('.lyric-line:not(.padding)');
        
        let activeIndex = -1;
        
        // 找到当前应该高亮的歌词
        for (let i = 0; i < this.currentLyrics.length; i++) {
            if (i === this.currentLyrics.length - 1 || 
                (currentTime >= this.currentLyrics[i].time && 
                 currentTime < this.currentLyrics[i + 1].time)) {
                activeIndex = i;
                break;
            }
        }

        // 更新高亮状态
        if (activeIndex !== this.state.lastActiveIndex) {
            this.state.lastActiveIndex = activeIndex;
            
            lines.forEach((line, index) => {
                line.classList.toggle('active', index === activeIndex);
            });

            // 如果找到了当前行，则滚动到该位置
            if (activeIndex !== -1) {
                const activeLine = lines[activeIndex];
                const scrollPosition = activeLine.offsetTop - (lyricsContainer.offsetHeight / 2) + (activeLine.offsetHeight / 2);
                lyricsContainer.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    // 搜索歌曲
    async searchSongs() {
        const keyword = this.searchInput.value.trim();
        if (!keyword) return;

        // 保存搜索关键词
        this.state.lastSearchKeyword = keyword;

        try {
            this.showLoading();
            const platform = this.state.platform;
            let response;
            if (platform === 'qqmusic') {
                response = await fetch(`${this.apiEndpoints[platform]}${encodeURIComponent(keyword)}&type=json&n=`);
                const data = await response.json();
                if (data.code === 200) {
                    if (Array.isArray(data.data)) {
                        this.state.currentPlaylist = data.data.map(item => {
                            const [id, songInfo] = item.split(': ');
                            return {
                                songname: songInfo.split(' - ')[0],
                                name: songInfo.split(' - ')[1],
                                // 暂不获取 music_url 和 lyric
                            };
                        });
                    } else {
                        // 如果是单曲数据，将其包装成一个数组
                        this.state.currentPlaylist = [data.data];
                    }
                    this.renderSongList();
                    // 存储搜索列表数据
                    this.state.searchListData = this.state.currentPlaylist;
                } else {
                    this.showError('未找到相关歌曲');
                }
            } else {
                response = await fetch(`${this.apiEndpoints[platform]}?name=${encodeURIComponent(keyword)}&pagesize=100&br=2&n=`);
                const data = await response.json();

                if (data.code === 0 && data.data.length > 0) {
                    this.state.currentPlaylist = data.data;
                    this.renderSongList();

                    // 存储搜索列表数据
                    this.state.searchListData = data.data;
                } else {
                    this.showError('未找到相关歌曲');
                }
            }
        } catch (error) {
            this.showError('搜索失败，请重试');
            console.error('搜索错误:', error);
        }
    }

    // 播放指定歌曲
    async playSong(index) {
        if (index < 0 || index >= this.state.currentPlaylist.length) return;

        try {
            const platform = this.state.platform;
            if (platform === 'qqmusic') {
                const songData = this.state.currentPlaylist[index];
                this.state.currentSongIndex = index;

                // 专门获取一次 API 以获取完整的歌曲信息
                const response = await fetch(`${this.apiEndpoints[platform]}${encodeURIComponent(songData.songname)}&type=json&n=${index + 1}`);
                const fullSongData = await response.json();
                if (fullSongData.code === 200) {
                    this.updateNowPlaying(fullSongData.data);
                    this.audio.src = fullSongData.data.music_url;
                    this.audio.play();
                    this.highlightCurrentSong();

                    // 处理歌词
                    if (fullSongData.data.lyric) {
                        const lyrics = this.parseLyrics(fullSongData.data.lyric);
                        this.renderLyrics(lyrics);
                    } else {
                        this.clearLyrics();
                    }
                } else {
                    this.showError('获取歌曲信息失败');
                }
            } else {
                let response;
                response = await fetch(`${this.apiEndpoints[platform]}?name=${encodeURIComponent(this.state.lastSearchKeyword)}&n=${index + 1}&br=2&pagesize=100`);
                const data = await response.json();

                if (data.code === 0) {
                    this.state.currentSongIndex = index;
                    this.updateNowPlaying(data.data);
                    this.audio.src = data.data.src;
                    this.audio.play();
                    this.highlightCurrentSong();

                    // 清除之前的歌词
                    this.clearLyrics();

                    // 只有酷狗音乐时才获取歌词
                    if (this.state.platform === 'kugou' && this.state.searchListData) {
                        const songInSearchList = this.state.searchListData[index];
                        if (songInSearchList && songInSearchList.FileHash) {
                            const lyrics = await this.getKugouLyrics(songInSearchList.FileHash);
                            if (lyrics) {
                                this.renderLyrics(lyrics);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('播放错误:', error);
            this.showError('播放失败，请重试');
        }
    }

    clearLyrics() {
        this.currentLyrics = null;
        this.state.lastActiveIndex = -1;
        const lyricsContainer = document.querySelector('.lyrics-container');
        if (lyricsContainer) {
            lyricsContainer.innerHTML = this.state.platform === 'kugou' ? 
                '<div class="loading-lyrics">加载歌词中...</div>' : 
                '<div class="no-lyrics">当前平台暂不支持歌词显示</div>';
        }
    }

    // 更新正在播放的歌曲信息
    updateNowPlaying(songData) {
        this.songTitle.textContent = songData.song_name || songData.songname;
        this.artistName.textContent = songData.song_singer || songData.name;
        this.albumName.textContent = songData.album || '-';
        this.albumCover.src = songData.cover || '';
        document.title = `${songData.song_name || songData.songname} - ${songData.song_singer || songData.name}`;

        if (this.state.platform === 'kugou' && songData.FileHash) {
            this.getKugouLyrics(songData.FileHash).then(lyricsWithTime => {
                if (lyricsWithTime) {
                    const lyricsContainer = document.querySelector('.lyrics-container');
                    lyricsContainer.innerHTML = '';
                    lyricsWithTime.forEach(item => {
                        const lyricEl = document.createElement('div');
                        lyricEl.className = 'lyric-line';
                        lyricEl.textContent = item.text;
                        lyricsContainer.appendChild(lyricEl);
                    });
                } else {
                    alert('无法获取歌词');
                }
            });
        } else if (this.state.platform === 'qqmusic') {
            // 处理 QQ 音乐的歌词
            if (songData.lyric) {
                const lyrics = this.parseLyrics(songData.lyric);
                this.renderLyrics(lyrics);
            }
        }
    }

    updateProgress() {
        if (!this.audio.duration) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        
        // 更新歌词
        this.updateLyrics(this.audio.currentTime);
    }

    // 播放控制相关方法
    togglePlay() {
        if (this.audio.src) {
            if (this.audio.paused) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        } else if (this.state.currentPlaylist.length > 0) {
            this.playSong(0);
        }
    }

    playPrevious() {
        if (this.state.currentPlaylist.length > 0) {
            let newIndex = this.state.currentSongIndex - 1;
            if (newIndex < 0) newIndex = this.state.currentPlaylist.length - 1;
            this.playSong(newIndex);
        }
    }

    playNext() {
        if (this.state.currentPlaylist.length > 0) {
            let newIndex = this.state.currentSongIndex + 1;
            if (newIndex >= this.state.currentPlaylist.length) newIndex = 0;
            this.playSong(newIndex);
        }
    }

    // UI更新相关方法
    updatePlayButton(isPlaying) {
        this.playBtn.innerHTML = isPlaying ? 
            '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M6 4h4v16H6zm8 0h4v16h-4z"></path></svg>' :
            '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M8 5v14l11-7z"></path></svg>';
    }

    updateProgress() {
        if (!this.audio.duration) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }

    // 工具方法
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    seek(event) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    }

    setVolume(value) {
        this.state.volume = value;
        this.audio.volume = value;
        this.volumeSlider.value = value * 100;
        localStorage.setItem('playerVolume', value.toString());
    }

    loadVolumeFromStorage() {
        const savedVolume = localStorage.getItem('playerVolume');
        if (savedVolume !== null) {
            this.setVolume(parseFloat(savedVolume));
        }
    }

    // UI渲染方法
    renderSongList() {
        this.songList.innerHTML = '';
        this.state.currentPlaylist.forEach((song, index) => {
            const el = document.createElement('div');
            el.className = 'song-item';
            if (index === this.state.currentSongIndex) {
                el.classList.add('active');
            }
            
            el.innerHTML = `
                <div class="song-title">${song.songname}</div>
                <div class="song-artist">${song.name}</div>
            `;
            
            el.onclick = () => this.playSong(index);
            this.songList.appendChild(el);
        });
    }

    highlightCurrentSong() {
        const items = this.songList.getElementsByClassName('song-item');
        Array.from(items).forEach((item, index) => {
            item.classList.toggle('active', index === this.state.currentSongIndex);
        });
    }

    showLoading() {
        this.songList.innerHTML = '<div class="loading">搜索中...</div>';
    }


    showError(message) {
        this.songList.innerHTML = `<div class="error">${message}</div>`;
    }
}

// 初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
});
