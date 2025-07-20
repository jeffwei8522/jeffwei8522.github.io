const KNOWN_PROJECT_IDS = ['haotenburg', 'techstar'];
let allConfigs = {}; // 儲存所有專案設定

// DOM 元素快取
const projectSelect = document.getElementById('project-select');
const categorySelect = document.getElementById('category-select');
const reportMonthSection = document.getElementById('report-month-section');
const reportYearSelect = document.getElementById('report-year-select');
const reportMonthSelect = document.getElementById('report-month-select');
const titleInput = document.getElementById('title-input');
const form = document.getElementById('add-record-form');

/**
 * 頁面載入時的主函式
 */
async function initializePage() {
    await loadProjectConfigs();
    setupEventListeners();
    updateFormState(); // 初始更新一次表單狀態
}

/**
 * 載入所有專案的設定檔
 */
async function loadProjectConfigs() {
    try {
        const configPromises = KNOWN_PROJECT_IDS.map(id => fetch(`config/${id}.json`).then(res => res.json()));
        const configs = await Promise.all(configPromises);
        
        configs.forEach(config => {
            allConfigs[config.project] = config;
            const option = new Option(config.name, config.project);
            projectSelect.appendChild(option);
        });
    } catch (error) {
        console.error("載入專案設定檔失敗:", error);
        alert("載入專案設定檔失敗，請檢查網路或設定檔是否存在。");
    }
}

/**
 * 統一設定所有的事件監聽器
 */
function setupEventListeners() {
    projectSelect.addEventListener('change', handleProjectChange);
    categorySelect.addEventListener('change', handleCategoryChange);
    reportYearSelect.addEventListener('change', updateTitleForMonthlyReport);
    reportMonthSelect.addEventListener('change', updateTitleForMonthlyReport);
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * 處理專案選擇變動
 */
function handleProjectChange() {
    const selectedProjectId = projectSelect.value;
    
    // 清空並重置分類選單
    categorySelect.innerHTML = '<option value="">請選擇分類...</option>';
    
    if (selectedProjectId && allConfigs[selectedProjectId]) {
        const config = allConfigs[selectedProjectId];
        config.categories.forEach(categoryInfo => {
            const name = typeof categoryInfo === 'object' ? categoryInfo.name : categoryInfo;
            const option = new Option(name, name);
            categorySelect.appendChild(option);
        });
    }
    updateFormState(); // 每次變動都更新一次表單
}

/**
 * 處理分類選擇變動
 */
function handleCategoryChange() {
    updateFormState();
}

/**
 * 根據目前的選擇，更新整個表單的狀態 (顯示/隱藏/提示文字)
 */
function updateFormState() {
    const config = allConfigs[projectSelect.value];
    if (!config) {
        categorySelect.disabled = true;
        reportMonthSection.style.display = 'none';
        return;
    }
    
    categorySelect.disabled = false;
    const selectedCategoryName = categorySelect.value;
    const categoryInfo = config.categories.find(c => (typeof c === 'object' ? c.name : c) === selectedCategoryName);
    
    const isMonthlyReport = typeof categoryInfo === 'object' && categoryInfo.type === 'monthly_summary';

    // 根據是否為月報，決定顯示/隱藏與欄位狀態
    if (isMonthlyReport) {
        reportMonthSection.style.display = 'block';
        reportYearSelect.disabled = false;   // 【修正】啟用年份選擇
        reportMonthSelect.disabled = false;  // 【修正】啟用月份選擇
        titleInput.readOnly = true; // 鎖定標題，由程式自動產生
        // 確保 populateYearMonthSelectors 在啟用後才執行
        if (reportYearSelect.options.length === 0) { // 避免重複填充
             populateYearMonthSelectors(categoryInfo.startYear);
        }
        updateTitleForMonthlyReport();
    } else {
        reportMonthSection.style.display = 'none';
        reportYearSelect.disabled = true;   // 【修正】禁用年份選擇
        reportMonthSelect.disabled = true;  // 【修正】禁用月份選擇
        titleInput.readOnly = false; // 解鎖標題，讓使用者自由輸入
        // titleInput.value = ''; // 這行建議還是移除，以防清除使用者輸入
        titleInput.placeholder = '請輸入文件或事件的標題'; // 設定通用提示
    }
}

/**
 * 填充年月下拉選單
 */
function populateYearMonthSelectors(startYear) {
    // 填充年份 (從 startYear 到今年)
    reportYearSelect.innerHTML = '';
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= startYear; year--) {
        reportYearSelect.appendChild(new Option(year, year));
    }
    
    // 填充月份 (1-12)
    reportMonthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        reportMonthSelect.appendChild(new Option(`${month}月`, monthStr));
    }
}

/**
 * 為月報自動產生並更新標題
 */
function updateTitleForMonthlyReport() {
    const year = reportYearSelect.value;
    const month = reportMonthSelect.value;
    titleInput.value = `${year}年${month}月營運明細總表`;
}

/**
 * 處理表單提交
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    const newRecord = buildRecordObject();

    if (confirm("是否確認儲存這筆紀錄？")) {
        try {
            const response = await fetch('http://localhost:5000/save-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord),
            });
            const result = await response.json();
            if (response.ok) {
                alert(`成功！ ${result.message}`);
                form.reset();
                handleProjectChange(); // 重設表單後，手動觸發一次更新
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('儲存失敗:', error);
            alert(`儲存失敗: ${error.message}`);
        }
    }
}

/**
 * 從表單建立紀錄物件
 */
function buildRecordObject() {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7);
    const newId = `r-${dateStr}-${randomStr}`;
    
    const tags = document.getElementById('tags-input').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    const record = {
        id: newId,
        project: projectSelect.value,
        category: categorySelect.value,
        title: titleInput.value,
        date: new Date().toISOString().split('T')[0],
        description: document.getElementById('description-textarea').value,
        url: document.getElementById('url-input').value,
        tags: tags,
        status: document.getElementById('status-select').value,
        visible: true,
        author: document.getElementById('author-input').value
    };

    // 如果月報區塊是可見的，才加入 reportMonth 欄位
    if (reportMonthSection.style.display !== 'none') {
        record.reportMonth = `${reportYearSelect.value}-${reportMonthSelect.value}`;
    }
    
    return record;
}

// 執行初始化
document.addEventListener('DOMContentLoaded', initializePage);