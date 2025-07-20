import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RECORDS_PATH = os.path.join(BASE_DIR, 'data', 'records.json')

print(f"記錄檔案路徑: {RECORDS_PATH}")

@app.route('/save-record', methods=['POST'])
def save_record():
    try:
        new_record = request.get_json()
        print(f"收到新的紀錄: {new_record}")

        with open(RECORDS_PATH, 'r+', encoding='utf-8') as f:
            records = json.load(f)

            try:
                existing_record_index = next(i for i, r in enumerate(records) if r['id'] == new_record['id'])
                records[existing_record_index] = new_record
                print(f"紀錄 ID {new_record['id']} 已存在，執行更新。")
            except StopIteration:
                records.append(new_record)
                print(f"新增紀錄 ID {new_record['id']}。")
            
            f.seek(0)
            json.dump(records, f, ensure_ascii=False, indent=2)
            f.truncate()

        print('紀錄已成功儲存！')
        return jsonify({'message': '紀錄已成功儲存！'}), 200

    except Exception as e:
        print(f"處理請求時發生錯誤: {e}")
        return jsonify({'message': f'伺服器內部錯誤: {e}'}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)