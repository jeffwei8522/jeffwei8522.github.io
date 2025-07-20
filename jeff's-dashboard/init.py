from pathlib import Path
import json

# 根目錄為當前工作目錄
project_root = Path.cwd()

# 資料夾架構
folders = [
    project_root / "data",
    project_root / "config",
    project_root / "assets" / "css",
    project_root / "assets" / "js",
    project_root / "assets" / "img"
]

# 預設資料檔案內容
records = [
    {
        "id": "r-20240720-001",
        "project": "haotenburg",
        "category": "退稅",
        "title": "2024年7月貨物稅退稅申請表",
        "date": "2024-07-20",
        "description": "協助叔叔依財政部格式填寫申報，待送件。",
        "url": "https://example.com/doc1",
        "tags": ["除濕機", "表單"],
        "status": "已完成",
        "visible": True,
        "author": "Wei"
    },
    {
        "id": "r-20240715-002",
        "project": "haotenburg",
        "category": "財報",
        "title": "2024年Q2財報初稿",
        "date": "2024-07-15",
        "description": "第二季財報草稿，數據待財務確認。",
        "url": "https://example.com/doc2",
        "tags": ["Q2", "財報"],
        "status": "草稿",
        "visible": True,
        "author": "Wei"
    }
]

config_haotenburg = {
    "project": "haotenburg",
    "name": "好登堡",
    "description": "關於好登堡有限公司的營運、稅務與法務協助紀錄。",
    "categories": ["退稅", "法務", "財報", "網站登錄"]
}

# 預設檔案
files = {
    project_root / "index.html": "",
    project_root / "haotenburg.html": "",
    project_root / "README.md": "# 個人專案控制面板\n\n統一管理跨事業體專案的資訊與文件。",
    project_root / "data" / "records.json": json.dumps(records, indent=2, ensure_ascii=False),
    project_root / "config" / "haotenburg.json": json.dumps(config_haotenburg, indent=2, ensure_ascii=False),
    project_root / "assets" / "css" / "style.css": "/* Add your custom CSS here */",
    project_root / "assets" / "js" / "dataLoader.js": "// JS: Load and display project records by config"
}

# 建立資料夾
for folder in folders:
    folder.mkdir(parents=True, exist_ok=True)

# 建立檔案並寫入內容
for path, content in files.items():
    path.write_text(content, encoding="utf-8")

project_root.name  # 回傳建立的專案根目錄名稱以供確認
