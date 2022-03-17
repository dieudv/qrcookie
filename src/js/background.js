var api = chrome;
var version = api.runtime.getManifest().version;

api.runtime.onInstalled.addListener(function (details) {
    let reason = details.reason.toLowerCase()
    switch (reason) {
        case "install":
            api.tabs.create({ url: "https://lzdev.org/" });
            break;
        case "update":
            let ic = api.runtime.getURL("ic/ic128.png");
            api.notifications.create((new Date).getTime().toString(), {
                type: "basic",
                iconUrl: ic,
                title: "QR Cookie",
                message: "Updated new version " + version,
            });
            break;
    }
});