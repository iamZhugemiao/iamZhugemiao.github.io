document.getElementById('submit-button').addEventListener('click', function() {
    const userInput = document.getElementById('text-input').value;

    if (!userInput.trim()) {
        alert('请输入需要纠错的文章');
        return;
    }

    // 调用API进行纠错
    fetch(`https://api.pearktrue.cn/api/textcorrector/?text=${encodeURIComponent(userInput)}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 显示纠错结果
                document.getElementById('input-text').textContent = data.data.input_text;
                document.getElementById('corrected-text').textContent = data.data.corrected_text;

                // 显示具体纠错项
                const correctionList = document.getElementById('correction-list');
                correctionList.innerHTML = ''; // 清空之前的内容
                data.data.items.forEach(item => {
                    const [original, corrected, startIndex, endIndex] = item.match(/\('(.+?)',\s?'(.+?)',\s?(\d+),\s?(\d+)\)/).slice(1);
                    const listItem = document.createElement('li');
                    listItem.textContent = `将 '${original}' 纠正为 '${corrected}' (位置：${startIndex}-${endIndex})`;
                    correctionList.appendChild(listItem);
                });

                // 显示结果区域
                document.getElementById('result-box').style.display = 'block';
            } else {
                alert('纠错失败，请重试。');
            }
        })
        .catch(error => console.error('Error:', error));
});
