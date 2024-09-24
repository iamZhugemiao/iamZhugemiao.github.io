document.getElementById('generate-button').addEventListener('click', function() {
    const prompt = document.getElementById('prompt-input').value;
    const model = document.getElementById('model-select').value;

    if (!prompt.trim()) {
        alert('请输入绘画关键词');
        return;
    }

    // 显示加载中提示
    const loadingText = document.getElementById('loading-text');
    loadingText.style.display = 'block';

    // 调用API生成AI绘画
    fetch(`https://api.pearktrue.cn/api/stablediffusion/?prompt=${encodeURIComponent(prompt)}&model=${model}`)
        .then(response => response.json())
        .then(data => {
            // 隐藏加载中提示
            loadingText.style.display = 'none';

            if (data.code === 200) {
                // 显示生成的图片
                const img = document.getElementById('generated-image');
                img.src = data.imgurl;

                // 显示结果区域
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('生成AI绘画失败，请重试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingText.style.display = 'none'; // 隐藏加载提示
            alert('请求失败，请重试。');
        });
});
