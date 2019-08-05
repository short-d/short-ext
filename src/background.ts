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
    constructor(private apiBaseUrl: string) {}

    redirect = (details: Details): BlockingResponse => {
        let shortLink = details.url;

        if (isFromAddressBar(shortLink)) {
            shortLink = extractQuery(shortLink);
        }

        let alias = extractAlias(shortLink);

        return {
            redirectUrl: `${this.apiBaseUrl}${alias}`
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

const ext = new ShortExt('http://localhost/r/');
ext.launch();