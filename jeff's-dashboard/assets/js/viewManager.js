// assets/js/viewManager.js

import { render as renderStandard } from './views/standard_view.js';
import { render as renderMonthlySummary } from './views/monthly_summary.js';

// 視圖渲染器的註冊表
const RENDERERS = {
    'monthly_summary': renderMonthlySummary,
    'default': renderStandard // 將標準視圖設為預設值
};

/**
 * 根據分類類型，呼叫對應的渲染器
 * @param {HTMLElement} container - 渲染的目標容器
 * @param {object} config - 專案設定檔
 * @param {Array<object>} allRecords - 所有的資料
 * @param {string} categoryName - 要渲染的分類名稱
 */
export function renderCategoryPage(container, config, allRecords, categoryName) {
    const categoryInfo = config.categories.find(c => (typeof c === 'object' ? c.name : c) === categoryName);

    if (!categoryInfo) {
        throw new Error(`在設定檔中找不到分類: ${categoryName}`);
    }

    // 決定要用哪個渲染器
    const viewType = (typeof categoryInfo === 'object' && categoryInfo.type) ? categoryInfo.type : 'default';
    const renderer = RENDERERS[viewType] || RENDERERS['default'];

    // 準備要傳遞給渲染器的資料
    const records = allRecords
        .filter(r => r.project === config.project && r.category === categoryName && r.visible)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
        
    // 執行渲染
    renderer(container, config, records, categoryInfo);
}