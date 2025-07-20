document.addEventListener('DOMContentLoaded', () => {
    // 判斷目前在哪種類型的頁面
    if (document.getElementById('project-container')) {
        initProjectPage(); // 初始化專案頁面 (e.g., haotenburg.html)
    } else if (document.getElementById('category-container')) {
        initCategoryPage(); // 初始化分類內容頁 (category.html)
    }
});

/**
 * 初始化專案頁面，渲染「分類卡片」
 */
async function initProjectPage() {
    const container = document.getElementById('project-container');
    container.innerHTML = '<p class="loading-message">專案資料載入中...</p>';

    const projectId = window.location.pathname.split("/").pop().replace('.html', '');
    if (!projectId || projectId === 'index') return;

    try {
        const response = await fetch(`config/${projectId}.json`);
        if (!response.ok) throw new Error(`無法載入設定檔 config/${projectId}.json`);
        const config = await response.json();

        // 動態設定網頁標題
        document.title = `${config.name} 分類總覽 - 控制面板`;
        
        let content = `
            <header>
                <h1>${config.name}</h1>
                <p>${config.description}</p>
                <p><a href="index.html">&larr; 返回首頁</a></p>
            </header>
            <main>
                <div class="category-grid">
        `;

        // 遍歷 config 中的 categories 來生成卡片
        config.categories.forEach(category => {
            // 將分類名稱編碼，以安全地放在 URL 中
            const encodedCategory = encodeURIComponent(category);
            content += `
                <a href="category.html?project=${config.project}&category=${encodedCategory}" class="category-card">
                    <h3>${category}</h3>
                    <p>點此查看所有「${category}」相關資料</p>
                </a>
            `;
        });

        content += `
                </div>
            </main>
            <footer>
                <p>&copy; 2025 您的個人控制面板</p>
            </footer>
        `;
        
        container.innerHTML = content;

    } catch (error) {
        console.error('渲染專案頁面時發生錯誤:', error);
        container.innerHTML = `<p class="error-message">錯誤: ${error.message}。</p>`;
    }
}

/**
 * 初始化分類內容頁面，渲染「資料卡片」
 */
async function initCategoryPage() {
    const container = document.getElementById('category-container');
    container.innerHTML = '<p class="loading-message">分類資料載入中...</p>';

    // 從 URL 參數中獲取 project 和 category
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    const category = params.get('category');

    if (!projectId || !category) {
        container.innerHTML = `<p class="error-message">錯誤: 缺少 project 或 category 參數。</p>`;
        return;
    }

    try {
        const [configRes, recordsRes] = await Promise.all([
            fetch(`config/${projectId}.json`),
            fetch(`data/records.json`)
        ]);

        if (!configRes.ok) throw new Error(`無法載入設定檔 config/${projectId}.json`);
        if (!recordsRes.ok) throw new Error('無法載入資料檔 data/records.json');

        const [config, allRecords] = await Promise.all([configRes.json(), recordsRes.json()]);

        // 動態設定網頁標題
        document.title = `${category} - ${config.name} - 控制面板`;
        
        // 篩選出符合 project、category 且 visible 的資料，並排序
        const records = allRecords
            .filter(r => r.project === projectId && r.category === category && r.visible)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        let content = `
            <header>
                <h1>${config.name}</h1>
                <p><a href="${projectId}.html">&larr; 返回 ${config.name} 分類列表</a></p>
            </header>
            <main>
                <section class="category-section">
                    <h2 class="category-title">${category}</h2>
                    <div class="data-grid">
        `;

        if (records.length > 0) {
            records.forEach(item => {
                content += createDataCardHtml(item); // 使用一個輔助函式來生成卡片HTML
            });
        } else {
            content += '<p class="no-data-message">此分類下無資料</p>';
        }

        content += `
                    </div>
                </section>
            </main>
            <footer>
                <p>&copy; 2025 您的個人控制面板</p>
            </footer>
        `;

        container.innerHTML = content;

    } catch (error) {
        console.error('渲染分類頁面時發生錯誤:', error);
        container.innerHTML = `<p class="error-message">錯誤: ${error.message}。</p>`;
    }
}

/**
 * 建立單張資料卡片的 HTML 字串 (輔助函式)
 * @param {object} item - 單筆資料記錄
 * @returns {string} - 代表資料卡片的 HTML 字串
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