# SilverBullet Clipper - A web clipper for SilverBullet

[![GitHub Release](https://img.shields.io/github/v/release/davecburke/silverbullet-clipper?style=for-the-badge)](https://github.com/davecburke/silverbullet-clipper/releases/latest)

[SilverBullet](https://silverbullet.md/) by Zef Hemel is an awesome note-taking application optimized for people with a hacker mindset

SilverBullet Clipper is a browser extension that allows you to save either a URL or selected content from a page as markdown to SilverBullet. The capture is added as a Quick Note in the default SilverBullet inbox. Please keep in mind that it is not guaranteed to work on all websites.

To use this add-on, simply click the extension icon while you are browsing the page you want to capture. A popup will allow you to change the page title from the default timestamp and add any tags that you want to the page.

# Installation
The extension is available for Google Chrome and Opera via the [Chrome Web Store](https://chromewebstore.google.com/detail/silverbullet-clipper/nkapoagmecfkneiaejccgkhffdmfmhki). The Firefox extension can be added from [Firefox Browser Add-Ons](https://addons.mozilla.org/addon/silverbullet-clipper/) 

[![](https://img.shields.io/chrome-web-store/v/nkapoagmecfkneiaejccgkhffdmfmhki?style=for-the-badge&logo=googlechrome&logoColor=white&label=google%20chrome%20store&labelColor=grey)](https://chromewebstore.google.com/detail/silverbullet-clipper/nkapoagmecfkneiaejccgkhffdmfmhki)

[![Mozilla Add-on Version](https://img.shields.io/amo/v/silverbullet-clipper?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/addon/silverbullet-clipper/)

## Instructions to Build the Extensions with Grunt
The extension are already built and can be found in the dist/chrome and dist/firefox folders. If you want to rebuild them the follow these instuctions:

* Prerequisite: [Node.js](https://nodejs.org/)
1. Install [Grunt](https://gruntjs.com/) via NPM
```bash
npm install -g grunt-cli
npm install grunt --save-dev
```
2. Install the Grunt dependencies
```bash
npm install
```
3a. Build the Chrome extension. The files are built to the dist/chrome folder
```bash
grunt build:chrome
```
3b. Build the Firefox extension. The files are built to the dist/firefox folder
```bash
grunt build:firefox
```

## Instructions to Test Extensions
1. Clone this repo.
### Chrome
The Chrome extension can be found in the dist/chrome folder
1. In Chrome, enter chrome://extensions/ in the URL bar **or** navigate to Setup -> Extensions -> Manage Extensions
2. At the top right, turn on Developer mode.
3. Click Load unpacked.
4. Navigate to the cloned repo and select the folder that has the manifest.json

### Firefox
The Firefox extension can be found in the dist/firefox folder
1. In firefox, enter about:debugging in the URL bar
2. Select This Firefox
3. Select Load Temporary Add-on...

# External Libraries
SilverBullet Clipper uses the following libraries:
- [PureCSS](https://github.com/mixmark-io/turndown) by Pure CSS. Version 3.0.0 is used to provide styling to the extension. (Licensed under Yahoo! Inc. BSD-3-Clause license)
- [Turndown](https://github.com/mixmark-io/turndown) by Dom Christie. Version 7.1.3 is used to convert the HTML into markdown. (Licensed under MIT License)
- [Shields.io](https://shields.io/) by Badges. Provides the version badges for git, chrome and firefox on this page

# Permissions
- Access tabs: used to access the website content when the icon in the browser bar is clicked.
- Offscreen: used to open a hidden document where the captured HTML can be processed.
- Scripting: used to access the chrome scripting API that captures the web page content selected.
- Storage: used to save extension options.

# Version History
## 0.1.0
- Beta development
## 0.2.0
- Added support for light and dark theme preferences
## 0.3.0
- Added a user friendly error if the send to SilverBullet fails
- Fixed a missing style on the legend element needed for dark mode
- Added firefox version
## 0.3.1
- Changed link to new SilverBullet page from encodeURIComponent() to encodeURI() to make the link consistent with how SilverBullet formats links.
- Removed '.md' from the link to the new SilverBullet page as it's redundant
- Fixed missing image when looking at the extension in My Extensions
- Sanatized HTML for enhanced security
