// タブの動作制御
function openTab(evt, tabName) {
    // 全てのタブコンテンツを非表示にする
    const tabcontents = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = 'none';
    }
    // 全てのタブボタンの"active"クラスを削除する
    const tablinks = document.getElementsByClassName('tablink');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    // 選択されたタブを表示し、"active"クラスを追加する
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// ページの読み込み完了時
document.addEventListener("DOMContentLoaded", function () {
    // id=defaultOpenのタブをアクティブにする
    document.getElementById("defaultOpen").click();
    
    // 設定の読み込み
    importSettings();

    // 初期検索を実行する
    performSearch();

    // 魔物の検索条件が変更された時
    document.getElementById("searchName").addEventListener("input", performSearch);
    document.getElementById("searchCategory").addEventListener("change", performSearch);
    document.getElementById("searchLevel").addEventListener("change", performSearch);
    document.getElementById("searchPartNum").addEventListener("change", performSearch);

    // 検索結果ページのボタンが押された時
    document.querySelector("#searchResult").addEventListener('click', function (event) {
        // コピーボタンの時
        if (event.target.classList.contains('copy-button')) {
            const item = JSON.parse(event.target.getAttribute('data-item'));
            const copy_type = event.target.getAttribute('data-copy-type');
            copyRow(item, copy_type);
        }
        // 削除ボタンの時
        else if (event.target.classList.contains('delete-button')) {
            const item = JSON.parse(event.target.getAttribute('data-item'));
            deleteRow(item);
        }
        // 編集ボタンの時
        else if (event.target.classList.contains('edit-button')) {
            const item = JSON.parse(event.target.getAttribute('data-item'));
            editRow(item);
            document.getElementById("editOpen").click();
        }
    });

    // 魔物登録ページのボタンが押された時
    document.querySelector("#registerForm2").addEventListener('click', function (event) {
        // 複製ボタンの時
        if (event.target.classList.contains('clone-button')) {
            const buttonId = event.target.id;
            const index = buttonId.replace('registerPart', '').replace('Clone', '');
            clonePart(index);
        }
        // ↑↓ボタンの時
        else if (event.target.classList.contains('change-button')) {
            const buttonId = event.target.id;
            const isUpButton = buttonId.includes('Up');
            if (isUpButton){
                const index = parseInt(buttonId.match(/\d+/)[0]);
                changePart(index, index - 1);
            } else{
                const index = parseInt(buttonId.match(/\d+/)[0]);
                changePart(index, index + 1);
            }
        }
        // 最下部に追加ボタンの時
        else if (event.target.classList.contains('add-button')) {
            addPart();
        }
        // 最下部を削除ボタンの時
        else if (event.target.classList.contains('remove-button')) {
            removePart();
        }
        // データを登録ボタンの時
        else if (event.target.classList.contains('submit-button')) {
            registerData();
        }
        // フォームをクリアボタンの時
        else if (event.target.classList.contains('clear-button')) {
            formClear();
        }
    });

    // 設定ページの設定上書きボタンが押された時
    document.querySelector("#settingForm").addEventListener('click', function (event) {
        // 設定上書きボタンが押された時
        if (event.target.classList.contains('update-button')) {
            updateSettings();
        }
    });
});

// 設定の読み込み・反映
function importSettings() {
    fetch(`/setting`)
        .then(response => response.json())
        .then(data => {
            // 
            addOptions('searchCategory', data.category, "未分類")
            addOptions('registerCategory', data.category)
            addOptions('registerRefe', data.refe)
            addOptions('registerWeak', data.weak)
            addOptions('searchLevel', createNumberList(20), "ALL")
            addOptions('searchPartNum', createNumberList(12), "ALL")
            // 
            document.getElementById('textCategory').value = data.category.join('\n');
            document.getElementById('textRefe').value = data.refe.join('\n');
            document.getElementById('textWeak').value = data.weak.join('\n');
            document.getElementById('textMagic').value = data.skillMagic.join('\n');
            document.getElementById('checkIndent').checked = data.lineFrag;
        });
}

// 選択肢を追加する
function addOptions(elementId, options, defaultOption) {
    const select = document.getElementById(elementId);
    select.innerHTML = '';
    if (defaultOption) {
        const defaultOptionElement = document.createElement('option');
        defaultOptionElement.value = '';
        defaultOptionElement.textContent = defaultOption;
        select.appendChild(defaultOptionElement);
    }
    options.forEach(option => {
        if (!select.querySelector(`option[value="${option}"]`)) {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        }
    });
}

// 1から連続した数字のリストを作成する
function createNumberList(maxNumber) {
    const optionsList = [];
    for (let i = 1; i <= maxNumber; i++) {
        optionsList.push(i);
    }
    return optionsList;
}

// 魔物検索ページの検索結果を表示する
function performSearch() {
    // 
    const searchParams = new URLSearchParams();
    searchParams.set('Name', document.querySelector("#searchName").value);
    searchParams.set('Category', document.querySelector("#searchCategory").value);
    searchParams.set('Level', document.querySelector("#searchLevel").value);
    searchParams.set('PartNum', document.querySelector("#searchPartNum").value);
    // 
    fetch(`/search?${searchParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            // 
            const filteredData = data.filtered_data;
            const memo = data.memo;
            const tbody = document.querySelector("#searchResultsTable tbody");
            tbody.innerHTML = "";
            if (filteredData && filteredData.length) {
                filteredData.forEach((item, index) => {
                    const row = generateRow(item, memo[index]);
                    tbody.append(row);
                });
                document.querySelector("#noDataMessage").style.display = "none";
            } else {
                document.querySelector("#noDataMessage").style.display = "block";
            }
        });
}

// 魔物検索ページの検索結果を作成する
function generateRow(item, memo) {
    // コピーボタンを作成する
    let copyButton = '';
    if (item.PartNum < 5) {
        copyButton = `<button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='1'>出力</button>`;
    }
    else if (item.PartNum < 9) {
        copyButton = `
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='1'>出力(1/2)</button><br>
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='2'>出力(2/2)</button>`;
    }
    else if (item.PartNum < 13) {
        copyButton = `
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='1'>出力(1/3)</button><br>
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='2'>出力(2/3)</button><br>
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='3'>出力(3/3)</button>`;
    }
    // 新しい行を作成する
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${item.Category}</td>
        <td>${item.Level}</td>
        <td class="tooltip">${item.Name}<span class="tooltiptext">${memo.replace(/\n/g, '<br>')}</span></td>
        <td>${item.PartNum}</td>
        <td>${copyButton}</td>
        <td><button class='edit-button' data-item='${JSON.stringify(item)}'>編集</button>
        <button class='delete-button' data-item='${JSON.stringify(item)}'>削除</button></td>
    `;
    return tr
}

// 魔物検索ページの内容をコピーする
function copyRow(item, copy_type) {
    const copyParams = new URLSearchParams();
    copyParams.append('PartyNum', document.getElementById('PartyNum').value);
    copyParams.append('CharaSize', document.getElementById('CharaSize').value);
    copyParams.append('ChatColor', document.getElementById('ChatColor').value);
    copyParams.append('Item', JSON.stringify(item));
    copyParams.append('copy_type', copy_type);
    copyParams.append('SwordFragment', document.getElementById('Sword-fragment-checkbox').checked);
    // 
    fetch(`/copy?${copyParams.toString()}`)
}

// 魔物登録ページ内容を削除する
function deleteRow(item) {
    const confirmation = window.confirm("本当に削除しますか？");

    if (confirmation) {
        const deleteParams = new URLSearchParams();
        deleteParams.append('Item', JSON.stringify(item));
        // 
        fetch(`/delete?${deleteParams.toString()}`)
        .then(response => {
            if(response.ok){
                performSearch();
            }
        })
    }
}

function editRow(item) {
    // 
    formClear();
    const table = document.getElementById("monsterInfoTable").querySelector("tbody");
    const rowNum = table.querySelectorAll("tr").length;
    for (let i = 0; i < rowNum; i++) {
        removePart();
    }
    // 
    const fields = ['Style', 'Accuracy', 'Damage', 'Evasion', 'Defense', 'Hp', 'Mp'];
    for (let i = 0; i < item.PartNum; i++) {
        addPart();
        fields.forEach(field => {
            const element = document.getElementById(`registerPart${i + 1}${field}`);
            if (element) {
                const propertyName = `Part${i + 1}${field}`;
                element.value = item[propertyName];
            }
        });
    }
    document.getElementById("registerLevel").value = item.Level;
    document.getElementById("registerName").value = item.Name;
    document.getElementById("registerCategory").value = item.Category;
    document.getElementById("registerRefe").value = item.Reference;
    document.getElementById("registerWeak").value = item.Weakness;
    document.getElementById("registerRepu1").value = item.Reputation1;
    document.getElementById("registerRepu2").value = item.Reputation2;
    document.getElementById("registerInit").value = item.Initiative;
    document.getElementById("registerVitResi").value = item.VitResist;
    document.getElementById("registerMndResi").value = item.MndResist;
    document.getElementById("registerSkill").value = item.Skill;
}

// 魔物登録ページの魔物部位を複製する
function clonePart(index) {
    // 各フィールドの値を取得する
    const Style = document.querySelector(`#registerPart${index}Style`).value;
    const Accuracy = document.querySelector(`#registerPart${index}Accuracy`).value;
    const Damage = document.querySelector(`#registerPart${index}Damage`).value;
    const Defense = document.querySelector(`#registerPart${index}Defense`).value;
    const Evasion = document.querySelector(`#registerPart${index}Evasion`).value;
    const Hp = document.querySelector(`#registerPart${index}Hp`).value;
    const Mp = document.querySelector(`#registerPart${index}Mp`).value;

    // 新しい行を作成する
    const tbody = document.querySelector("#monsterAttributesTable tbody");
    const rowNum = tbody.querySelectorAll("tr").length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><input type="text" id="registerPart${rowNum + 1}Style" value="${Style}" placeholder="攻撃方法（部位）" styleNum=1></td>
        <td><input type="number" id="registerPart${rowNum + 1}Accuracy" value="${Accuracy}"></td>
        <td>2d6+<input type="number" id="registerPart${rowNum + 1}Damage" value="${Damage}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Evasion" value="${Evasion}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Defense" value="${Defense}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Hp" value="${Hp}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Mp" value="${Mp}"></td>
        <td></td>
        <td>
            <button class='clone-button' id="registerPart${rowNum + 1}Clone"'>複製</button>
            <button class="change-button" id="registerPart${rowNum + 1}Up">↑</button>
            <button class="change-button" id="registerPart${rowNum + 1}Down">↓</button>
        </td>
    `;
    tbody.append(tr);
    updatePartNum();
    // 行の入れ替え
    for (let i = rowNum + 1; i > index; i--) {
        changePart(i, i-1);
    }
}

// 魔物登録ページの魔物部位を入れ替える
function changePart(index1, index2) {
    const fields = ['Style', 'Accuracy', 'Damage', 'Evasion', 'Defense', 'Hp', 'Mp'];
    const table = document.getElementById("monsterAttributesTable").querySelector("tbody");
    const rowNum = table.querySelectorAll("tr").length;
    if(rowNum > 1){
        fields.push('StyleAdd');
    }
    if(index1 > 0 && index2 > 0 && index1 <= rowNum && index2 <= rowNum){
        fields.forEach(field => {
            const elements1 = table.querySelector(`#registerPart${index1}${field}`);
            const elements2 = table.querySelector(`#registerPart${index2}${field}`);
    
            const temp = elements1.value;
            elements1.value = elements2.value;
            elements2.value = temp;
        });
    }
}

// 魔物登録ページの新しい魔物部位を最下部に作成する
function addPart() {
    // 新しい行を作成する
    const tbody = document.querySelector("#monsterAttributesTable tbody");
    const rowNum = tbody.querySelectorAll("tr").length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><input type="text" id="registerPart${rowNum + 1}Style" value="" placeholder="攻撃方法（部位）" styleNum=1></td>
        <td><input type="number" id="registerPart${rowNum + 1}Accuracy" value=""></td>
        <td>2d6+<input type="number" id="registerPart${rowNum + 1}Damage" value=""></td>
        <td><input type="number" id="registerPart${rowNum + 1}Evasion" value=""></td>
        <td><input type="number" id="registerPart${rowNum + 1}Defense" value=""></td>
        <td><input type="number" id="registerPart${rowNum + 1}Hp" value=""></td>
        <td><input type="number" id="registerPart${rowNum + 1}Mp" value=""></td>
        <td></td>
        <td>
            <button class='clone-button' id="registerPart${rowNum + 1}Clone"'>複製</button>
            <button class="change-button" id="registerPart${rowNum + 1}Up">↑</button>
            <button class="change-button" id="registerPart${rowNum + 1}Down">↓</button>
        </td>
    `;
    tbody.append(tr);
    updatePartNum();
}

// 魔物登録ページの最下部の魔物部位を削除する
function removePart() {
    const tr = document.getElementById("monsterAttributesTable").querySelector(`tbody tr:last-child`);
    if (tr) {
        tr.remove();
        resetTable();
        updatePartNum();
    }
}

// 魔物登録ページの魔物部位のidを整理する/idに空白を空ける
function resetTable(index){
    index = index || 0;
    const fields = ['Style', 'StyleAdd', 'Accuracy', 'Damage', 'Evasion', 'Defense', 'Hp', 'Mp', 'Core', 'Clone', 'Remove', 'Up', 'Down'];

    fields.forEach(field => {
        let idCounter = 1;
        const selector = `[id^="registerPart"][id$="${field}"]`;
        const elements = document.querySelectorAll(selector);
    
        elements.forEach(element => {
            if (idCounter != index) {
                const newId = `registerPart${idCounter}${field}`;
                element.id = newId;
            }
            idCounter++;
        });
    });
    
}

// 魔物登録ページの魔物部位の数を数える
function updatePartNum() {
    const table = document.getElementById("monsterAttributesTable").querySelector("tbody");
    const rowNum = table.querySelectorAll("tr").length;
    document.getElementById("partCountHiddenInput").value = rowNum;
    // コア部位のチェックボックス
    if(rowNum > 1){
        addStyle()
        addCoreCheckbox()
    } else{
        removeStyle()
        removeCoreCheckbox()
    }
}

// 魔物登録ページの魔物部位で攻撃方法（部位）を分割する
function addStyle() {
    const table = document.getElementById("monsterAttributesTable").querySelector("tbody");
    table.querySelectorAll("tr").forEach((row, index) => {
        const styleCell = row.cells[0];
        // 
        const StyleInput = styleCell.querySelector(`input[type="text"][id^="registerPart"][id$="Style"]`);
        const StyleCell = StyleInput ? StyleInput.parentElement : null;
        // 
        const AddStyleInput = styleCell.querySelector(`input[type="text"][id^="registerPart"][id$="StyleAdd"]`);
        const AddStyleCell = AddStyleInput ? AddStyleInput.parentElement : null;
        // 
        if (!AddStyleCell) {
            const Style = StyleCell.querySelector('input').value || '';
            const StyleHTML = `<input type="text" id="registerPart${index + 1}Style" value="${Style}" placeholder="攻撃方法" styleNum=2>
            (<input type="text" id="registerPart${index + 1}StyleAdd" value="" placeholder="部位" styleNum=2>)
            `;
            StyleCell.innerHTML = StyleHTML;
        }
    });
}

// 魔物登録ページの魔物部位で攻撃方法（部位）に統合する
function removeStyle() {
    const table = document.getElementById("monsterAttributesTable").querySelector("tbody");
    table.querySelectorAll("tr").forEach((row, index) => {
        const styleCell = row.cells[0];
        // 
        const StyleInput = styleCell.querySelector(`input[type="text"][id^="registerPart"][id$="Style"]`);
        const StyleCell = StyleInput ? StyleInput.parentElement : null;
        // 
        const AddStyleInput = styleCell.querySelector(`input[type="text"][id^="registerPart"][id$="StyleAdd"]`);
        const AddStyleCell = AddStyleInput ? AddStyleInput.parentElement : null;
        // 
        if (AddStyleCell) {
            const Style = StyleCell.querySelector('input').value || '';
            const StyleHTML = `
                <input type="text" id="registerPart${index + 1}Style" value="${Style}" placeholder="攻撃方法（部位）" styleNum=1>
            `;
            StyleCell.innerHTML = StyleHTML;
        }
    });
}

// 魔物登録ページの魔物部位にコア部位のチェックボックスを追加する
function addCoreCheckbox() {
    const table = document.getElementById("monsterAttributesTable").querySelector("tbody");
    table.querySelectorAll("tr").forEach((row, index) => {
        // 
        const coreCell = row.cells[7];
        if (!coreCell.querySelector('input[type="checkbox"]')) {
            const coreCheckboxHTML = `<input type="checkbox" id="outputPart${index + 1}Core">`;
            coreCell.innerHTML += coreCheckboxHTML;
        }
    });
}

// 魔物登録ページの魔物部位のコア部位のチェックボックスを削除する
function removeCoreCheckbox() {
    const table = document.getElementById("monsterAttributesTable").querySelector("tbody");
    table.querySelectorAll("tr").forEach(row => {
        // 
        const coreCell = row.cells[7];
        const checkbox = coreCell.querySelector('input[type="checkbox"]');
        if (checkbox) {
            coreCell.removeChild(checkbox);
        }
    });
}

// 魔物登録ページの「データを登録」ボタン
function registerData() {
    // 
    const data = {
        "Name": document.querySelector("#registerName").value || '',
        "Category": document.querySelector("#registerCategory").value || '',
        "Level": parseInt(document.querySelector("#registerLevel").value) || 0,
        "Reference": document.querySelector("#registerRefe").value || '',
        "Reputation1": parseInt(document.querySelector("#registerRepu1").value) || 0,
        "Reputation2": parseInt(document.querySelector("#registerRepu2").value) || 0,
        "Weakness": document.querySelector("#registerWeak").value || '',
        "Initiative": parseInt(document.querySelector("#registerInit").value) || 0,
        "VitResist": parseInt(document.querySelector("#registerVitResi").value) || 0,
        "MndResist": parseInt(document.querySelector("#registerMndResi").value) || 0,
        "Skill": document.querySelector("#registerSkill").value || '',
        "PartNum": parseInt(document.querySelector("#partCountHiddenInput").value) || 0,
    };
    // 各部位
    const PartNum = data.PartNum;
    for (let i = 1; i <= PartNum; i++) {
        data[`Part${i}Style`] = document.querySelector(`#registerPart${i}Style`)?.value || '';
        if(PartNum > 1){
            data[`Part${i}Style`] += document.querySelector(`#registerPart${i}StyleAdd`)?.value || '';
        }
        data[`Part${i}Accuracy`] = parseInt(document.querySelector(`#registerPart${i}Accuracy`)?.value) || 0;
        data[`Part${i}Damage`] = parseInt(document.querySelector(`#registerPart${i}Damage`)?.value) || 0;
        data[`Part${i}Defense`] = parseInt(document.querySelector(`#registerPart${i}Defense`)?.value) || 0;
        data[`Part${i}Evasion`] = parseInt(document.querySelector(`#registerPart${i}Evasion`)?.value) || 0;
        data[`Part${i}Hp`] = parseInt(document.querySelector(`#registerPart${i}Hp`)?.value) || 0;
        data[`Part${i}Mp`] = parseInt(document.querySelector(`#registerPart${i}Mp`)?.value) || 0;
        // コア部位
        if (PartNum > 1) {
            const checkboxElement = document.querySelector(`#registerPart${i}Core`);
            if (checkboxElement){
                data[`Part${i}Core`] = checkboxElement.checked;
            } else{
                data[`Part${i}Core`] = "false"
            }
        }
    }
    // 
    fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => {
        if(response.ok){
            performSearch();
        }
    })
}

// 魔物登録ページに入力された内容をリセットする
function formClear() {
    const fields = ['Style', 'Accuracy', 'Damage', 'Evasion', 'Defense', 'Hp', 'Mp'];
    const table = document.getElementById("monsterInfoTable").querySelector("tbody");
    const rows = table.querySelectorAll("tr");
    // rowNum の計算
    const rowNum = rows.length;
    if (rowNum > 1) {
        fields.push('StyleAdd');
    }
    // 各行の各フィールドをクリアする
    rows.forEach((row, index) => {
        fields.forEach(field => {
            const element = row.querySelector(`#registerPart${index + 1}${field}`);
            if (element) {
                element.value = '';
            }
        });
    });
    document.getElementById("registerLevel").value = "0";
    document.getElementById("registerName").value = "";
    document.getElementById("registerCategory").value = "";
    document.getElementById("registerRefe").value = "";
    document.getElementById("registerWeak").value = "なし";
    document.getElementById("registerRepu1").value = "0";
    document.getElementById("registerRepu2").value = "0";
    document.getElementById("registerInit").value = "0";
    document.getElementById("registerVitResi").value = "0";
    document.getElementById("registerMndResi").value = "0";
    document.getElementById("registerSkill").value = "";
}

// 設定ページの設定上書きボタン
function updateSettings() {
    // 
    const textCategory = document.getElementById('textCategory').value;
    const textRefe = document.getElementById('textRefe').value;
    const textWeak = document.getElementById('textWeak').value;
    const textMagic = document.getElementById('textMagic').value;
    const lineFrag = document.getElementById('checkIndent').checked;
    // 
    const updatedData = {
        category: textCategory.split('\n').filter(line => line.trim() !== ''),
        refe: textRefe.split('\n').filter(line => line.trim() !== ''),
        weak: textWeak.split('\n').filter(line => line.trim() !== ''),
        skillMagic: textMagic.split('\n').filter(line => line.trim() !== ''),
        lineFrag: lineFrag
    };
    fetch('/setting', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            importSettings();
        }
    })
}