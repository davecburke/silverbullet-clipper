# SilverBullet Clipper - A web clipper for SilverBullet

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/davecburke/silverbullet-clipper?style=for-the-badge&sort=semver)](https://github.com/davecburke/silverbullet-clipper/releases/latest)

[SilverBullet](https://silverbullet.md/) by Zef Hemel is an awesome note-taking application optimized for people with a hacker mindset

SilverBullet Clipper is a browser extension that allows you to save either a URL or selected content from a page as markdown to SilverBullet. The capture is added as a Quick Note in the default SilverBullet inbox. Please keep in mind that it is not guaranteed to work on all websites.

To use this add-on, simply click the extension icon while you are browsing the page you want to capture. A popup will allow you to change the page title from the default timestamp and add any tags that you want to the page.

# Installation
The extension is available for Google Chrome and Opera via the [Chrome Web Store](https://chromewebstore.google.com/detail/silverbullet-clipper/nkapoagmecfkneiaejccgkhffdmfmhki).

[![](https://img.shields.io/chrome-web-store/v/nkapoagmecfkneiaejccgkhffdmfmhki?style=for-the-badge&logo=googlechrome&logoColor=white&label=google%20chrome%20store&labelColor=grey)](https://chromewebstore.google.com/detail/silverbullet-clipper/nkapoagmecfkneiaejccgkhffdmfmhki)

## Instructions
1. Clone this repo.
2. Go to chrome://extensions/ **or** Setup -> Extensions -> Manage Extensions
3. At the top right, turn on Developer mode.
4. Click Load unpacked.
5. Navigate to the cloned repo and select the folder that has the manifest.json

# External Libraries
SilverBullet Clipper uses the following libraries:
- [PureCSS](https://github.com/mixmark-io/turndown) by Pure CSS. Version 3.0.0 is used to provide styling to the extension. (Licensed under Yahoo! Inc. BSD-3-Clause license)
- [Turndown](https://github.com/mixmark-io/turndown) by Dom Christie. Version 7.1.3 is used to convert the HTML into markdown. (Licensed under MIT License)

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