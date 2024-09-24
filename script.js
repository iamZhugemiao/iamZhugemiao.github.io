window.requestAnimationFrame = window.requestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.msRequestAnimationFrame;

var width, height, starCount, circleRadius, circleCenter, 
    starDensity = .216, speedCoeff = .05, first = !0, 
    giantColor = "180,184,240", starColor = "226,225,142", 
    cometColor = "226,225,224", canva = document.querySelector(".vh-bg"), 
    stars = [];

function create_vh_starry_sky() {
    VH_STARRY_SKY = canva.getContext("2d");
    for (var t = 0; t < starCount; t++) {
        stars[t] = new Star();
        stars[t].reset();
    }
    draw();
}

function draw() {
    VH_STARRY_SKY.clearRect(0, 0, width, height);
    for (var t = stars.length, i = 0; i < t; i++) {
        var e = stars[i];
        e.move();
        e.fadeIn();
        e.fadeOut();
        e.draw();
    }
    window.requestAnimationFrame(draw);
}

function Star() {
    this.reset = function() {
        this.giant = getProbability(3);
        this.comet = !this.giant && !first && getProbability(10);
        this.x = getRandInterval(0, width - 10);
        this.y = getRandInterval(0, height);
        this.r = getRandInterval(1.1, 2.6);
        this.dx = getRandInterval(speedCoeff, 6 * speedCoeff) + 
            (this.comet + 1 - 1) * speedCoeff * 
            getRandInterval(50, 120) + 2 * speedCoeff;
        this.dy = -getRandInterval(speedCoeff, 6 * speedCoeff) - 
            (this.comet + 1 - 1) * speedCoeff * 
            getRandInterval(50, 120);
        this.fadingOut = null;
        this.fadingIn = !0;
        this.opacity = 0;
        this.opacityTresh = getRandInterval(.2, 1 - .4 * (this.comet + 1 - 1));
        this.do = getRandInterval(5e-4, .002) + .001 * (this.comet + 1 - 1);
    };

    this.fadeIn = function() {
        this.fadingIn && (this.fadingIn = !(this.opacity > this.opacityTresh), 
            this.opacity += this.do);
    };

    this.fadeOut = function() {
        this.fadingOut && (this.fadingOut = !(this.opacity < 0), 
            this.opacity -= this.do / 2, 
            (this.x > width || this.y < 0) && (this.fadingOut = !1, 
                this.reset()));
    };

    this.draw = function() {
        if (VH_STARRY_SKY.beginPath(), this.giant) {
            VH_STARRY_SKY.fillStyle = "rgba(" + giantColor + "," + this.opacity + ")";
            VH_STARRY_SKY.arc(this.x, this.y, 2, 0, 2 * Math.PI, !1);
        } else if (this.comet) {
            VH_STARRY_SKY.fillStyle = "rgba(" + cometColor + "," + this.opacity + ")";
            VH_STARRY_SKY.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, !1);
            for (var t = 0; t < 30; t++) {
                VH_STARRY_SKY.fillStyle = "rgba(" + cometColor + "," + 
                    (this.opacity - this.opacity / 20 * t) + ")";
                VH_STARRY_SKY.rect(this.x - this.dx / 4 * t, 
                    this.y - this.dy / 4 * t - 2, 2, 2);
                VH_STARRY_SKY.fill();
            }
        } else {
            VH_STARRY_SKY.fillStyle = "rgba(" + starColor + "," + this.opacity + ")";
            VH_STARRY_SKY.rect(this.x, this.y, this.r, this.r);
        }
        VH_STARRY_SKY.closePath();
        VH_STARRY_SKY.fill();
    };

    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
        !1 === this.fadingOut && this.reset();
        (this.x > width - width / 4 || this.y < 0) && (this.fadingOut = !0);
    };

    setTimeout(function() {
        first = !1;
    }, 50);
}

function getProbability(t) {
    return Math.floor(1e3 * Math.random()) + 1 < 10 * t;
}

function getRandInterval(t, i) {
    return Math.random() * (i - t) + t;
}

function windowResizeHandler() {
    width = window.innerWidth;
    height = window.innerHeight;
    starCount = width * starDensity;
    circleRadius = width > height ? height / 2 : width / 2;
    circleCenter = { x: width / 2, y: height / 2 };
    canva.setAttribute("width", width);
    canva.setAttribute("height", height);
}

windowResizeHandler();
window.addEventListener("resize", windowResizeHandler, !1);
create_vh_starry_sky();

document.getElementById('tools-link').addEventListener('click', function() {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('tools-page').style.display = 'block';
});
document.getElementById('home-link').addEventListener('click', function() {
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('tools-page').style.display = 'none';
});

// 主题切换
const themeSelector = document.getElementById('theme-selector');
themeSelector.addEventListener('change', function() {
    document.body.className = 'theme-' + themeSelector.value;
});

// 热搜功能
const hotSearchTabs = document.querySelectorAll('.hot-search-tab');
const hotSearchContent = document.getElementById('hotSearchContent');

function showLoading() {
    hotSearchContent.innerHTML = '<div class="loading"></div>';
}

async function fetchHotSearchData() {
    try {
        const response = await fetch('https://api.vvhan.com/api/hotlist/all');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching hot search data:', error);
        return [];
    }
}

function displayHotSearchData(data, source) {
    hotSearchContent.innerHTML = '';
    const sourceData = data.find(item => item.name === source);
    if (sourceData && sourceData.data) {
        sourceData.data.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'hot-search-item';
            div.innerHTML = `
                <span class="hot-search-item-title"><strong>${index + 1}.</strong> ${item.title}</span>
                <span class="hot-search-item-info">${item.hot || ''}</span>
            `;
            div.addEventListener('click', () => {
                window.open(item.url || item.mobil_url, '_blank');
            });
            hotSearchContent.appendChild(div);
        });
    } else {
        hotSearchContent.innerHTML = '<p>暂无数据</p>';
    }
}

let cachedData = null;

hotSearchTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
        hotSearchTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const source = tab.textContent;
        
        showLoading();

        if (!cachedData) {
            cachedData = await fetchHotSearchData();
        }
        displayHotSearchData(cachedData, source);
    });
});

// 初始加载虎扑热搜
showLoading();
fetchHotSearchData().then(data => {
    cachedData = data;
    displayHotSearchData(data, '虎扑');
});

let currentEmail = null;

document.getElementById('getEmailBtn').addEventListener('click', async function() {
    if (!currentEmail) {
        // 申请邮箱
        const response = await fetch('https://api.pearktrue.cn/api/email/?type=get');
        const data = await response.json();
        
        if (data.code === 200) {
            currentEmail = data.email;
            document.getElementById('emailInfo').innerText = `您的临时邮箱: ${currentEmail}，有效时间: ${data.time}`;
            document.getElementById('emailInfo').style.display = 'block';
            
            // 更改按钮为“刷新收件箱”
            this.innerText = '刷新收件箱！';
        }
    } else {
        // 刷新收件箱
        const response = await fetch(`https://api.pearktrue.cn/api/email/?type=receive&email=${currentEmail}`);
        const data = await response.json();

        if (data.code === 200 && data.receivedata.length > 0) {
            const messagesList = document.getElementById('emailMessages');
            messagesList.innerHTML = ''; // 清空之前的邮件列表
            data.receivedata.forEach((message) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>发件人:</strong> ${message.from}<br>
                    <strong>主题:</strong> ${message.subject}<br>
                    <strong>时间:</strong> ${message.time}<br>
                    <strong>内容:</strong> <div>${message.body.html}</div>
                `;
                messagesList.appendChild(listItem);
            });
        } else {
            document.getElementById('emailMessages').innerHTML = '<li>暂无新邮件</li>';
        }
    }
});

// 分页切换逻辑
const pageButtons = document.querySelectorAll('.page-btn');
const pages = document.querySelectorAll('.page-content');

pageButtons.forEach(button => {
    button.addEventListener('click', function() {
        const pageId = this.getAttribute('data-page');

        // 切换分页按钮的 active 样式
        pageButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // 切换显示内容
        pages.forEach(page => {
            if (page.id === 'page-' + pageId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    });
});

document.getElementById('parseBiliBtn').addEventListener('click', async function() {
    const bvid = document.getElementById('bvidInput').value;
    const bilibiliInfoDiv = document.getElementById('bilibiliInfo');

    if (bvid) {
        // 调用API
        const response = await fetch(`https://api.pearktrue.cn/api/bilibili/parse.php?bvid=${bvid}`);
        const data = await response.json();

        if (data.code === 200) {
            const videoData = data.data;
            bilibiliInfoDiv.innerHTML = `
                <p><strong>视频标题:</strong> ${videoData.title}</p>
                <p><strong>UP主:</strong> ${videoData.author}</p>
                <p><strong>视频描述:</strong> ${videoData.desc.replace(/\n/g, '<br>')}</p>
                <p><strong>视频格式:</strong> ${videoData.videos[0].format} - 大小: ${videoData.videos[0].size}</p>
                <p><a href="${videoData.videos[0].videourl}" target="_blank">点击下载视频</a></p>
            `;
            bilibiliInfoDiv.style.display = 'block';
        } else {
            bilibiliInfoDiv.innerHTML = `<p>解析失败，请检查BV号是否正确。</p>`;
            bilibiliInfoDiv.style.display = 'block';
        }
    } else {
        bilibiliInfoDiv.innerHTML = `<p>请输入有效的BV号。</p>`;
        bilibiliInfoDiv.style.display = 'block';
    }
});

// Stench Number Tool Logic
document.getElementById('stenchBtn').addEventListener('click', async function() {
    const num = document.getElementById('stenchInput').value;
    const resultDiv = document.getElementById('stenchResult');

    if (num) {
        const response = await fetch(`https://api.pearktrue.cn/api/stench/?num=${num}`);
        const data = await response.json();

        if (data.code === 200) {
            resultDiv.innerHTML = `<p><strong>公式:</strong> ${data.stench}</p>`;
        } else {
            resultDiv.innerHTML = `<p>生成失败，请检查输入。</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p>请输入一个有效的数字。</p>`;
    }
});

// Short Link Tool Logic
document.getElementById('shortLinkBtn').addEventListener('click', async function() {
    const longUrl = document.getElementById('longUrlInput').value;
    const shortLinkResultDiv = document.getElementById('shortLinkResult');
    if (longUrl) {
        const response = await fetch(`https://api.pearktrue.cn/api/short/dwz.php?url=${encodeURIComponent(longUrl)}`);
        const data = await response.json();
        if (data.code === 200) {
            shortLinkResultDiv.innerHTML = `<p><strong>短链接:</strong> <a href="${data.short_url}" target="_blank">${data.short_url}</a></p>`;
        } else {
            shortLinkResultDiv.innerHTML = `<p>生成失败，请检查输入的链接。</p>`;
        }
    } else {
        shortLinkResultDiv.innerHTML = `<p>请输入一个有效的长链接。</p>`;
    }
});


document.getElementById('convertBtn').addEventListener('click', async function() {
    const text = document.getElementById('convertInput').value;
    const type = document.getElementById('convertType').value;
    const resultDiv = document.getElementById('convertResult');

    if (text) {
        const response = await fetch(`https://api.pearktrue.cn/api/conversion/word.php?text=${encodeURIComponent(text)}&type=${type}`);
        const data = await response.json();
        
        if (data.code === 200) {
            resultDiv.innerHTML = `<p><strong>转换后:</strong> ${data.conversion}</p>`;
        } else {
            resultDiv.innerHTML = `<p>转换失败，请检查输入。</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p>请输入需要转换的文本。</p>`;
    }
});
document.getElementById('expressBtn').addEventListener('click', async function() {
    const order = document.getElementById('expressInput').value;
    const resultDiv = document.getElementById('expressResult');
    
    if (order) {
        const response = await fetch(`https://api.pearktrue.cn/api/kuaidi/?order=${encodeURIComponent(order)}`);
        const data = await response.json();

        if (data.code === 200) {
            resultDiv.innerHTML = `
                <p><strong>快递公司:</strong> ${data.company}</p>
                <p><strong>单号:</strong> ${data.mailNo}</p>
                <h4>物流信息:</h4>
                ${data.data.map(item => `<p>${item.time} - ${item.context}</p>`).join('')}
            `;
        } else {
            resultDiv.innerHTML = `<p>查询失败，请检查输入的快递单号。</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p>请输入有效的快递单号。</p>`;
    }
});

document.getElementById('poemBtn').addEventListener('click', async function() {
    const keyword = document.getElementById('poemInput').value;
    const resultDiv = document.getElementById('poemResult');

    if (keyword) {
        const response = await fetch(`https://api.pearktrue.cn/api/shiwen/?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        if (data.code === '200') {
            resultDiv.innerHTML = data.data.map(poem => `
                <h4>${poem.title} - ${poem.author} (${poem.dynasty})</h4>
                <p>${poem.content.replace(/\n/g, '<br>')}</p>
            `).join('');
        } else {
            resultDiv.innerHTML = `<p>查询失败，请检查输入的关键词。</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p>请输入搜索关键词。</p>`;
    }
});

document.getElementById('historyBtn').addEventListener('click', async function() {
    const resultDiv = document.getElementById('historyResult');

    const response = await fetch('https://api.pearktrue.cn/api/lsjt/?type=json');
    const data = await response.json();

    if (data.code === 200) {
        resultDiv.innerHTML = `
            <p><strong>日期:</strong> ${data.time}</p>
            <h4>历史事件:</h4>
            <ul>
                ${data.data.map(event => `<li>${event}</li>`).join('')}
            </ul>
        `;
    } else {
        resultDiv.innerHTML = `<p>获取失败，请稍后再试。</p>`;
    }
});

document.getElementById('videoParseBtn').addEventListener('click', async function() {
    const videoUrl = document.getElementById('videoUrlInput').value;
    const resultDiv = document.getElementById('videoResult');

    if (videoUrl) {
        const response = await fetch(`https://api.pearktrue.cn/api/video/api.php?url=${encodeURIComponent(videoUrl)}`);
        const data = await response.json();

        if (data.code === 200) {
            resultDiv.innerHTML = `
                <p><strong>视频标题:</strong> ${data.data.title}</p>
                <p><a href="${data.data.url}" target="_blank" class="button">点击下载视频</a></p>
            `;
        } else {
            resultDiv.innerHTML = `<p>解析失败，请检查输入的链接。</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p>请输入有效的视频链接。</p>`;
    }
});

document.getElementById('websiteResourceBtn').addEventListener('click', async function() {
    const websiteUrl = document.getElementById('websiteUrlInput').value;
    const resultDiv = document.getElementById('websiteResourceResult');

    if (websiteUrl) {
        const response = await fetch(`https://api.pearktrue.cn/api/website/resources.php?url=${encodeURIComponent(websiteUrl)}`);
        const data = await response.json();

        if (data.code === "200") {
            resultDiv.innerHTML = `
                <p><strong>资源总数:</strong> ${data.count}</p>
                <h4>资源列表:</h4>
                <ul>
                    ${data.data.list.map(resource => `
                        <li>
                            <strong>类型:</strong> ${resource.type} 
                            <strong>名称:</strong> ${resource.name} 
                            <a href="${resource.src}" target="_blank">下载资源</a>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            resultDiv.innerHTML = `<p>获取失败，请检查输入的网站链接。</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p>请输入有效的网站链接。</p>`;
    }
});
