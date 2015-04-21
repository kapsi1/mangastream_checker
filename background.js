var url = 'http://mangastream.com/rss';
var isOpera = navigator.vendor === 'Opera Software ASA';
var selectedManga = localStorage.getItem('selectedManga');
if (selectedManga) selectedManga = JSON.parse(selectedManga);
else selectedManga = [];

var checkPeriod = localStorage.getItem('checkPeriod');
if (checkPeriod) checkPeriod = parseInt(checkPeriod, 10);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case 'selectedManga':
            selectedManga = request.newVal;
            getData();
            break;
        case 'checkPeriod':
            checkPeriod = parseInt(request.newVal, 10);
            setAlarm();
            break;
    }
});

var seen = localStorage.getItem('seen');
if (seen) seen = JSON.parse(seen);
else seen = [];

function setAlarm() {
    console.log('setAlarm', checkPeriod);
    chrome.alarms.create('mangastreamchecker', {when: Date.now() + 100, periodInMinutes: checkPeriod});
}

chrome.runtime.onInstalled.addListener(function () {
    if (checkPeriod) setAlarm();
});
console.log('checkPeriod', checkPeriod);
if (!checkPeriod) {
    var optionsPageUrl;
    if (isOpera) optionsPageUrl = 'chrome-extension://' + chrome.runtime.id + '/options.html';
    else optionsPageUrl = 'chrome://extensions?options=' + chrome.runtime.id;
    console.log('optionsPageUrl', optionsPageUrl);
    newTab(optionsPageUrl);
}

chrome.alarms.onAlarm.addListener(function (alarm) {
    getData();
});

function showNotification(title, message, url) {
    var n = new Notification(title, {
        body: message,
        icon: 'logo.png'
    });
    n.onclick = function () {
        newTab(url);
    };
}

function processPage(page) {
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
        if (seen.indexOf(mangaTitle + chapterNumber) === -1) {
            seen.push(mangaTitle + chapterNumber);
            showNotification(mangaTitle + ' chapter ' + chapterNumber, chapterTitle, chapterUrl);
        }
    }
    localStorage.setItem('seen', JSON.stringify(seen));
}

function getData() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var page = this.responseXML;
        processPage(page);
    };
    xhr.open('GET', url);
    xhr.responseType = "document";
    xhr.send();
}

function newTab(url) {
    // trying to create a tab
    if (chrome.runtime.lastError) {
        console.log(1, chrome.runtime.lastError.message);
    }
    chrome.tabs.create({url: url}, function (tab) {
        if (chrome.runtime.lastError) {
            console.log(2, chrome.runtime.lastError.message);
        }
        if (!tab) {
            // probably no window available
            chrome.windows.create({url: url}, function (win) {
                // better to focus after window creation callback
                chrome.windows.update(win.id, {focused: true})
            })
        } else {
            // better to focus after tab creation callback
            chrome.windows.update(tab.windowId, {focused: true})
        }
    })
}