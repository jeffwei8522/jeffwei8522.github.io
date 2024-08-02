import os
import sys
import re
import json

# prepare 2022_election_report.html base
base = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>選舉報告</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {{
            font-family: Arial, sans-serif;
        }}
        header, nav, main, footer {{
            margin: 0 auto;
            max-width: 1000px auto;
            text-align: center;
        }}
        nav ul {{
            display: flex;
            justify-content: center;
            list-style: none;
            padding: 0;
        }}
        section {{
            margin: 0 auto;
            max-width: 1200px auto;
            /* padding-bottom: 100px; 增加底部填充，避免內容重疊 */
        }}
        iframe, img {{
            display: block;
            margin: 0 auto;
            width: 80%; /* 調整地圖寬度 */
            height: 800px; /* 調整地圖高度 */
        }}
    </style>
</head>
<body>
    <header>
        <h1>選舉報告</h1>
    </header>

    <nav>
        <ul>
            <li><a href="../index.html">回首頁</a></li>
        </ul>
    </nav>

    <main>
        <section>
            <h2>標題一</h2>
            <p>這是第一段文字。</p>
        </section>

        <section>
            <h2>標題二</h2>
            <p>這是第二段文字。</p>
        </section>

        <section>
            <h2>圖片集</h2>
            <img src="statistics_plot.png" alt="各里投票分布與各統計量">
            <!-- 加入更多圖片 -->
        </section>

        {content_position}


    </main>

    <footer>
        <p>頁尾內容</p>
    </footer>
</body>
</html>

"""

# 寫入基本模板
with open(r"2022_election\2022_election_report.html".replace("\\", "/"), "w", encoding="utf-8-sig") as f:
    f.write("")


html_list = os.listdir(r"C:\Users\Jeff\github\jeffwei8522.github.io\2022_election\2022_candidates_power\0806_revised".replace("\\", "/"))
# 將 "各里票倉.html" 移動到列表開頭
element_to_move = "各里票倉.html"
if element_to_move in html_list:
    html_list.remove(element_to_move)
    html_list.insert(0, element_to_move)

# 建立候選人紀錄簿

# 定義候選人紀錄簿的路徑
record_path = "2022_election/候選人紀錄簿.json"

# 初始化候選人紀錄簿函數
def 初始化候選人紀錄簿():
    候選人紀錄簿 = {"名單": {}, "紀錄簿狀態": 0}
    # 從 HTML 文件列表中提取名字
    for item in html_list:
        name_regex = r"^\d{2}(.{3})"  # 只選取名字部分
        name = "各里票倉" if item == "各里票倉.html" else re.findall(name_regex, item)[0]
        if name not in 候選人紀錄簿["名單"].keys():
            候選人紀錄簿["名單"][name] = ""
    return 候選人紀錄簿

if (not os.path.exists(record_path)):
    候選人紀錄簿 = 初始化候選人紀錄簿()

    # 將字典寫入JSON文件
    with open(record_path, 'w', encoding='utf-8-sig') as json_file:
        json.dump(候選人紀錄簿, json_file, ensure_ascii=False, indent=4)

else: 
    # 從JSON文件讀取數據
    with open(record_path, 'r', encoding='utf-8-sig') as json_file:
        候選人紀錄簿 = json.load(json_file)
        if 候選人紀錄簿["紀錄簿狀態"] == 1:
            候選人紀錄簿 = 初始化候選人紀錄簿()

            # 將字典寫入JSON文件
            with open(record_path, 'w', encoding='utf-8-sig') as json_file:
                json.dump(候選人紀錄簿, json_file, ensure_ascii=False, indent=4)

print(html_list)

# 從JSON文件讀取數據，將文檔傳遞到各個候選人的說明文字區塊。
with open(record_path, 'r', encoding='utf-8-sig') as json_file:
    候選人紀錄簿 = json.load(json_file)

text=""
for file in html_list:
    name_regex = r"^\d{2}(.{3})" # 只選取名字部分
    name = re.findall(name_regex, file)[0] if len(re.findall(name_regex, file)) != 0 else "fuck"
    if re.search(name, file):
        content = f"""
        <section>
            <h2>{name}</h2>
            <p>{候選人紀錄簿["名單"].get(name, "")}</p>
            <iframe src="2022_candidates_power/0806_revised/{file}" width="600" height="400"></iframe>
        </section>
        """
    elif file == "各里票倉.html":
        name = "各里票倉"
        content = f"""
        <section>
            <h2>第四選區所有票倉</h2>
            <p>{候選人紀錄簿["名單"].get(name, "")}</p>
            <iframe src="2022_candidates_power/0806_revised/{file}" width="500" height="400"></iframe>
        </section>
        """
    text += content

# 寫入
with open(r"2022_election\2022_election_report.html".replace("\\", "/"), "w", encoding="utf-8-sig") as f:
    updated_base = base.format(content_position=text)
    f.write(updated_base)
    print("done")


