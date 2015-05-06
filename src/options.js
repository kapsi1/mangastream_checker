function getMangaDirectory(mangaDirectoryURL, callback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', mangaDirectoryURL);
    xhr.responseType = "document";
    xhr.onload = function () {
        if (this.status === 200) {
            var page = this.response;
            callback(page);
        } else errorCallback(this);
    };
    xhr.onerror = errorCallback;
    xhr.send();
}

function showError() {
    document.write('<h1>Error while downloading data from mangastream. Check your connection or try again later.</h1>');
}

function onMangaSelected() {
    var selectedManga = [];
    var selectedCheckboxes = document.querySelectorAll('input:checked');
    for (var i = 0; i < selectedCheckboxes.length; i++) {
        selectedManga.push(selectedCheckboxes[i].value);
    }
    localStorage.setItem('selectedManga', JSON.stringify(selectedManga));
    chrome.runtime.sendMessage({type: 'selectedManga', newVal: selectedManga});
}

function createMangaList(mangaDirectoryPage) {
    var list = document.querySelector('#list');
    var rows = mangaDirectoryPage.querySelectorAll('tr');
    for (var i = 1; i < rows.length; i++) { //row 0 is table header
        var title = rows[i].querySelector('td').textContent;
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = title;
        checkbox.id = title;
        checkbox.onchange = onMangaSelected;
        if (getSelectedManga().indexOf(title) !== -1) {
            checkbox.checked = true;
        }
        var label = document.createElement('label');
        label.textContent = title;
        label.insertBefore(checkbox, label.childNodes[0]);
        label.appendChild(document.createElement('br'));
        list.appendChild(label);
    }
}

function initMangaFilter() {
    document.querySelector('#filter').onkeyup = function filterCheckboxes(event) {
        var filterText = this.value.toLowerCase();
        var labels = document.querySelectorAll('#list label');
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.textContent.toLowerCase().indexOf(filterText) === -1) label.style.display = 'none';
            else label.style.display = 'inline';
        }
    }
}

function initCheckPeriodOption() {
    var cpEl = document.querySelector('#check_period');
    cpEl.value = getCheckPeriod();
    cpEl.onchange = function () {
        localStorage.setItem('checkPeriod', this.value);
        chrome.runtime.sendMessage({type: 'checkPeriod', newVal: this.value});
    };
    cpEl.onchange();
}

function getSelectedManga() {
    var selectedManga = localStorage.getItem('selectedManga');
    if (selectedManga) selectedManga = JSON.parse(selectedManga);
    else selectedManga = [];
    return selectedManga;
}

function getCheckPeriod() {
    var checkPeriod = localStorage.getItem('checkPeriod');
    if (checkPeriod) checkPeriod = parseInt(checkPeriod, 10);
    else checkPeriod = 15;
    return checkPeriod;
}

function init() {
    initMangaFilter();
    initCheckPeriodOption();
    getMangaDirectory('http://mangastream.com/manga', createMangaList, showError);
}
//for unit testing init only if we're in extension context
if(chrome.runtime !== undefined) init();