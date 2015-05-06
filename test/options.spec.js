describe("options module", function () {
    var mangaDirectoryPage, mangaDirectoryPageString, server;
    beforeAll(function () {
        fixture.setBase('test');
        mangaDirectoryPageString = window.__html__['test/manga_directory.html'];
        mangaDirectoryPage = document.implementation.createHTMLDocument();
        mangaDirectoryPage.documentElement.innerHTML = mangaDirectoryPageString;
    });
    beforeEach(function () {
        fixture.load('options.fixture.html');
    });
    describe('getMangaDirectory', function () {
        var callback, errorCallback, url;

        beforeEach(function () {
            callback = jasmine.createSpy('callback');
            errorCallback = jasmine.createSpy('error callback');
            jasmine.Ajax.install();
        });
        afterEach(function () {
            jasmine.Ajax.uninstall();
        });
        it('requests the manga directory page and if the request is successful, passes it to the callback', function () {
            url = 'fakeUrl';
            getMangaDirectory(url, callback, errorCallback);
            expect(jasmine.Ajax.requests.mostRecent().url).toBe(url);
            expect(callback).not.toHaveBeenCalled();
            expect(errorCallback).not.toHaveBeenCalled();

            jasmine.Ajax.requests.mostRecent().respondWith({
                "status": 200,
                "contentType": 'document/html',
                "responseText": mangaDirectoryPageString
            });
            expect(callback).toHaveBeenCalledWith(mangaDirectoryPageString);
            expect(errorCallback).not.toHaveBeenCalled();
        });
        it('calls error callback if request fails', function () {
            url = 'fakeErrorUrl';
            getMangaDirectory(url, callback, errorCallback);
            jasmine.Ajax.requests.mostRecent().responseError();
            expect(errorCallback).toHaveBeenCalled();
        });
        it('calls error callback if server returns 404', function () {
            url = 'fakeErrorUrl';
            getMangaDirectory(url, callback, errorCallback);
            jasmine.Ajax.requests.mostRecent().respondWith({
                "status": 404
            });
            expect(errorCallback).toHaveBeenCalled();
        });
    });
    it('creates manga list from a manga directory page', function () {
        createMangaList(mangaDirectoryPage);
        expect(document.querySelectorAll('label').length).toEqual(47);
    });
});