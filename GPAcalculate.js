if (localStorage.getItem('localSaveData') === null) {
    localStorage.setItem('localSaveData', JSON.stringify({}))
} else {
    console.log("localstoarge読み込み")
}

const gradeMap = { 1: "可", 2: "良", 3: "優", 4: "秀", 0: "F" };

const yearSemesterMap = {
    'first-year-first-semester-table': '一年\n前期',
    'first-year-second-semester-table': '一年\n後期',
    'second-year-first-semester-table': '二年\n前期',
    'second-year-second-semester-table': '二年\n後期',
    'third-year-first-semester-table': '三年\n前期',
    'third-year-second-semester-table': '三年\n後期',
    'fourth-year-first-semester-table': '四年\n前期',
    'fourth-year-second-semester-table': '四年\n後期'
};

const tablesMap = {
    "1f": document.getElementById('first-year-first-semester-table'),
    "1s": document.getElementById('first-year-second-semester-table'),
    "2f": document.getElementById('second-year-first-semester-table'),
    "2s": document.getElementById('second-year-second-semester-table'),
    "3f": document.getElementById('third-year-first-semester-table'),
    "3s": document.getElementById('third-year-second-semester-table'),
    "4f": document.getElementById('fourth-year-first-semester-table'),
    "4s": document.getElementById('fourth-year-second-semester-table')
};

let credits = {};
let grades = {};
let yearAndSemestars = {};
let checkBoxDatas = {};
let gpaResult = {};

function mkList(semesterData, creditsData, gradesData, year) {
    return Object.keys(semesterData)
        .map(key => yearAndSemestars[key] === year ? key : null)
        .filter(key => key !== "null" && key !== null)
        .map(key => ([
            key,
            creditsData[key],
            gradeMap[gradesData[key]]
        ]));
}

function mkTable(tableId, data) {
    let firstRow = tableId.insertRow(0);
    let firstCell = firstRow.insertCell(0);
    firstCell.className = "course-name";
    firstCell.rowSpan = data.length + 1;
    firstCell.textContent = yearSemesterMap[tableId.id];
    data.forEach((rowData, rowIndex) => {
        const row = tableId.insertRow(rowIndex + 1);
        const checkBoxCell = row.insertCell(0);
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.checked = checkBoxDatas[rowData[0]];
        checkBox.addEventListener("change", () => {
            checkBoxDatas[rowData[0]] = checkBox.checked;
            updateTables();
        });
        checkBoxCell.appendChild(checkBox);
        rowData.forEach((cellData, cellIndex) => {
            const cell = row.insertCell(cellIndex + 1);
            cell.textContent = cellData;
        });
        const deleteCell = row.insertCell(rowData.length + 1);
        const deleteButton = document.createElement("button");
        deleteButton.className = "cell-delete-btn";
        deleteButton.textContent = "削除";
        deleteButton.addEventListener("click", () => {
            const subjectName = rowData[0];
            delete credits[subjectName];
            delete grades[subjectName];
            delete yearAndSemestars[subjectName];
            delete checkBoxDatas[subjectName];
            updateTables();
        });
        deleteCell.appendChild(deleteButton);
    });
}

function gpaFilters(year) {
    return Object.keys(yearAndSemestars)
        .map(key => yearAndSemestars[key] === year ? key : null)
        .map(key => checkBoxDatas[key] === true ? key : null)
        .filter(key => key !== null);
}

function gpaCalculation(year) {
    return gpaFilters(year).reduce(
        ([totalGp, totalCredit], gpaValue) => [
            totalGp + credits[gpaValue] * grades[gpaValue],
            totalCredit + credits[gpaValue]
        ],
        [0, 0]
    );
};

const decimalPlaces = 4;

function truncateDecimal(gpa, credit) {
    return Math.floor((gpa / credit) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}

function updateTables() {
    Object.entries(tablesMap).forEach(
        ([year, tableId]) => {
            tableId.innerHTML = ""; 
            const dataList = mkList(yearAndSemestars, credits, grades, year)
            mkTable(tableId, dataList);
        }
    );

    ['1f', '1s', '2f', '2s', '3f', '3s', '4f', '4s'].forEach(semester => {
        const [gpaNumerator, gpaDenominator] = gpaCalculation(semester);
        gpaResult[`gpa-${semester}`] = truncateDecimal(gpaNumerator, gpaDenominator);
    });

    const gpaYears = ['1', '2', '3', '4'].map(year => {
        const gpaNumerator = gpaCalculation(`${year}f`)[0] + gpaCalculation(`${year}s`)[0];
        const gpaDenominator = gpaCalculation(`${year}f`)[1] + gpaCalculation(`${year}s`)[1];
        gpaResult[`gpa-${year}`] = truncateDecimal(gpaNumerator, gpaDenominator);
        return [gpaNumerator, gpaDenominator];
    });

    gpaResult['gpa-1-and-2'] = truncateDecimal(...gpaYears.slice(0, 2).reduce(
        ([totalGpaNumerator, totalGpaDenominator], [gpaNumerator, gpaDenominator]) => [
            totalGpaNumerator + gpaNumerator, totalGpaDenominator + gpaDenominator
        ], [0, 0]
    ));

    gpaResult['gpa-all'] = truncateDecimal(...gpaYears.reduce(
        ([totalGpaNumerator, totalGpaDenominator], [gpaNumerator, gpaDenominator]) => [
            totalGpaNumerator + gpaNumerator, totalGpaDenominator + gpaDenominator
        ], [0, 0]
    ));

    document.getElementById(`first-year-first-semester-gpa`).innerText = `一年前期: ${isNaN(gpaResult[`gpa-1f`]) ? 0 :gpaResult[`gpa-1f`]}`;
    document.getElementById(`first-year-second-semester-gpa`).innerText = `一年後期: ${isNaN(gpaResult[`gpa-1s`]) ? 0 :gpaResult[`gpa-1s`]}`;
    document.getElementById(`second-year-first-semester-gpa`).innerText = `二年前期: ${isNaN(gpaResult[`gpa-2f`]) ? 0 :gpaResult[`gpa-2f`]}`;
    document.getElementById(`second-year-second-semester-gpa`).innerText = `二年後期: ${isNaN(gpaResult[`gpa-2s`]) ? 0 :gpaResult[`gpa-2s`]}`;
    document.getElementById(`third-year-first-semester-gpa`).innerText = `三年前期: ${isNaN(gpaResult[`gpa-3f`]) ? 0 :gpaResult[`gpa-3f`]}`;
    document.getElementById(`third-year-second-semester-gpa`).innerText = `三年後期: ${isNaN(gpaResult[`gpa-3s`]) ? 0 :gpaResult[`gpa-3s`]}`;
    document.getElementById(`fourth-year-first-semester-gpa`).innerText = `四年前期: ${isNaN(gpaResult[`gpa-4f`]) ? 0 :gpaResult[`gpa-4f`]}`;
    document.getElementById(`fourth-year-second-semester-gpa`).innerText = `四年後期: ${isNaN(gpaResult[`gpa-4s`]) ? 0 :gpaResult[`gpa-4s`]}`;
    document.getElementById(`first-gpa`).innerText = `一年: ${isNaN(gpaResult['gpa-1']) ? 0 :gpaResult['gpa-1']}`;
    document.getElementById(`second-gpa`).innerText = `二年: ${isNaN(gpaResult['gpa-2']) ? 0 :gpaResult['gpa-2']}`;
    document.getElementById(`third-gpa`).innerText = `三年: ${isNaN(gpaResult['gpa-3']) ? 0 :gpaResult['gpa-3']}`;
    document.getElementById(`fourth-gpa`).innerText = `四年: ${isNaN(gpaResult['gpa-4']) ? 0 :gpaResult['gpa-4']}`;
    document.getElementById('first-second-gpa').innerText = `一年二年: ${isNaN(gpaResult['gpa-1-and-2']) ? 0 :gpaResult['gpa-1-and-2']}`;
    document.getElementById('cumulative-gpa').innerText = `累積: ${isNaN(gpaResult['gpa-all']) ? 0 :gpaResult['gpa-all']}`;
}

function saveToLocalData(name) {
    const localSaveData = JSON.parse(window.localStorage.getItem('localSaveData'));
    localSaveData[`data-${name}`] = {
        "credit": credits,
        "grade": grades,
        "yearAndSemestar": yearAndSemestars,
        "checkBoxData": checkBoxDatas
    }
    localStorage.setItem('localSaveData', JSON.stringify(localSaveData));
    console.log(`データ${name}を保存しました`)
}

function loadLocalData(name) {
    const localSaveData = JSON.parse(window.localStorage.getItem('localSaveData'));
    if (!localSaveData[`data-${name}`]) {
        console.log(`データ${name}は存在しません`);
        return;
    }
    credits = localSaveData[`data-${name}`].credit;
    grades = localSaveData[`data-${name}`].grade;
    yearAndSemestars = localSaveData[`data-${name}`].yearAndSemestar;
    checkBoxDatas = localSaveData[`data-${name}`].checkBoxData;
    updateTables()
    console.log(`データ${name}をロードしました`)
}

function DeleteFromLocalData(name) {
    const localSaveData = JSON.parse(window.localStorage.getItem('localSaveData'));
    delete localSaveData[`data-${name}`];
    localStorage.setItem('localSaveData', JSON.stringify(localSaveData));
    const saveLoadElement = document.getElementById("save-load");
    const elementToRemove = document.getElementById(`save-load-${name}`);
    if (elementToRemove) {
        saveLoadElement.removeChild(elementToRemove);
    }
    console.log(`データ${name}は削除されました`)
}

function addSaveLoadElement(name) {
    const saveLoadElement = document.getElementById("save-load");
    saveLoadElement.innerHTML += `
        <div id="save-load-${name}">
            <p>データ${name}</p>
            <button type="button" id="save-${name}" class="save-btn">保存</button>
            <button type="button" id="load-${name}" class="load-btn">ロード</button>
            <button type="button" id="delete-${name}" class="delete-btn">削除</button>
        </div>
    `;
}

function initializeSaveData() {
    const localSaveDataList = Object.keys(JSON.parse(window.localStorage.getItem('localSaveData')))
    .map(key => key.split('-')[1]);
    localSaveDataList.forEach(name => {
        addSaveLoadElement(name);
    });
}

function mkNewSaveData() {
    const name = String(document.getElementById("input-new-data-name").value);
    if (name === "") {
        console.log("保存名の入力がありません");
    } else if (document.getElementById(`save-load-${name}`)) {
        console.log(`${name}は既に存在します`);
    } else {
        addSaveLoadElement(name);
    };
    document.getElementById("input-new-data-name").value = "";
    updateTables();
}

document.getElementById('addRow').addEventListener('click', () => {
    const subjectName = document.getElementById("input-subject-name").value;
    const credit = Number(document.getElementById("input-credit").value);
    const grade = Number(document.getElementById("input-grade").value);
    const year = document.querySelector('input[name="year"]:checked').value;
    const semester = document.querySelector('input[name="semester"]:checked').value;
    if (subjectName === "") {
        console.log("科目名の入力がありません")
    } else {
        credits[subjectName] = credit;
        grades[subjectName] = grade;
        yearAndSemestars[subjectName] = year + semester;
        checkBoxDatas[subjectName] = true;
    }
    document.getElementById("input-subject-name").value = "";
    updateTables();
});

document.getElementById('create-new-data').addEventListener('click', () => {
    mkNewSaveData();
});

document.getElementById('save-load').addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
        const [action, name] = target.id.split('-');
        switch(action) {
            case 'save':
                saveToLocalData(name);
                break;
            case 'load':
                loadLocalData(name);
                break;
            case 'delete':
                DeleteFromLocalData(name);
                break;
        }
    }
});

initializeSaveData()
updateTables()

console.log()
