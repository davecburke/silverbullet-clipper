# Silverbullet Clipper - A web clipper for Silverbullet

<!-- [![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/deathau/markdownload?style=for-the-badge&sort=semver)](https://github.com/deathau/markdownload/releases/latest) -->

[Silverbullet](https://silverbullet.md/) by Zef Hemel is an awesome note-taking application optimized for people with a hacker mindset

Silverbullet Clipper is a browser extension that allows you to save either a URL or selected content from a page as markdown to Silverbullet. The capture is added as a Quick Note in the default Silverbullet inbox. Please keep in mind that it is not guaranteed to work on all websites.

To use this add-on, simply click the extension icon while you are browsing the page you want to capture. A popup will allow you to change the page title from the default timestamp and add any tags that you want to the page.

# Installation
The extension is available for Google Chrome and Opera.

As the extension is under development, it can only be added to a browser with extensions in developer mode

## Instructions
1. Clone this repo.
2. Go to chrome://extensions/ **or** Setup -> Extensions -> Manage Extensions
3. At the top right, turn on Developer mode.
4. Click Load unpacked.
5. Navigate to the cloned repo and select the folder that has the manifest.json
<!--
 [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/markdownload/), [Google Chrome](https://chrome.google.com/webstore/detail/markdownload-markdown-web/pcmpcfapbekmbjjkdalcgopdkipoggdi), [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/hajanaajapkhaabfcofdjgjnlgkdkknm) and [Safari](https://apple.co/3tcU0pD).

[![](https://img.shields.io/chrome-web-store/v/pcmpcfapbekmbjjkdalcgopdkipoggdi.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/markdownload-markdown-web/pcmpcfapbekmbjjkdalcgopdkipoggdi) [![](https://img.shields.io/chrome-web-store/rating/pcmpcfapbekmbjjkdalcgopdkipoggdi.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/markdownload-markdown-web/pcmpcfapbekmbjjkdalcgopdkipoggdi) [![](https://img.shields.io/chrome-web-store/users/pcmpcfapbekmbjjkdalcgopdkipoggdi.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/markdownload-markdown-web/pcmpcfapbekmbjjkdalcgopdkipoggdi)

[![](https://img.shields.io/amo/v/markdownload.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/markdownload/) [![](https://img.shields.io/amo/rating/markdownload.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/markdownload/) [![](https://img.shields.io/amo/users/markdownload.svg?logo=firefox&style=flat)](https://addons.mozilla.org/en-US/firefox/addon/markdownload/)

[![](https://img.shields.io/badge/dynamic/json?label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fhajanaajapkhaabfcofdjgjnlgkdkknm&style=flat&logo=microsoft-edge)](https://microsoftedge.microsoft.com/addons/detail/hajanaajapkhaabfcofdjgjnlgkdkknm) [![](https://img.shields.io/badge/dynamic/json?label=rating&suffix=/5&query=%24.averageRating&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fhajanaajapkhaabfcofdjgjnlgkdkknm&style=flat&logo=microsoft-edge)](https://microsoftedge.microsoft.com/addons/detail/hajanaajapkhaabfcofdjgjnlgkdkknm)

[![iTunes App Store](https://img.shields.io/itunes/v/1554029832?label=Safari&logo=safari&style=flat)](https://apple.co/3tcU0pD)

# Obsidian Integration

For integration with obsidian, you need to install and enable community plugins named "Advanced Obsidian URI". This plugin help us to bypass character limitation in URL. Because it's using clipboard as the source for creating new file.
More information about Advanced Obsidian URI plugin:  https://vinzent03.github.io/obsidian-advanced-uri/

You need to do some configurations in order to use this integration.
<details>
  <summary>Steps to follow</summary>
  
  1. Left-Click on the extension
  2. Click on the gear icon to open the configuration menu  
  3. Scroll down to "Obsidian integration" section and turn "enable obsidian integration" on.
  4. Fill out the form below (Obsidian vault name and Obsidian folder name.)
  5. Right-click on the extension and open the menu
  6. In "MarkDownload - Markdown Web Clipper", select "Send Tab to Obsidian"

</details>

-->

# External Libraries
Silverbullet Clipper uses the following libraries:
<!-- - [Readability.js](https://github.com/mozilla/readability) by Mozilla in version from commit [1fde3ac626bc4c2e5e54daa57c57d48b7ed9c574](https://github.com/mozilla/readability/commit/1fde3ac626bc4c2e5e54daa57c57d48b7ed9c574). This library is also used for the Firefox Reader View and it simplifies the page so that only the important parts are clipped. (Licensed under Apache License Version 2.0) -->
- [PureCSS](https://github.com/mixmark-io/turndown) by Pure CSS. Version 3.0.0 is used to provide styling to the extension. (Licensed under Yahoo! Inc. BSD-3-Clause license)
- [Turndown](https://github.com/mixmark-io/turndown) by Dom Christie. Version 7.1.3 is used to convert the HTML into markdown. (Licensed under MIT License)
<!-- - [Moment.js](https://momentjs.com) version 2.29.4 used to format dates in template variables -->

# Permissions
- Access tabs: used to access the website content when the icon in the browser bar is clicked.
- Offscreen: used to open a hidden document where the captured HTML can be processed.
- Scripting: used to access the chrome scripting API that captures the web page content selected.
- Storage: used to save extension options.

# Version History
## 0.1.0
- Beta development
<!--Remove hidden content before exporting (thanks @nhaouari !). This allows you to use a different extension (e.g. Adblock) to hide elements that would otherwise clutter up your export
- Fixes for Obsidian integration in Safari (thanks @aancw !)
- Keep a few more HTML tags that have no markdown equivalent (`u`, `ins`, `del`, `small`, `big`) (thanks @mnaoumov !)
- Add support for KaTeX formulas parsing (thanks @mnaoumov !)
- Fixed saving for options when imported from file (and show a little 'saved' indicator)
- Added a toggle for downloading images in the context menu and popup
- Added a link to the options in the popup
- Added some basic error handling to the popup
- Changes to how html inside code blocks is handled (thanks @mnaumov !)
- Treat codehilite without specified language as plaintext (thanks @mnaoumov !)
- Ensure sequential line breaks in `<pre>` are preserved in code blocks (thanks @mnaumov !)
- Update user guide link in README to point to GitHub
- Added keyboard shortcuts to copy selection / current tab to obsidian (user-definable in browsers that support that) (thanks @legolasdimir and @likeablob !)
- Select multiple tabs (hold crtl/cmd) then copy all tab urls as a markdown link list via keyboard shortcut or context menu (thanks @romanPrignon !)
- Allow users to include custom text such like `{date:YYYY-MM-DD}/`` in their Obsidian Folder Name setting (thanks @likeablob !)
- Fixed a small typo in the user guide (thanks @devon-research !)
- Fix for missing headings on sites like Substack (thanks @eactisgrosso !)
- Add support for websites using MathJax 3 (thanks @LeLocTai !)
- Moved previous version history into [CHANGELOG.md](./CHANGELOG.md)

> Previous version history is recorded in [CHANGELOG.md](./CHANGELOG.md)-->
