document.getElementById('generate-button').addEventListener('click', function() {
    const prompt = document.getElementById('prompt-input').value;
    const url = document.getElementById('url-input').value;

    // 校验输入是否为空
    if (!prompt.trim() || !url.trim()) {
        alert('请填写主题和链接');
        return;
    }

    // 调用API生成二维码
    fetch(`https://api.pearktrue.cn/api/aiqrcode/?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 显示生成的二维码图片
                const qrcodeImage = document.getElementById('qrcode-image');
                qrcodeImage.src = data.imgurl;

                // 显示结果区域
                document.getElementById('result').style.display = 'block';
            } else {
                alert('二维码生成失败，请重试。');
            }
        })
        .catch(error => console.error('Error:', error));
});
