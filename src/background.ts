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

class ShortExt {
    constructor(private apiBaseUrl: string, private webUi: string) {
        this.setupOmnibox();
        this.onIconClick(webUi);
    }

    fullURL = (alias: string) => {
        // Escape user input for special characters , / ? : @ & = + $ #
        let escapedAlias = encodeURIComponent(alias);
        return `${this.apiBaseUrl}${escapedAlias}`;
    }

    setupOmnibox = () => {
        chrome
            .omnibox
            .onInputEntered
            .addListener((alias: string)  =>  {
                let url = this.fullURL(alias);
                openTab(url);
            });
    }

    isEmptyTab(tab: chrome.tabs.Tab) {
        return !tab.hasOwnProperty("url");
    }

    onIconClick = (webUi: string) => {
        chrome.browserAction.onClicked.addListener(tab => {
            if(this.isEmptyTab(tab)) {
               return;
            }
            if(tab.url!.includes("https://s.time4hacks.com")) {
                return;
            }
            chrome.tabs.create({url: `${webUi}/?long_link=${tab.url}`});
        });
    }

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
}

const webUi = 'https://s.time4hacks.com';
const apiBaseUrl = `${webUi}/r/`;

const ext = new ShortExt(apiBaseUrl, webUi);

ext.launch();
