// JavaScript to load and render JSON data
document.addEventListener('DOMContentLoaded', () => {
    // 獲取 HTML 頁面的容器元素
    const dataContainer = document.getElementById('data-container');
    if (!dataContainer) {
        console.error('Error: Data container #data-container not found.');
        return;
    }

    // 從當前頁面的 URL 猜測 JSON 檔案的名稱
    // 例如: "haotenburg.html" -> "haotenburg"
    const path = window.location.pathname;
    const pageName = path.split("/").pop().replace('.html', '');

    if (!pageName || pageName === 'index') {
        // 如果是首頁或無法解析，則不執行載入
        return;
    }

    const jsonPath = `data/${pageName}.json`;
    
    // 顯示載入中訊息
    dataContainer.innerHTML = '<p class="loading-message">資料載入中...</p>';

    // 使用 fetch API 取得 JSON 資料
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`無法載入資料: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // 清空載入中訊息
            dataContainer.innerHTML = '';
            
            // 篩選出 visible 為 true 的項目
            const visibleData = data.filter(item => item.visible);

            if (visibleData.length === 0) {
                dataContainer.innerHTML = '<p>目前沒有可顯示的資料。</p>';
                return;
            }

            // 遍歷每一筆資料並生成 HTML
            visibleData.forEach(item => {
                const card = document.createElement('div');
                card.className = 'data-card';
                card.setAttribute('data-id', item.id);

                // 根據狀態給予不同的 class
                const statusClass = item.status ? `status-${item.status.toLowerCase()}` : '';

                card.innerHTML = `
                    <div class="card-header">
                        <h3><a href="${item.url}" target="_blank">${item.title}</a></h3>
                        <span class="status ${statusClass}">${item.status}</span>
                    </div>
                    <div class="card-meta">
                        <span class="date">日期: ${item.date}</span>
                        <span class="author">建立者: ${item.author}</span>
                    </div>
                    <p class="description">${item.description}</p>
                    <div class="tags-container">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                `;
                dataContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('讀取 JSON 檔案時發生錯誤:', error);
            dataContainer.innerHTML = `<p class="error-message">資料載入失敗！請檢查
             <code>${jsonPath}</code> 檔案是否存在且格式正確。</p>`;
        });
});