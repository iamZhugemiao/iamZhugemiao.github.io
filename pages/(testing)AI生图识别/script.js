document.getElementById('check-button').addEventListener('click', function() {
    const fileInput = document.getElementById('image-input').files[0];
    const imageUrl = document.getElementById('image-url').value;

    // 显示加载中提示
    const loadingText = document.getElementById('loading-text');
    loadingText.style.display = 'block';

    let formData;

    if (fileInput) {
        // 上传文件方式
        formData = new FormData();
        formData.append('file', fileInput);
        
        // 调用API上传图像文件
        fetch('https://api.pearktrue.cn/api/aicheck/image/index.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadingText.style.display = 'none';
            if (data.code === 200) {
                document.getElementById('result-text').textContent = data.msg;
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('检查图像失败，请重试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingText.style.display = 'none';
            alert('请求失败，请重试。');
        });

    } else if (imageUrl.trim()) {
        // 使用URL的方式
        fetch('https://api.pearktrue.cn/api/aicheck/image/index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file: imageUrl })
        })
        .then(response => response.json())
        .then(data => {
            loadingText.style.display = 'none';
            if (data.code === 200) {
                document.getElementById('result-text').textContent = data.msg;
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('检查图像失败，请重试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingText.style.display = 'none';
            alert('请求失败，请重试。');
        });

    } else {
        alert('请上传图像文件或输入图像URL');
        loadingText.style.display = 'none';
    }
});
