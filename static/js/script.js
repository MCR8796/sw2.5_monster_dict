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
    document.querySelector("#searchResult tbody").addEventListener('click', function (event) {
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
    });

    // 魔物登録ページのボタンが押された時
    document.querySelector("#registerForm2 tbody").addEventListener('click', function (event) {
        // 複製ボタンの時
        if (event.target.classList.contains('clone-button')) {
            const buttonId = event.target.id;
            const index = buttonId.replace('registerPart', '').replace('Clone', '');
            clonePart(index);
        }
        // 削除ボタンの時
        else if (event.target.classList.contains('remove-button')) {
            const buttonId = event.target.id;
            const index = buttonId.replace('registerPart', '').replace('Remove', '');
            removePart(index);
        }
        // ↓ボタンの時
        else if (event.target.classList.contains('change-button')) {
            const buttonId = event.target.id;
            const index = buttonId.replace('registerPart', '').replace('Change', '');
            changePart(index, index - 1);
        }
    });

    // 魔物登録ページの魔物登録ボタンが押された時
    document.getElementById('registerData').addEventListener('click', registerData);

    // 設定ページの設定上書きボタンが押された時
    document.getElementById('registerSetting').addEventListener('click', updateSettings);
});

// 魔物検索結果を表示する
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
            const tbody = document.querySelector("#searchResult tbody");
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

// 魔物検索結果の新しい行を作成する
function generateRow(item, memo) {
    // コピーボタンを作成する
    let copyButton = '';
    if (item.PartNum < 5) {
        copyButton = `<button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='1'>copy1</button>`;
    }
    else if (item.PartNum < 9) {
        copyButton = `
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='1'>copy1</button><br>
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='2'>copy2</button>`;
    }
    else if (item.PartNum < 13) {
        copyButton = `
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='1'>copy1</button><br>
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='2'>copy2</button><br>
        <button class='copy-button' data-item='${JSON.stringify(item)}' data-copy-type='3'>copy3</button>`;
    }
    // 新しい行を作成する
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${item.Category}</td>
        <td>${item.Level}</td>
        <td class="tooltip">${item.Name}<span class="tooltiptext">${memo.replace(/\n/g, '<br>')}</span></td>
        <td>${item.PartNum}</td>
        <td>${copyButton}</td>
        <td><button class='delete-button' data-item='${JSON.stringify(item)}'>削除</button></td>
    `;
    return tr
}

// 魔物登録ページのコピーボタン
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

// 魔物登録ページの削除ボタン
function deleteRow(item) {
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
        "PartNum": parseInt(document.querySelector("#registerPartNum").value) || 0,
    };
    // 各部位
    const PartNum = data.PartNum;
    for (let i = 1; i <= PartNum; i++) {
        data[`Part${i}Style`] = document.querySelector(`#registerPart${i}Style`)?.value || '';
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

// 魔物登録ページの新しい魔物部位の行を作成する
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
    const tbody = document.querySelector("#registerTable2 tbody");
    const rowNum = tbody.querySelectorAll("tr").length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><input type="text" id="registerPart${rowNum + 1}Style" value="${Style}" placeholder="攻撃方法（部位）"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Accuracy" value="${Accuracy}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Damage" value="${Damage}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Evasion" value="${Defense}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Defense" value="${Evasion}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Hp" value="${Hp}"></td>
        <td><input type="number" id="registerPart${rowNum + 1}Mp" value="${Mp}"></td>
        <td></td>
        <td>
            <button class='clone-button' id="registerPart${rowNum + 1}Clone"'>複製</button>
            <button class='remove-button' id="registerPart${rowNum + 1}Remove"'>削除</button>
            <button class='change-button' id="registerPart${rowNum + 1}Change">↑</button>
        </td>
    `;
    tbody.append(tr);

    // 行の入れ替え
    for (let i = rowNum + 1; i > index; i--) {
        changePart(i, i-1);
    }
    // 
    updatePartNum();
}

// 魔物登録ページの魔物部位の行を削除する
function removePart(index){
    const tr = document.querySelector(`#registerTable2 tbody tr:nth-child(${index})`);
    // 
    if (tr) {tr.remove();}
    // 
    resetTable();
    // 
    updatePartNum();
}

// 魔物登録ページの魔物部位の行を入れ替える
function changePart(index1, index2) {
    const fields = ['Style', 'Accuracy', 'Damage', 'Evasion', 'Defense', 'Hp', 'Mp'];

    fields.forEach(field => {
        const elements1 = document.querySelector(`#registerPart${index1}${field}`);
        const elements2 = document.querySelector(`#registerPart${index2}${field}`);

        const temp = elements1.value;
        elements1.value = elements2.value;
        elements2.value = temp;
    });
}


// 魔物登録ページの魔物部位のidを整理する/idに空白を空ける
function resetTable(index){
    index = index || 0;
    const fields = ['Style', 'Accuracy', 'Damage', 'Evasion', 'Defense', 'Hp', 'Mp', 'Core', 'Clone', 'Remove', 'Change'];

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
    const table = document.getElementById("registerTable2").querySelector("tbody");
    const rowNum = table.querySelectorAll("tr").length;
    document.getElementById("registerPartNum").value = rowNum;
    // コア部位のチェックボックス
    if(rowNum > 1){
        addCoreIfNecessary()
    } else{
        removeCoreIfNecessary()
    }
}

// 魔物登録ページの魔物部位にコア部位のチェックボックスを追加する
function addCoreIfNecessary() {
    const table = document.getElementById("registerTable2").querySelector("tbody");
    table.querySelectorAll("tr").forEach((row, index) => {
        // 
        const coreCell = row.cells[7];
        if (!coreCell.querySelector('input[type="checkbox"]')) {
            const coreCheckbox = document.createElement("input");
            coreCheckbox.type = "checkbox";
            coreCheckbox.id = `outputPart${index + 1}Core`;
            // 
            coreCell.appendChild(coreCheckbox);
        }
    });
}

// 魔物登録ページの魔物部位のコア部位のチェックボックスを削除する
function removeCoreIfNecessary() {
    const table = document.getElementById("registerTable2").querySelector("tbody");
    table.querySelectorAll("tr").forEach(row => {
        // 
        const coreCell = row.cells[7];
        const checkbox = coreCell.querySelector('input[type="checkbox"]');
        if (checkbox) {
            coreCell.removeChild(checkbox);
        }
    });
}