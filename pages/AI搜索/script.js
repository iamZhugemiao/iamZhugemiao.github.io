document.getElementById('search-button').addEventListener('click', function() {
    const keyword = document.getElementById('search-input').value;
    
    // 验证输入是否为空
    if (!keyword.trim()) {
        alert('请输入关键词');
        return;
    }

    // 发起API请求
    fetch(`https://api.pearktrue.cn/api/aisearch/?keyword=${encodeURIComponent(keyword)}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 调用显示结果函数
                displayResults(data.data);
            } else {
                alert('搜索失败，请重试。');
            }
        })
        .catch(error => console.error('Error:', error));
});

// 显示搜索结果函数
function displayResults(data) {
    const resultsDiv = document.getElementById('results');

    // 使用 marked.js 将 Markdown 转换为 HTML
    const markdownContent = marked.parse(data.text);

    // 渲染搜索结果
    resultsDiv.innerHTML = `
        <div>${markdownContent}</div>
        <h3>相关问题：</h3>
        <ul>${data.related_questions.map(q => `<li>${q}</li>`).join('')}</ul>
        <h3>来源：</h3>
        <ul>${data.sources.map(source => `<li><a href="${source.link}" target="_blank">${source.title}</a></li>`).join('')}</ul>
    `;
}
