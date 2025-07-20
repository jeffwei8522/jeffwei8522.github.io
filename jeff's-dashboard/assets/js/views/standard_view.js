// 檔案路徑: assets/js/views/standard_view.js

// 【修正點】增加 params 參數，即使未使用
export function render(container, config, records, categoryInfo, params) {
    // 因為 categoryInfo 可能是物件或字串，從中取出名稱
    const categoryName = typeof categoryInfo === 'object' ? categoryInfo.name : categoryInfo;
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

    document.title = `${categoryName} - ${config.name} - 控制面板`;

    let gridContent = '';
    if (sortedRecords.length > 0) {
        sortedRecords.forEach(item => {
            gridContent += createDataCardHtml(item);
        });
    } else {
        gridContent = '<p class="no-data-message">此分類下無資料</p>';
    }

    container.innerHTML = `
        <header>
            <h1>${config.name}</h1>
            <p><a href="${config.project}.html">&larr; 返回 ${config.name} 分類列表</a></p>
        </header>
        <main>
            <section class="category-section">
                <h2 class="category-title">${categoryName}</h2>
                <div class="data-grid">${gridContent}</div>
            </section>
        </main>
        <footer>
            <p>&copy; 2025 您的個人控制面板</p>
        </footer>
    `;
}

// createDataCardHtml 函式維持不變，此處省略...
function createDataCardHtml(item) {
    const statusClass = item.status ? `status-${item.status.toLowerCase()}` : '';
    return `
        <div class="data-card" data-id="${item.id}">
            <div class="card-header">
                <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                <span class="status ${statusClass}">${item.status || ''}</span>
            </div>
            <div class="card-meta">
                <span class="date">日期: ${item.date}</span>
                <span class="author">建立者: ${item.author || ''}</span>
            </div>
            <p class="description">${item.description || ''}</p>
            <div class="tags-container">
                ${(item.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
}