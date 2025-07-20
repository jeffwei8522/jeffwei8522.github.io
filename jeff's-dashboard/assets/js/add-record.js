const KNOWN_PROJECT_IDS = ['haotenburg', 'techstar'];
let allConfigs = {};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const configPromises = KNOWN_PROJECT_IDS.map(id => fetch(`config/${id}.json`).then(res => res.json()));
        const configs = await Promise.all(configPromises);
        
        const projectSelect = document.getElementById('project-select');
        configs.forEach(config => {
            allConfigs[config.project] = config;
            const option = document.createElement('option');
            option.value = config.project;
            option.textContent = config.name;
            projectSelect.appendChild(option);
        });
    } catch (error) {
        console.error("載入專案設定檔失敗:", error);
        alert("載入專案設定檔失敗，請檢查網路或設定檔是否存在。");
    }

    document.getElementById('project-select').addEventListener('change', (event) => {
        const selectedProjectId = event.target.value;
        const categorySelect = document.getElementById('category-select');
        
        categorySelect.innerHTML = '<option value="">請選擇分類...</option>';
        categorySelect.disabled = true;

        if (selectedProjectId && allConfigs[selectedProjectId]) {
            const config = allConfigs[selectedProjectId];
            config.categories.forEach(categoryInfo => {
                const name = typeof categoryInfo === 'object' ? categoryInfo.name : categoryInfo;
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                categorySelect.appendChild(option);
            });
            categorySelect.disabled = false;
        }
    });

    document.getElementById('add-record-form').addEventListener('submit', async (event) => {
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
                    document.getElementById('add-record-form').reset();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('儲存失敗:', error);
                alert(`儲存失敗: ${error.message}`);
            }
        }
    });
});

function buildRecordObject() {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7);
    const newId = `r-${dateStr}-${randomStr}`;
    
    const tags = document.getElementById('tags-input').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

    const record = {
        id: newId,
        project: document.getElementById('project-select').value,
        category: document.getElementById('category-select').value,
        title: document.getElementById('title-input').value,
        date: new Date().toISOString().split('T')[0],
        description: document.getElementById('description-textarea').value,
        url: document.getElementById('url-input').value,
        tags: tags,
        status: document.getElementById('status-select').value,
        visible: true,
        author: document.getElementById('author-input').value
    };

    const reportMonth = document.getElementById('report-month-input').value;
    if (reportMonth) {
        if (/^\d{4}-\d{2}$/.test(reportMonth)) {
            record.reportMonth = reportMonth;
        } else {
            alert("警告：報表月份格式不正確 (應為 YYYY-MM)，將不會儲存此欄位。");
        }
    }
    
    return record;
}