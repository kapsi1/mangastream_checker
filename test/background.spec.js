describe("background module", function () {
    beforeEach(function () {
        localStorage.clear();
    });

    describe('saveToStorage', function () {
        it('saves an object as JSON in localStorage', function () {
            var obj = {num: 123, str: 'a string', arr: ['a', 1, {inner: 'b'}], innerObj: {'innerProp': 'abc'}};
            saveToStorage('key', obj);
            expect(localStorage.getItem('key')).toEqual(JSON.stringify(obj));
        });
    });
    describe('restoreFromStorage', function () {
        it('restores object from localStorage', function () {
            var obj = {num: 123, str: 'a string', arr: ['a', 1, {inner: 'b'}], innerObj: {'innerProp': 'abc'}};
            localStorage.setItem('key', JSON.stringify(obj));
            var res = restoreFromStorage('key');
            expect(res).toEqual(obj);
        });
    });

    describe('seenChapters', function () {
        it('returns empty array if no data is saved in localStorage', function () {
            var res = seenChapters();
            expect(res).toEqual([]);
        });
        it('returns data saved in localStorage', function () {
            var data = [123, 456, 789];
            saveToStorage('seenChapters', data);
            var res = seenChapters();
            expect(res).toEqual(data);
        });
    });

    describe('checkPeriod', function () {
        it('loads check period from storage', function () {
            saveToStorage('checkPeriod', 123);
            expect(checkPeriod()).toEqual(123);
        });
        it("opens options page if checkPeriod isn't set in localStorage", function () {
            spyOn(window, 'openOptions');
            checkPeriod();
            expect(openOptions).toHaveBeenCalled();
        });
    });
    describe('processRssPage', function () {
        it('processes a rss page', function () {
            var rssString = window.__html__['test/rss.xml'];
            var doc = document.implementation.createDocument(null, "xml", null);
            doc.documentElement.innerHTML = rssString;

            var selectedManga = ['Ubel Blatt', 'Fairy Tail'];
            var seenChapters = [];
            spyOn(window, 'showNotification');
            processRssPage(doc, selectedManga, seenChapters);
            expect(window.showNotification.calls.count()).toEqual(6);
            seenChapters = ['Ubel Blatt133', 'Fairy Tail432', 'Fairy Tail431', 'Fairy Tail430',
                'Fairy Tail429', 'Fairy Tail428'];
            expect(restoreFromStorage('seenChapters')).toEqual(seenChapters);
            window.showNotification.calls.reset();
            processRssPage(doc, selectedManga, seenChapters);
            expect(window.showNotification.calls.count()).toEqual(0);
        });
    });
});