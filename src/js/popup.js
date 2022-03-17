import '../style.css';

var QRCode = require('qrcode')

var api = chrome;
var version = api.runtime.getManifest().version;
var isQRShowing = true;

function msg(msg_id) {
    let _text = api.i18n.getMessage(msg_id);
    if (msg_id.includes('__')) {
        return 'https://' + atob(_text);
    } else {
        return _text;
    }
}

function localizeHtmlPage() {
    let tag = document.getElementsByTagName('html')[0];
    let html = tag.innerHTML.toString();
    tag.innerHTML = html.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? msg(v1) : '';
    });
}

localizeHtmlPage();
document.getElementById('version').textContent = 'v' + version;
api.storage.local.get(['format'], function (data) {
    if (data.format) document.getElementById('ccformat').textContent = data.format;
});

function tabClick(id, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(cityName).style.display = 'block';
    document.getElementById(id).classList.add('active');
}

tabClick('tabQr', 'qrcontent')

document.getElementById('tabQr').addEventListener('click', function () {
    tabClick('tabQr', 'qrcontent')
});

document.getElementById('tabFormat').addEventListener('click', function () {
    tabClick('tabFormat', 'format')
});

document.getElementById('btn-switch-view').addEventListener('click', function () {
    showQRText();
});

let txtFormat = document.getElementById("ccformat");
txtFormat.addEventListener('change', saveFormat);

function saveFormat() {
    api.storage.local.set({
        format: txtFormat.value
    });
}

let btns = document.getElementsByClassName('btn-sm');
for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function () {
        document.getElementById('ccformat').value += btns[i].textContent;
        saveFormat();
    });
}

function cookieinfo() {
    chrome.tabs.query({ "status": "complete", "windowId": chrome.windows.WINDOW_ID_CURRENT, "active": true }, function (tab) {

        if (tab[0] == undefined) return;

        chrome.cookies.getAll({ "url": tab[0].url }, function (cookie) {
            let allCookieInfo = "";
            let domain = "";
            for (let i = 0; i < cookie.length; i++) {
                domain = cookie[i].domain;
                if (domain.indexOf("facebook.com") > -1) {
                    if (cookie[i].name == "c_user" || cookie[i].name == "xs") {
                        if (allCookieInfo.length > 0) allCookieInfo += ";";
                        allCookieInfo += cookie[i].name + "=" + decodeURIComponent(cookie[i].value);
                    }
                } else {
                    if (allCookieInfo.length > 0) allCookieInfo += ";";
                    allCookieInfo += cookie[i].name + "=" + cookie[i].value;
                }
            }

            let qrcontent = document.getElementById('ccformat').textContent;
            qrcontent = qrcontent.replaceAll('{cookie}', allCookieInfo);
            qrcontent = qrcontent.replaceAll('{user-agent}', navigator.userAgent);
            qrcontent = qrcontent.replaceAll('{domain}', domain);

            const opts = {
                type: 'image/jpeg',
                width: 256,
            }

            QRCode.toDataURL(qrcontent, opts, function (err, url) {
                if (err) throw err
                let img = document.getElementById('qrcode')
                img.src = url
            })

            document.getElementById('qrtext').textContent = qrcontent;
        });
    });
}

function showQRText() {
    if (isQRShowing) {
        document.getElementById("qrtext-div").style.display = "block";
        document.getElementById("qrcode").style.display = "none";
        document.getElementById("btn-switch-view").textContent = "View QR Code"
        isQRShowing = false;
    } else {
        document.getElementById("qrtext-div").style.display = "none";
        document.getElementById("qrcode").style.display = "block";
        document.getElementById("btn-switch-view").textContent = "View text"
        isQRShowing = true;
    }
}

cookieinfo();