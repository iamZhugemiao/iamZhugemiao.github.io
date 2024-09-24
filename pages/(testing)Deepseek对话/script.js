let conversationHistory = [
    { role: 'system', content: 'You are a helpful assistant.' }
];

document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input').value;

    if (!userInput.trim()) {
        alert('请输入内容');
        return;
    }

    // 显示用户输入到对话框
    addMessage('user', userInput);

    // 添加用户的消息到历史记录
    conversationHistory.push({ role: 'user', content: userInput });

    // 调用API发送用户输入
    fetch('https://api.pearktrue.cn/api/deepseek/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: conversationHistory
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.messages) {
            // 获取AI的回复
            const aiReply = data.messages[data.messages.length - 1].content;
            // 显示AI的回复
            addMessage('ai', aiReply);
            // 将AI的回复加入到历史记录中
            conversationHistory.push({ role: 'assistant', content: aiReply });
        } else {
            alert('获取AI回复失败');
        }
    })
    .catch(error => console.error('Error:', error));

    // 清空输入框
    document.getElementById('user-input').value = '';
});

// 显示用户或AI信息
function addMessage(role, message) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    
    if (role === 'user') {
        messageDiv.className = 'user-message';
        messageDiv.textContent = `你：${message}`;
    } else if (role === 'ai') {
        messageDiv.className = 'ai-message';
        messageDiv.textContent = `AI：${message}`;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // 滚动到底部
}
