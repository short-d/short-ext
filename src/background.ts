import webRequest = chrome.webRequest;
import ResourceType = webRequest.ResourceType;
import BlockingResponse = webRequest.BlockingResponse;

interface Details {
    url: string
}

function isFromAddressBar(url: string): boolean {
    return [
        'google.com/search?q=',
        'bing.com/search?q=',
        'duckduckgo.com/?q='
    ].some(pattern => url.indexOf(pattern) !== -1);
}

function extractQuery(url: string): string {
    return new URL(url).searchParams.get('q')!;
}

function extractAlias(shortLink: string): string {
    let aliasStartIdx = shortLink.lastIndexOf('/') + 1;
    return shortLink.substring(aliasStartIdx);
}

function openTab(url: string) {
    chrome
        .tabs
        .create({
            url: url
        });
}

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (request) {
            if (request.message == "ping") {
                sendResponse({ping: true});
            }
        }
    }
);

class ShortExt {
    constructor(private apiBaseUrl: string, private webUi: string) {
        this.setupOmnibox();
        // Execute when extension icon is clicked
        this.redirectToHomePage();
    }

    fullURL = (alias: string) => {
        // Escape user input for special characters , / ? : @ & = + $ #
        let escapedAlias = encodeURIComponent(alias);
        return `${this.apiBaseUrl}${escapedAlias}`;
    };

    setupOmnibox = () => {
        chrome
            .omnibox
            .onInputEntered
            .addListener((alias: string) => {
                let url = this.fullURL(alias);
                openTab(url);
            });
    };

    redirect = (details: Details): BlockingResponse => {
        let shortLink = details.url;

        if (isFromAddressBar(shortLink)) {
            shortLink = extractQuery(shortLink);
        }

        let alias = extractAlias(shortLink);
        if (alias) {
            return {
                redirectUrl: `${this.apiBaseUrl}${alias}`
            };
        }
        return {
            redirectUrl: `${this.webUi}`
        };
    };

    interceptRequests() {
        let types: ResourceType[] = [
            'main_frame'
        ];

        let filter = {
            urls: [
                '*://s/*',
                '*://*.google.com/search?q=s%2F*'
            ],
            types: types
        };

        webRequest
            .onBeforeRequest
            .addListener(this.redirect, filter, ["blocking"]);
    }

    launch() {
        this.interceptRequests();
    }

    redirectToHomePage = () => {
        //  browser_action need to be configured in manifest.json
        chrome
            .browserAction
            .onClicked
            .addListener((tab: chrome.tabs.Tab) => {
                if (this.isOnHomepage(tab)) {
                    return
                }

                if (this.isEmptyTab(tab)) {
                    this.goToHomepage(tab);
                    return;
                }

                this.createShortLink(tab);
            });

    };

    isOnHomepage(currentTab: chrome.tabs.Tab): boolean {
        if (!currentTab.url) {
            return false;
        }
        return currentTab.url.startsWith(this.webUi);
    }

    goToHomepage(currentTab: chrome.tabs.Tab) {
        chrome.tabs.update(currentTab.id!, {
            url: this.webUi
        });
    }

    createShortLink(currentTab: chrome.tabs.Tab) {
        let currentPageURL = currentTab.url;
        chrome
            .tabs
            .create({url: `${this.webUi}/?long_link=${currentPageURL}`});
    }

    isEmptyTab(tab: chrome.tabs.Tab): boolean {
        return tab.url == null;
    }
}

const webUi = 'https://short-d.com';
const apiBaseUrl = 'https://api.short-d.com/r/';

const ext = new ShortExt(apiBaseUrl, webUi);

ext.launch();
