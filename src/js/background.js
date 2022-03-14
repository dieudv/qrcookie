'use strict';

var api = chrome;
var version = api.runtime.getManifest().version;

function msg(msg_id) {
    let _text = api.i18n.getMessage(msg_id);
    if (msg_id.includes('__')) {
        return "https://" + atob(_text);
    } else {
        return _text;
    }
}

api.runtime.onInstalled.addListener(function (details) {
    let reason = details.reason.toLowerCase()
    switch (reason) {
        case "install":
            api.tabs.create({ url: "https://lzdev.org/" });
            break;
        case "update":
            let ic = api.extension.getURL("ic/ic128.png");
            api.notifications.create((new Date).getTime().toString(), {
                type: "basic",
                iconUrl: ic,
                title: api.i18n.getMessage("appName"),
                message: "Updated new version " + version,
            });
            break;
    }
});