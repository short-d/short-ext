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
        // Call the Event Listener Function bind onclick
        this.redirectToBaseURI(webUi);
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

    // Function to handle extension clicks
    // Required: browser_action clause in manifest.json to tell the browser that we will need it's events.
    redirectToBaseURI = (base_uri: String) => {
        // Event Listener
        chrome.browserAction.onClicked.addListener(function(tab) 
            { 
                // Check if the current tab has some url/event should not be triggered on empty tabs
                if(tab.hasOwnProperty("url")){
                    url = tab.url;
                    chrome
                    .tabs
                    .create({ url: `${base_uri}/?long_link=${url}` }, () => {});
                }
            });
    }
}

const webUi = 'https://s.time4hacks.com';
const apiBaseUrl = `${webUi}/r/`;

const ext = new ShortExt(apiBaseUrl, webUi);

ext.launch();
