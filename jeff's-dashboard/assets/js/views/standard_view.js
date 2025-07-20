// assets/js/views/standard_view.js

/**
 * 渲染標準分類頁面
 * @param {HTMLElement} container - 要渲染內容的容器元素
 * @param {object} config - 專案的設定檔內容
 * @param {Array<object>} records - 已篩選和排序好的資料
 * @param {string} categoryName - 當前分類的名稱
 */
export function render(container, config, records, categoryName) {
    document.title = `${categoryName} - ${config.name} - 控制面板`;

    let gridContent = '';
    if (records.length > 0) {
        records.forEach(item => {
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

/**
 * 建立單張資料卡片的 HTML 字串 (輔助函式)
 */
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