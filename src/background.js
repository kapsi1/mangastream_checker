var isOpera = navigator.userAgent.indexOf('OPR') !== -1;

function saveToStorage(key, obj){
    localStorage.setItem(key, JSON.stringify(obj));
}
function restoreFromStorage(key){
    var obj = localStorage.getItem(key);
    if(obj === null) return obj;
    else return JSON.parse(obj);
}

function seenChapters() {
    return restoreFromStorage('seenChapters') || [];
}

function selectedManga() {
    return restoreFromStorage('selectedManga') || [];
}

function openOptions() {
    var optionsPageUrl;
    if (isOpera) optionsPageUrl = 'chrome-extension://' + chrome.runtime.id + '/options.html';
    else optionsPageUrl = 'chrome://extensions?options=' + chrome.runtime.id;
    chrome.tabs.create({url: optionsPageUrl});
}

function checkPeriod() {
    return restoreFromStorage('checkPeriod');
}

function setAlarm() {
    chrome.alarms.create('mangastreamchecker', {when: Date.now() + 100, periodInMinutes: checkPeriod()});
}

function showNotification(title, message, url) {
    var n = new Notification(title, {
        body: message,
        icon: 'logo.png'
    });
    n.onclick = function () {
        chrome.tabs.create({url: url});
    };
}

function processRssPage(page, selectedManga, seenChapters) {
    selectedManga = selectedManga || [];
    seenChapters = seenChapters || [];
    var items = page.querySelectorAll('item');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var fullTitle = item.querySelector('title').textContent;
        var split = fullTitle.split(' ');
        var chapterNumber = parseInt(split.pop());
        var mangaTitle = split.join(' ');
        if (selectedManga.indexOf(mangaTitle) === -1) continue;
        var chapterTitle = item.querySelector('description').textContent;
        var chapterUrl = item.querySelector('link').textContent;
        if (seenChapters.indexOf(mangaTitle + chapterNumber) === -1) {
            seenChapters.push(mangaTitle + chapterNumber);
            showNotification(mangaTitle + ' chapter ' + chapterNumber, chapterTitle, chapterUrl);
        }
    }
    localStorage.setItem('seenChapters', JSON.stringify(seenChapters));
}

function getData(url) {
    url = url || 'http://mangastream.com/rss';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var page = this.responseXML;
        processRssPage(page, selectedManga(), seenChapters());
    };
    xhr.open('GET', url);
    xhr.responseType = "document";
    xhr.send();
}

function init() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.type) {
            case 'selectedManga':
                getData();
                break;
            case 'checkPeriod':
                setAlarm();
                break;
        }
    });
    chrome.runtime.onInstalled.addListener(function () {
        if (checkPeriod()) setAlarm();
        else openOptions(); //open options page after installation, options will set checkPeriod
    });
    chrome.alarms.onAlarm.addListener(function (alarm) {
        getData();
    });
}

if(chrome.runtime !== undefined) init();