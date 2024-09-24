document.getElementById('generate-logo-button').addEventListener('click', function() {
    const logoText = document.getElementById('logo-text').value;

    if (!logoText.trim()) {
        alert('请输入要生成LOGO的文本');
        return;
    }

    // 显示加载中提示
    const loadingText = document.getElementById('loading-text');
    loadingText.style.display = 'block';

    // 调用API生成LOGO
    fetch(`https://api.pearktrue.cn/api/aidesignfont/?text=${encodeURIComponent(logoText)}&type=json`)
        .then(response => response.json())
        .then(data => {
            // 隐藏加载中提示
            loadingText.style.display = 'none';

            if (data.code === 200) {
                // 显示生成的LOGO图片
                const logoImage = document.getElementById('generated-logo');
                logoImage.src = data.data.imgurl;

                // 显示结果区域
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('生成LOGO失败，请重试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingText.style.display = 'none'; // 隐藏加载提示
            alert('请求失败，请重试。');
        });
});
