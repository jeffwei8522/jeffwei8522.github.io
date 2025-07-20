// 檔案路徑: assets/js/viewManager.js

import { render as renderStandard } from './views/standard_view.js';
import { render as renderMonthlySummary } from './views/monthly_summary.js';

const RENDERERS = {
    'monthly_summary': renderMonthlySummary,
    'default': renderStandard
};

// 【修正點】增加 params 參數
export function renderCategoryPage(container, config, allRecords, categoryName, params) {
    const categoryInfo = config.categories.find(c => (typeof c === 'object' ? c.name : c) === categoryName);

    if (!categoryInfo) {
        throw new Error(`在設定檔中找不到分類: ${categoryName}`);
    }

    const viewType = (typeof categoryInfo === 'object' && categoryInfo.type) ? categoryInfo.type : 'default';
    const renderer = RENDERERS[viewType] || RENDERERS['default'];

    const records = allRecords
        .filter(r => r.project === config.project && r.category === categoryName && r.visible);
        
    // 【修正點】將 params 傳遞給最終的 renderer
    // 注意：標準視圖雖然用不到 params，但為了介面統一，我們還是傳入
    renderer(container, config, records, categoryInfo, params);
}