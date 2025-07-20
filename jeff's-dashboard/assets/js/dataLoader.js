// 檔案路徑: assets/js/dataLoader.js
// (只需修改 initCategoryPage 函式中的一行)

import { renderCategoryPage } from './viewManager.js';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('project-container')) {
        initProjectPage();
    } else if (document.getElementById('category-container')) {
        initCategoryPage();
    }
});

// initProjectPage 函式維持不變，此處省略...
async function initProjectPage() {
    const container = document.getElementById('project-container');
    container.innerHTML = '<p class="loading-message">專案資料載入中...</p>';
    const projectId = window.location.pathname.split("/").pop().replace('.html', '');
    if (!projectId || projectId === 'index') return;

    try {
        const response = await fetch(`config/${projectId}.json`);
        if (!response.ok) throw new Error(`無法載入設定檔 config/${projectId}.json`);
        const config = await response.json();

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

        config.categories.forEach(categoryInfo => {
            const isObject = typeof categoryInfo === 'object';
            const name = isObject ? categoryInfo.name : categoryInfo;
            const encodedName = encodeURIComponent(name);
            content += `
                <a href="category.html?project=${config.project}&category=${encodedName}" class="category-card">
                    <h3>${name}</h3>
                    <p>點此查看所有「${name}」相關資料</p>
                </a>
            `;
        });

        content += `</div></main><footer><p>&copy; 2025 您的個人控制面板</p></footer>`;
        container.innerHTML = content;
    } catch (error) {
        console.error('渲染專案頁面時發生錯誤:', error);
        container.innerHTML = `<p class="error-message">錯誤: ${error.message}。</p>`;
    }
}


async function initCategoryPage() {
    const container = document.getElementById('category-container');
    container.innerHTML = '<p class="loading-message">分類資料載入中...</p>';
    
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    const categoryName = params.get('category');

    if (!projectId || !categoryName) {
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

        // 【修正點】將整個 params 物件傳遞過去
        renderCategoryPage(container, config, allRecords, categoryName, params);

    } catch (error) {
        console.error('渲染分類頁面時發生錯誤:', error);
        container.innerHTML = `<p class="error-message">錯誤: ${error.message}。</p>`;
    }
}