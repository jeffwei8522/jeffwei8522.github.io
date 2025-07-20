// assets/js/views/monthly_summary.js

/**
 * 渲染特殊的月曆總覽視圖
 * @param {HTMLElement} container - 要渲染內容的容器元素
 * @param {object} config - 專案的設定檔內容
 * @param {Array<object>} records - 屬於此分類的資料
 * @param {object} categoryInfo - 分類的詳細設定
 */
export function render(container, config, records, categoryInfo) {
    const categoryName = categoryInfo.name;
    document.title = `${categoryName} - ${config.name} - 控制面板`;
    
    let mainContent = `<main class="summary-grid"><h2 class="category-title">${categoryName}</h2>`;
    const startYear = categoryInfo.startYear || 2024;
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= startYear; year--) {
        mainContent += `<div class="year-group"><h3 class="year-title">${year}</h3><div class="months-container">`;
        
        for (let month = 12; month >= 1; month--) {
            const monthStr = month.toString().padStart(2, '0');
            const record = records.find(r => r.date.startsWith(`${year}-${monthStr}`));

            if (record) {
                mainContent += `
                    <div class="month-card updated">
                        <h4>${year} 年 ${month} 月</h4>
                        <p><a href="${record.url}" target="_blank" rel="noopener noreferrer">${record.title}</a></p>
                        <span class="status status-updated">✓ 已更新 (${record.date})</span>
                    </div>
                `;
            } else {
                mainContent += `
                    <div class="month-card pending">
                        <h4>${year} 年 ${month} 月</h4>
                        <p>尚無本月紀錄。</p>
                        <span class="status status-pending">尚未更新</span>
                    </div>
                `;
            }
        }
        mainContent += `</div></div>`;
    }
    mainContent += `</main>`;

    container.innerHTML = `
        <header>
            <h1>${config.name}</h1>
            <p><a href="${config.project}.html">&larr; 返回 ${config.name} 分類列表</a></p>
        </header>
        ${mainContent}
        <footer>
            <p>&copy; 2025 您的個人控制面板</p>
        </footer>
    `;
}