# server.py - 【最終修正版】修正了標準分類無法儲存的 Bug

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RECORDS_PATH = os.path.join(BASE_DIR, 'data', 'records.json')
CONFIG_DIR = os.path.join(BASE_DIR, 'config')

@app.route('/save-record', methods=['POST'])
def save_record():
    try:
        new_record = request.get_json()
        project_id = new_record.get('project')
        category_name = new_record.get('category')

        if not project_id or not category_name:
            return jsonify({'message': '請求中缺少 project 或 category 欄位'}), 400

        config_path = os.path.join(CONFIG_DIR, f"{project_id}.json")
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        category_info = next((c for c in config['categories'] if (isinstance(c, dict) and c.get('name') == category_name) or (isinstance(c, str) and c == category_name)), None)
        
        # --- 【核心修正點】---
        # 使用更健壯、更清晰的邏輯來判斷分類類型
        category_type = 'default' # 先預設為標準類型
        if isinstance(category_info, dict):
            # 如果分類是個物件，嘗試讀取它的 type 屬性
            # .get('type', 'default') 表示如果沒有 type 屬性，也視為 default
            category_type = category_info.get('type', 'default')
        # 經過這段處理，category_type 一定會是 'monthly_summary' 或 'default'
        
        with open(RECORDS_PATH, 'r+', encoding='utf-8') as f:
            records = json.load(f)

            if category_type == 'monthly_summary':
                # --- 月報表的特殊更新邏輯 ---
                target_report_month = new_record.get('reportMonth')
                
                existing_record_index = -1
                for i, r in enumerate(records):
                    if r.get('project') == project_id and r.get('reportMonth') == target_report_month:
                        existing_record_index = i
                        break
                
                if existing_record_index != -1:
                    print(f"找到現有月報紀錄，執行更新: {project_id}/{target_report_month}")
                    original_id = records[existing_record_index]['id']
                    records[existing_record_index] = new_record
                    records[existing_record_index]['id'] = original_id 
                else:
                    print(f"未找到現有月報紀錄，執行新增: {project_id}/{target_report_month}")
                    records.append(new_record)
            else:
                # --- 所有標準分類的預設邏輯 (現在可以正常運作了) ---
                print(f"新增一筆標準紀錄，ID: {new_record['id']}")
                records.append(new_record)
            
            f.seek(0)
            json.dump(records, f, ensure_ascii=False, indent=2)
            f.truncate()

        return jsonify({'message': '紀錄已成功更新/儲存！'}), 200

    except Exception as e:
        print(f"處理請求時發生錯誤: {e}")
        return jsonify({'message': f'伺服器內部錯誤: {e}'}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=False)