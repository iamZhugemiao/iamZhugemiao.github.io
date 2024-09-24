document.getElementById('generate-button').addEventListener('click', function() {
    const type = document.getElementById('poem-type').value;
    const model = document.getElementById('poem-model').value;
    const text = document.getElementById('text-input').value;

    if (!text.trim()) {
        alert('请输入内容');
        return;
    }

    // 调用API生成诗词
    fetch(`https://api.pearktrue.cn/api/poem_generate/?type=${type}&model=${model}&text=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 清空之前的结果
                const poemResult = document.getElementById('poem-result');
                poemResult.innerHTML = '';

                // 显示生成的诗句
                data.data.result.forEach(line => {
                    const li = document.createElement('li');
                    li.textContent = line;
                    poemResult.appendChild(li);
                });

                // 显示结果区域
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('生成诗词失败，请重试。');
            }
        })
        .catch(error => console.error('Error:', error));
});
