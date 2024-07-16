# クリップボードにコピーする文章を整形する関数
import json
from module.ccfolia import ClipApi

class Party:
    def __init__(self):
        self.data = {
            "party": 1,
            "size": 4,
            "color": "#ffffff",
            "sword": False,
            "type": 1
        }
    
    def set_party(self, party: int):
        self.data['party'] = party
    
    def set_size(self, size: int):
        self.data['size'] = size
    
    def set_color(self, color: str):
        self.data['color'] = color
    
    def set_sword(self, sword: bool):
        self.data['sword'] = sword
    
    def set_type(self, type: int):
        self.data['type'] = type
    
    def txt_out(self):
        return json.dumps(self.data, indent=4)



def format_memo(data_list, setting):
    # 
    memo_list = []
    
    for data in data_list:
        # 
        memo_def=""
        memo_partNum=""
        memo_coreName=""
        memo_partInfo=""
        # 
        memo_def += f"{data['Name']}"
        memo_def += f"\n種族：{data['Category']}　魔物Lv：{data['Level']} 参照：{data['Reference']}\n"
        memo_def += f"知名度/弱点値：{data['Reputation1']}/{data['Reputation2']}　弱点：{data['Weakness']}\n"
        memo_def += f"先制値：{data['Initiative']}　生命抵抗/精神抵抗：{data['VitResist']}/{data['MndResist']}\n"
        
        # 同名の部位数計算
        # d：行列位置 dup：部位数行列（最大12部位）
        d = 0
        dup = [0,0,0,0,0,0,0,0,0,0,0,0]
        for i in range(data['PartNum']):
            # 1部位目は必ず1
            if i == 0: dup[d] += 1
            # 2部位目以降は直前の部位と名称を比較
            elif data[f'Part{i+1}Style'] == data[f'Part{i}Style']: dup[d] += 1
            elif data[f'Part{i+1}Style'] != data[f'Part{i}Style']: d += 1; dup[d] += 1
        
        # 部位数とコア部位（2部位以上の場合のみ）
        # 「部位数：〇（△△/△△/△△） コア部位：△△」
        if data['PartNum'] != 1 and '（' in data[f'Part{i+1}Style'] and '）' in data[f'Part{i+1}Style']:
            for i in range(data['PartNum']):
                # △△について（）の中身を取り出す
                start_index = data[f'Part{i+1}Style'].index("（")
                end_index = data[f'Part{i+1}Style'].index("）", start_index)
                partStyleB = data[f'Part{i+1}Style'][start_index + 1: end_index]
                if dup[i] > 0:
                    memo_partNum += f"{partStyleB}"
                # 複数個あるなら△△×2のように記述
                if dup[i] > 1:
                    memo_partNum += f" × {dup[i]}"
                if dup[i] != 0 and i + dup[i] != data['PartNum']:
                    memo_partNum += "／"
                # コア部位ならば記述
                if data[f'Part{i+1}Core']:
                    memo_coreName += partStyleB
                    if i + 1 != data['PartNum']: memo_coreName += "、"
                else: memo_coreName="なし"
            
            memo_def += f"部位数：{data['PartNum']}（{memo_partNum}）\nコア部位：{memo_coreName}\n"
        
        # 部位ごとのメモ
        for i in range(data['PartNum']):
            if dup[i] != 0:
                memo_partInfo+=f"●{data[f'Part{i+1}Style']}"
                if dup[i] > 1: memo_partInfo += f"×{dup[i]}"
                memo_partInfo+=f"\n命中：{data[f'Part{i+1}Accuracy']}　打撃：{data[f'Part{i+1}Damage']}　回避：{data[f'Part{i+1}Evasion']}\n"
                memo_partInfo+=f"防護：{data[f'Part{i+1}Defense']}　ＨＰ：{data[f'Part{i+1}Hp']}　ＭＰ：{data[f'Part{i+1}Mp']}\n\n"
        
        # 種族の共通能力
        if 'Category' in data and data['Category'] in setting['category_skill']:
            memo_def += f"\n{memo_partInfo}特殊能力：\n{setting['category_skill'][data['Category']]}{data['Skill']}"
        else:
            memo_def += f"\n{memo_partInfo}特殊能力：\n{data['Skill']}"
        
        
        memo_list.append(memo_def)
    
    return memo_list




def format_text(data, party, setting):
    # 
    clip_api = ClipApi()
    
    ### ボタン番号
    btnNum = party["type"]
    
    # ボタン2/3が押されたとき（効果なし）
    if btnNum != 1:
        clip_api.set_x(99999)
        clip_api.set_y(99999)
        if data['PartNum'] <= 4*(btnNum-1):
            return 0
    
    ### キャラクターメモ
    memo_def=""
    memo_partNum=""
    memo_coreName=""
    memo_partInfo=""
    
    ## 名称
    if data['PartNum'] <= 4:
        clip_api.set_name(f"1_{data['Name']}")
        memo_def += f"1_{data['Name']}"
    else:
        clip_api.set_name(f"1-{btnNum}_{data['Name']}")
        memo_def += f"1-{btnNum}_{data['Name']}"
    
    ## パラメータ
    if party["sword"]:
        memo_def += f"（剣）\n種族：{data['Category']}　魔物Lv：{data['Level']} 参照：{data['Reference']}\n"
        memo_def += f"知名度/弱点値：{data['Reputation1']}/{data['Reputation2']}　弱点：{data['Weakness']}\n"
        memo_def += f"先制値：{data['Initiative']}　生命抵抗/精神抵抗：{data['VitResist']+int(data['Level']/5.1)+1}/{data['MndResist']+int(data['Level']/5.1)+1}\n"
    else:
        memo_def += f"\n種族：{data['Category']}　魔物Lv：{data['Level']} 参照：{data['Reference']}\n"
        memo_def += f"知名度/弱点値：{data['Reputation1']}/{data['Reputation2']}　弱点：{data['Weakness']}\n"
        memo_def += f"先制値：{data['Initiative']}　生命抵抗/精神抵抗：{data['VitResist']}/{data['MndResist']}\n"
    
    # 同名の部位数計算
    # d：行列位置 dup：部位数行列（最大12部位）
    d = 0
    dup = [0,0,0,0,0,0,0,0,0,0,0,0]
    for i in range(data['PartNum']):
        # 1部位目は必ず1
        if i == 0: dup[d] += 1
        # 2部位目以降は直前の部位と名称を比較
        elif data[f'Part{i+1}Style'] == data[f'Part{i}Style']: dup[d] += 1
        elif data[f'Part{i+1}Style'] != data[f'Part{i}Style']: d += 1; dup[d] += 1
    
    # 部位数とコア部位（2部位以上の場合のみ）
    # 「部位数：〇（△△/△△/△△） コア部位：△△」
    if data['PartNum'] != 1 and '（' in data[f'Part{i+1}Style'] and '）' in data[f'Part{i+1}Style']:
            for i in range(data['PartNum']):
                # △△について（）の中身を取り出す
                start_index = data[f'Part{i+1}Style'].index("（")
                end_index = data[f'Part{i+1}Style'].index("）", start_index)
                partStyleB = data[f'Part{i+1}Style'][start_index + 1: end_index]
                if dup[i] > 0:
                    memo_partNum += f"{partStyleB}"
                # 複数個あるなら△△×2のように記述
                if dup[i] > 1:
                    memo_partNum += f" × {dup[i]}"
                if dup[i] != 0 and i + dup[i] != data['PartNum']:
                    memo_partNum += "／"
                # コア部位ならば記述
                if data[f'Part{i+1}Core']:
                    memo_coreName += partStyleB
                    if i + 1 != data['PartNum']: memo_coreName += "、"
                else: memo_coreName="なし"
            
            memo_def += f"部位数：{data['PartNum']}（{memo_partNum}）\nコア部位：{memo_coreName}\n"
    
    # 部位ごとのメモ
    for i in range(data['PartNum']):
        if dup[i] != 0:
            memo_partInfo+=f"●{data[f'Part{i+1}Style']}"
            if dup[i] > 1: memo_partInfo += f"×{dup[i]}"
            memo_partInfo+=f"\n命中：{data[f'Part{i+1}Accuracy']}　打撃：{data[f'Part{i+1}Damage']}　回避：{data[f'Part{i+1}Evasion']}\n"
            memo_partInfo+=f"防護：{data[f'Part{i+1}Defense']}　ＨＰ：{data[f'Part{i+1}Hp']}　ＭＰ：{data[f'Part{i+1}Mp']}\n\n"
    
    # 種族の共通能力
    if 'Category' in data and data['Category'] in setting['category_skill']:
        memo_def += f"\n{memo_partInfo}特殊能力：\n{setting['category_skill'][data['Category']]}{data['Skill']}"
    else:
        memo_def += f"\n{memo_partInfo}特殊能力：\n{data['Skill']}"
    
    ### ステータス
    # ボタン1なら0~、ボタン2なら4~……
    status=[]
    if setting["swordFrag"] and party["sword"]:
        for i in range(4 * (btnNum - 1), min(4 * btnNum, data['PartNum'])):
            status += [{"label":f"HP{i + 1}", "value":f"{data[f'Part{i + 1}Hp']}", "max":f"{data[f'Part{i + 1}Hp']}"},
                        {"label":f"MP{i + 1}", "value":f"{data[f'Part{i + 1}Mp']}", "max":f"{data[f'Part{i + 1}Mp']}"},]
    else:
        for i in range(4 * (btnNum - 1), min(4 * btnNum, data['PartNum'])):
            status += [{"label":f"HP{i + 1}", "value":f"{data[f'Part{i + 1}Hp']}", "max":f"{data[f'Part{i + 1}Hp']}"},
                        {"label":f"MP{i + 1}", "value":f"{data[f'Part{i + 1}Mp']}", "max":f"{data[f'Part{i + 1}Mp']}"},]
    
    
    ### パラメータ
    # 剣のかけらの有無（HPMPは反映させない、生命精神のみ反映）
    params=[]
    if party["sword"]:
        params += [{"label":"生命抵抗", "value":f"{data['VitResist'] + int(data['Level'] / 5.1) + 1}"},
                {"label":"精神抵抗", "value":f"{data['MndResist'] + int(data['Level'] / 5.1) + 1}"},]
    else:
        params += [{"label":"生命抵抗", "value":f"{data['VitResist']}"},
                    {"label":"精神抵抗", "value":f"{data['MndResist']}"},]

    for i in range(4 * (btnNum - 1) , min(4 * btnNum,data['PartNum'])):  
        params += [{"label":f"命中力{i + 1}", "value":f"{data[f'Part{i + 1}Accuracy']}"},
                    {"label":f"打撃点{i + 1}", "value":f"{data[f'Part{i + 1}Damage']}"},
                    {"label":f"回避力{i + 1}", "value":f"{data[f'Part{i + 1}Evasion']}"},]
    
    # 魔力
    # 「△△魔法〇/◇」から△△魔法毎に◇（魔力）を抽出
    powerMagic = {}
    for skill in setting["skillMagic"]:
        if skill in data["Skill"]:
            if skill != "深智魔法":
                tmp_index = data["Skill"].index(skill)
                start_index = data["Skill"].index("/", tmp_index) + 1
                end_index = data["Skill"].index("\n", start_index)
                powerMagic[skill] = int(data["Skill"][start_index:end_index])
            elif "真語魔法" in data["Skill"] and "操霊魔法" in data["Skill"]:
                powerMagic["深智魔法"] = min(powerMagic["真語魔法"], powerMagic["操霊魔法"])
            else:
                powerMagic[skill] = 0
        else:
            powerMagic[skill] = 0
        
        params += [{"label":f"魔力（{skill}）","value":f"{powerMagic[f'{skill}']}"},]
    
    ### チャットパレット
    # PC一覧
    pcName=""
    for i in range(party["party"]):
        pcName += f"{{PC{i+1}}}"
        if i + 1 != party["party"]: pcName += ","
    
    # 特殊能力
    skillUpdate = ""
    for skillLine in data['Skill'].split("\n"):
        # 固有判定
        for skill in setting["skillKey"]:
            if skill in skillLine:
                start_index = skillLine.index("/")
                end_index = skillLine.index("/", start_index + 1)
                skillName = skillLine[1:start_index]
                Defense_value = skillLine[start_index:end_index]
                skillUpdate = data['Skill'].replace(skillLine, f"2d6+{Defense_value} {skillLine}\n2d6+ 【{skillName}】<LF>")
        if "魔法" in skillLine:
            skillUpdate = data['Skill'].replace(skillLine+"\n", "")
        if '練技' in skillLine:
            skillUpdate = data['Skill'].replace(skillLine, f":MP-3\n{skillLine}\n")
        
    command = f"choice({pcName}) 【対象選択】<LF>\n{skillUpdate}"
    
    # 近接攻撃
    command_PA = ""
    for i in range(4*(btnNum-1),min(4*btnNum,data['PartNum'])):
        command_PA+=f"x1 2d6+{{命中力{i+1}}} 【命中力判定/{data[f'Part{i+1}Style']}】<LF>\nx1 2d6+{{打撃点{i+1}}} ダメージ/{data[f'Part{i+1}Style']}<LF>\n"
    
    # 魔法攻撃
    command_MA = ""
    for skill in setting["skillMagic"]:
        if skill in data['Skill']:
            command_MA+=f"x1 2d6+{{魔力（{skill}）}} 【魔法行使判定〔〕】<LF>\nx1 k0+{{魔力（{skill}）}} ダメージ<LF>\nx1 Hk0+{{魔力（{skill}）}} ダメージ（半減）<LF>\n"
    if '真語魔法' in data['Skill'] and '操霊魔法' in data['Skill']:
            command_MA+=f"x1 2d6+{{魔力（深智魔法）}} 【魔法行使判定〔〕】<LF>\nx1 k0+{{魔力（深智魔法）}} ダメージ<LF>\nx1 Hk0+{{魔力（深智魔法）}} ダメージ（半減）<LF>\n"
    
    # 防御全般
    command_D = ""
    for i in range(4*(btnNum-1),min(4*btnNum,data['PartNum'])):        
        command_D+=f"x1 2d6+{{回避力{i+1}}}>= 【回避力判定/{data[f'Part{i+1}Style']}】<LF>\n"
    command_D+="x1 2d6+{生命抵抗}>= 【生命抵抗判定】<LF>\nx1 2d6+{精神抵抗}>= 【精神抵抗判定】<LF>\n"
    
    # HP/MP
    command_HP = ""
    command_MP = ""
    for i in range(4*(btnNum-1),min(4*btnNum,data['PartNum'])):
        command_HP+=f":HP{i+1}-\n"
        command_MP+=f":MP{i+1}-\n"
    
    command+=f"\n{command_PA}\n{command_MP}\n{command_MA}\n{command_HP}\n{command_D}"
    
    clip_api.set_memo(memo_def)
    clip_api.set_params(params)
    clip_api.set_status(status)
    clip_api.set_width(party["size"])
    clip_api.set_height(party["size"])
    clip_api.set_initiative(-5)
    clip_api.set_color(party["color"])
    clip_api.set_commands(command)
    
    format_text = clip_api.txt_out()
    
    for text_line in format_text.split("\\n"):
        format_text = format_text.replace(text_line, text_line.encode().decode('unicode-escape'))
    
    if setting["lineFrag"]:
        format_text = format_text.replace("<LF>", r"\\n")
    else:
        format_text = format_text.replace("<LF>", "")
    
    return format_text