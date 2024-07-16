import json

class ClipApi:
    # ココフォリアClipboard APIのテンプレートをインスタンス化
    def __init__(self):
        self.data={"kind": "character","data": {
            "name": "no-name","memo": "","initiative": 0,
            "status": [],"params": [],"width":4,"height":4,
            "x": 0,"y": 0,"active": True,"secret": False,"invisible": False,"hideStatus": False,"color": "#ffffff",
            "commands": "",
            }
        }
    # キャラクター名
    def set_name(self, name: str):
        self.data['data']['name']=name

    # メモ（改行がそのまま反映されるので文字列でデータを用意する）
    def set_memo(self, memo: str):
        self.data['data']['memo']=memo

    # イニシアティブ（整数型でないとデータが反映されないので注意する）
    def set_initiative(self, inis: int):
        self.data['data']['Initiative']=inis

    # ステータス（次の形の配列を用意するキーは固定なのでほかのキーは使用しない
    #   {'label': 'ラベル名', 'value': '現在値', 'max': '最大値'})
    def set_status(self, status: []):
        self.data['data']['status']=status
        
    # パラメータ（次の形の配列を用意するキーは固定なのでほかのキーは使用しない
    #   {'label': 'ラベル名', 'value': '値'})
    def set_params(self, params: []):
        self.data['data']['params']=params
    
    # 位置座標
    def set_x(self, x: int):
        self.data['data']['x']=x
    def set_y(self, y: int):
        self.data['data']['y']=y
        
    # 位置座標
    def set_width(self, width: int):
        self.data['data']['width']=width
    def set_height(self, height: int):
        self.data['data']['height']=height
    
    # チャットパレット（改行込みの文字列でデータを用意する。１行ごとにコマンドとして認識されるので改行文字列でOK）
    def set_commands(self, commands: str):
        self.data['data']['commands']=commands
    
    # ステータスを非公開にする
    def set_secret(self, secret: bool):
        self.data['data']['secret']=secret
    
    # 発言時キャラクターを表示しない
    def set_invisible(self, invisible: bool):
        self.data['data']['invisible']=invisible
    
    # 盤面キャラクター一覧に表示しない
    def set_hide_status(self, hide_status: bool):
        self.data['data']['hideStatus']=hide_status
    
    # キャラクター表示文字色の設定
    def set_color(self, color: str):
        self.data['data']['color']=color
    
    # 入力されたデータをClipBoardAPIの対応書式で文字列出力
    def txt_out(self):
        return json.dumps(self.data, indent=4)