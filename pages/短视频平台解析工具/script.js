document.getElementById('parse-button').addEventListener('click', function() {
    const videoUrl = document.getElementById('video-url').value;

    if (!videoUrl.trim()) {
        alert('请输入视频链接');
        return;
    }

    // 显示加载中提示
    const loadingText = document.getElementById('loading-text');
    loadingText.style.display = 'block';

    // 调用API解析视频
    fetch(`https://api.pearktrue.cn/api/video/api.php?url=${encodeURIComponent(videoUrl)}`)
        .then(response => response.json())
        .then(data => {
            loadingText.style.display = 'none';
            if (data.code === 200) {
                // 显示视频信息
                document.getElementById('video-title').textContent = data.data.title;
                document.getElementById('video-cover').src = data.data.cover;
                const videoLink = document.getElementById('video-url-link');
                videoLink.href = data.data.url;
                videoLink.textContent = data.data.url;

                // 显示结果区域
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('解析视频失败，请重试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingText.style.display = 'none';
            alert('请求失败，请重试。');
        });
});
