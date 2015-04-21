var list = document.querySelector('#list'),
    url = 'http://mangastream.com/manga';
var xhr = new XMLHttpRequest();
xhr.onload = function () {
    var page = this.responseXML;
    processPage(page);
};
xhr.open('GET', url);
xhr.responseType = "document";
xhr.send();

var selectedManga = localStorage.getItem('selectedManga');
if (selectedManga) selectedManga = JSON.parse(selectedManga);
else selectedManga = [];

var checkPeriod = localStorage.getItem('checkPeriod');
if (checkPeriod) checkPeriod = parseInt(checkPeriod, 10);
else checkPeriod = 15;
localStorage.setItem('checkPeriod', checkPeriod);
var cpEl = document.querySelector('#check_period');
cpEl.value = checkPeriod;
cpEl.onchange = function () {
    chrome.runtime.sendMessage({type: 'checkPeriod', newVal: this.value});
    localStorage.setItem('checkPeriod', this.value);
};

function onSelect() {
    var selectedManga = [];
    var selectedCheckboxes = document.querySelectorAll('input:checked');
    for (var i = 0; i < selectedCheckboxes.length; i++) {
        selectedManga.push(selectedCheckboxes[i].value);
    }
    localStorage.setItem('selectedManga', JSON.stringify(selectedManga));
    chrome.runtime.sendMessage({type: 'selectedManga', newVal: selectedManga});
}

function processPage(page) {
    var rows = page.querySelectorAll('tr');

    for (var i = 1; i < rows.length; i++) { //row 0 is table header
        var title = rows[i].querySelector('td').textContent;
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = title;
        checkbox.id = title;
        checkbox.onchange = onSelect;
        if (selectedManga.indexOf(title) !== -1) {
            checkbox.checked = true;
        }
        var label = document.createElement('label');
        label.textContent = title;
        label.insertBefore(checkbox, label.childNodes[0]);
        label.appendChild(document.createElement('br'));
        list.appendChild(label);
    }
}

document.querySelector('#filter').onkeyup = function filterCheckboxes(event) {
    var filterText = this.value.toLowerCase();
    var labels = document.querySelectorAll('#list label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.toLowerCase().indexOf(filterText) === -1) label.style.display = 'none';
        else label.style.display = 'inline';
    }
};