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

class ShortExt {
    constructor(private apiBaseUrl: string, private webUi: string) {
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

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
function(text) {
    // Encode user input for special characters , / ? : @ & = + $ #
    var newURL = 'https://s.time4hacks.com/r/' + encodeURIComponent(text);
    chrome.tabs.create({ url: newURL });
});


const ext = new ShortExt(apiBaseUrl, webUi);
ext.launch();
