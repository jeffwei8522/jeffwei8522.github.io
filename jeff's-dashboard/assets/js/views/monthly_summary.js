// 檔案路徑: assets/js/views/monthly_summary.js

/**
 * 總渲染器，根據 URL 參數決定要渲染哪一層
 */
export function render(container, config, records, categoryInfo, params) {
    const yearParam = params.get('year');

    if (yearParam) {
        // 如果 URL 有 year 參數，渲染該年份的月份詳情頁
        renderMonthlyView(container, config, records, categoryInfo, yearParam);
    } else {
        // 如果 URL 沒有 year 參數，渲染年份選擇頁
        renderYearSelection(container, config, records, categoryInfo);
    }
}

/**
 * 渲染「年份選擇頁」
 */
function renderYearSelection(container, config, records, categoryInfo) {
    const categoryName = categoryInfo.name;
    document.title = `選擇年份 - ${categoryName} - 控制面板`;

    // 【修正】改用 reportMonth 來提取年份，更準確
    const years = [...new Set(records.map(r => r.reportMonth.substring(0, 4)))].sort((a, b) => b.localeCompare(a));

    let gridContent = '';
    if (years.length > 0) {
        years.forEach(year => {
            // 計算該年度有多少筆紀錄
            const recordCount = records.filter(r => r.reportMonth && r.reportMonth.startsWith(year)).length;
            gridContent += `
                <a href="?project=${config.project}&category=${encodeURIComponent(categoryName)}&year=${year}" class="year-card">
                    <h3>${year}</h3>
                    <p>共 ${recordCount} 筆紀錄</p>
                </a>
            `;
        });
    } else {
        gridContent = '<p class="no-data-message">此分類尚無任何年份的資料</p>';
    }

    container.innerHTML = `
        <header>
            <h1>${config.name}</h1>
            <p><a href="${config.project}.html">&larr; 返回 ${config.name} 分類列表</a></p>
        </header>
        <main>
            <section class="category-section">
                <h2 class="category-title">${categoryName}</h2>
                <div class="year-selection-grid">${gridContent}</div>
            </section>
        </main>
        <footer>
            <p>&copy; 2025 您的個人控制面板</p>
        </footer>
    `;
}

/**
 * 渲染「月份詳情頁」
 * (此函式已更新，讓整張卡片可點擊)
 */
function renderMonthlyView(container, config, records, categoryInfo, year) {
    const categoryName = categoryInfo.name;
    document.title = `${year}年 - ${categoryName} - 控制面板`;

    const backLink = `?project=${config.project}&category=${encodeURIComponent(categoryName)}`;

    let monthsHtml = '';
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const reportMonthId = `${year}-${monthStr}`;
        
        const record = records.find(r => r.reportMonth === reportMonthId);

        if (record) {
            // 【核心修正】將 <a> 標籤移到最外層，包住整張卡片
            monthsHtml += `
                <a href="${record.url}" target="_blank" rel="noopener noreferrer" class="month-card-link">
                    <div class="month-card updated">
                        <h4>${year} 年 ${month} 月</h4>
                        <p>${record.title}</p>
                        <span class="status status-updated">✓ 已更新 (${record.date})</span>
                    </div>
                </a>
            `;
        } else {
            // 尚未更新的卡片，維持原樣，不可點擊
            monthsHtml += `
                <div class="month-card pending">
                    <h4>${year} 年 ${month} 月</h4>
                    <p>尚無本月紀錄。</p>
                    <span class="status status-pending">尚未更新</span>
                </div>
            `;
        }
    }

    container.innerHTML = `
        <header>
            <h1>${config.name}</h1>
            <p><a href="${config.project}.html">&larr; 返回 ${config.name} 分類列表</a></p>
        </header>
        <main>
            <section class="category-section">
                <h2 class="category-title">
                    <a href="${backLink}" style="color:var(--primary-color); text-decoration:none;">${categoryName}</a> / ${year}
                </h2>
                <div class="months-container">${monthsHtml}</div>
            </section>
        </main>
        <footer>
            <p>&copy; 2025 您的個人控制面板</p>
        </footer>
    `;
}
