import os
import json
import pyperclip
from module.sw25 import Party, format_text, format_memo
from flask import Flask, render_template, request, jsonify

# 現在のスクリプトファイルのディレクトリパスを取得
current_dir = os.path.dirname(os.path.abspath(__file__))

# 相対パスを設定
path_dict = "resource/dictionary.json"
path_setting = "resource/setting.json"
path_html = "index.html"

app = Flask(__name__)

# データ読み込み
def load_data(input):
    if not os.path.exists(input):
        return {}
    with open(input, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

# 
@app.route('/', methods=['GET', 'POST'])
def index():
    # ロード
    data = load_data(path_dict)
    # テンプレートindex.htmlをレンダリング、変数dataを渡す
    return render_template(path_html, data = data)

# 
@app.route('/search', methods=['GET'])
def search():
    # ロード
    data = load_data(path_dict)
    # 空のリスト作成
    filtered_data = []
    
    # 値を取得
    search_name = request.args.get('Name')
    search_category = request.args.get('Category')
    search_level = request.args.get('Level')
    search_partnum = request.args.get('PartNum')
    
    # categoryが空/一致する & levelが空/一致する & nameが空/含まれる & partnumが空/一致する
    for entry in data:
        if (not search_category or entry['Category'] == search_category) and \
            (not search_level or entry['Level'] == int(search_level)) and \
            (not search_name or search_name.lower() in entry['Name'].lower()) and \
            (not search_partnum or entry['PartNum'] == int(search_partnum)):
                filtered_data.append(entry)
    
    setting = load_data(path_setting)
    
    # フィルタリングしたデータをJSON形式で返す
    return jsonify(filtered_data = filtered_data, memo = format_memo(filtered_data, setting)) 

# 
@app.route('/copy', methods=['GET'])
def copy():
    # 
    party = Party()
    
    # 値を取得
    data = json.loads(request.args.get('Item'))
    
    party.set_party(int(request.args.get('PartyNum')))
    party.set_size(int(request.args.get('CharaSize')))
    party.set_color(request.args.get('ChatColor'))
    party.set_sword(request.args.get('SwordFragment') == 'true')
    party.set_type(int(request.args.get('copy_type')))
    
    setting = load_data(path_setting)
    
    # 
    pyperclip.copy(format_text(data, json.loads(party.txt_out()), setting))
    
    return jsonify({"message": "コピー成功"})

# 
@app.route('/delete', methods=['GET'])
def delete():
    # ロード
    data = load_data(path_dict)
    # 空のリスト作成
    filtered_data = []
    # 値を取得
    item_dict = json.loads(request.args.get('Item'))
    
    # nameが一致しない & categoryが一致しない & skillが一致しない
    for entry in data:
        if (entry['Name'] != item_dict['Name']) or \
            (entry['Category'] != item_dict['Category']) or \
            (entry['Skill'] != item_dict['Skill']):
                filtered_data.append(entry)
    
    # 書き込み
    with open(path_dict, 'w', encoding='utf-8') as file:
        json.dump(filtered_data, file, ensure_ascii=False, indent=4)
    
    return jsonify({"success": True})

# 
@app.route('/register', methods=['POST'])
def register():
    # ロード
    data = load_data(path_dict)
    
    # 新しいデータを追加
    data.append(request.json)
    
    # 書き込み
    with open(path_dict, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    
    return jsonify({"success": True})


@app.route('/setting', methods=['GET', 'POST'])
def get_settings():
    if request.method == 'GET':
        return jsonify(load_data(path_setting))
    
    elif request.method == 'POST':
        current_setting = load_data(path_setting)
        current_setting.update(request.json)

        with open(path_setting, 'w', encoding='utf-8') as f:
            json.dump(current_setting, f, ensure_ascii=False, indent=4)
        
        return jsonify(current_setting)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)