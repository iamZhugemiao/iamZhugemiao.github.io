document.getElementById('random-button').addEventListener('click', function() {
    // 获取超能力API
    fetch('https://api.pearktrue.cn/api/superpower/')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 显示超能力和副作用
                document.getElementById('superpower').textContent = `超能力：${data.superpower}`;
                document.getElementById('sideeffect').textContent = `副作用：${data.sideeffect}`;
                
                // 显示图片
                const powerImage = document.getElementById('power-image');
                powerImage.src = data.image_url;
                powerImage.style.display = 'block';

                // 显示选择区域
                document.getElementById('result').style.display = 'block';

                // 隐藏用户选择结果
                document.getElementById('user-choice').style.display = 'none';
            } else {
                alert('获取超能力失败，请重试。');
            }
        })
        .catch(error => console.error('Error:', error));
});

// 监听 "按！" 按钮事件
document.getElementById('accept-button').addEventListener('click', function() {
    showChoiceResult('你按下了按钮！但你也没有超能力！哈哈！');
});

// 监听 "不按" 按钮事件
document.getElementById('decline-button').addEventListener('click', function() {
    showChoiceResult('你选择了不按按钮。超能力已失效。');
});

// 显示用户的选择结果
function showChoiceResult(message) {
    document.getElementById('choice-result').textContent = message;
    document.getElementById('user-choice').style.display = 'block';
    document.getElementById('result').style.display = 'none';
}
