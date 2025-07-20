from pathlib import Path
import json

# 設定專案根目錄名稱
project_root = Path.cwd()

# 定義要建立的資料夾與檔案
folders = [
    project_root / "data",
    project_root / "assets",
    project_root / "assets" / "css",
    project_root / "assets" / "js",
    project_root / "assets" / "img"
]

files = {
    project_root / "index.html": "",
    project_root / "haotenburg.html": "",
    project_root / "README.md": "# My Dashboard\n\nThis project is for managing categorized project links and documents.",
    project_root / "assets" / "css" / "style.css": "/* Add your custom CSS here */",
    project_root / "assets" / "js" / "dataLoader.js": "// JavaScript to load and render JSON data",
    project_root / "data" / "haotenburg.json": json.dumps([], indent=2, ensure_ascii=False)
}

# 建立資料夾
for folder in folders:
    folder.mkdir(parents=True, exist_ok=True)

# 建立檔案並填入內容
for file_path, content in files.items():
    file_path.write_text(content, encoding="utf-8")

project_root.name  # 回傳建立的根資料夾名稱以供確認
