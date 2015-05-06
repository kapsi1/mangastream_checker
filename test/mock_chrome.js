//mock window.chrome properties for unit testing

chrome.runtime = {
    onMessage: {
        addListener: function (cb) {
        }
    },
    onInstalled: {
        addListener: function (cb) {
        }
    }
};
chrome.alarms = {
    onAlarm: {
        addListener: function (cb) {
        }
    },
    create: function () {
    }
};