# Smart Auto Reaction Extension

## How does this extension work?

This extension runs in the background, check Facebook new feed once every 20 minutes and auto like, react to friend posts. So you need to log in to your Facebook account before running.

This extension was released on chrome [here](https://chrome.google.com/webstore/detail/pgekffacnedgnmiichadeamgklbabmgk).

## How to build this extension

### Required

* [Python3](https://python.org)

### Setup

```bash
python3 -m pip install -r requirements.txt
```

### Build

Open cmd on Window and run this command.

```bash
cd ./path
build.bat
```
or

```bash
cd ./path
python3 build.py
```

## Third-party libraries

* [webextension-polyfill](https://unpkg.com/browse/webextension-polyfill@0.7.0/dist/browser-polyfill.min.js)