document.getElementById('get-question-button').addEventListener('click', function() {
    // 调用API获取脑筋急转弯问题
    fetch('https://api.pearktrue.cn/api/brainteasers/')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 显示问题
                document.getElementById('question-text').textContent = data.data.question;
                
                // 存储答案以供查看
                document.getElementById('answer-text').textContent = data.data.answer;

                // 显示查看答案按钮，隐藏答案
                document.getElementById('show-answer-button').style.display = 'block';
                document.getElementById('answer-box').style.display = 'none';
            } else {
                alert('获取问题失败，请重试。');
            }
        })
        .catch(error => console.error('Error:', error));
});

// 点击查看答案按钮时，显示答案并隐藏按钮
document.getElementById('show-answer-button').addEventListener('click', function() {
    document.getElementById('answer-box').style.display = 'block';
    document.getElementById('show-answer-button').style.display = 'none';
});
