# UI Options Plus (UIO+)

![CI build status badge](https://github.com/fluid-project/uio-plus/workflows/CI/badge.svg)

User Interface Options Plus (UIO+) allows you to customize websites to match your own personal needs and preferences.
Settings for the adaptations can be set via the UIO+ adjuster panel.

The following adaptations are supported:

* Character Space
* Contrast
* Enhance Inputs
* Line Space
* Reading Mode
* Right-Click to Select
* Selection Highlight
* Syllables
* Table of Contents
* Text-to-Speech (only for selected text)
* Word Space
* Zoom

_**Note**: The ability to apply an adaptation will vary from page to page_

UI Options Plus is the result of a joint effort of the Inclusive Design Research Centre at OCAD University and the Trace
R&D Center at University of Maryland under funding for the FLOE Project from the William and Flora Hewlett Foundation
and the National Institute on Disability, Independent Living, and Rehabilitation Research (NIDILRR), Administration for
Community Living under grant #90RE5027.

[![Available in the Chrome Web Store](./chrome_web_store.png)](https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek)

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details about our contribution process.

## Building the extension

### Dependencies

Install required dependencies:

```bash
npm install
```

### Build

This will generate a `dist` directory at the root of the project. This is used when creating a published version, and
can also be run as an unpacked extension.

```bash
npm run build
```

## Testing

### Node

Run the node-based tests:

```bash
node tests/node/all-tests.js
```

### Browser

Run the browser-based tests:

[http://localhost/tests/browser/all-tests.html](http://localhost/tests/browser/all-tests.html)

_**NOTE:** Browser tests should be served through a web server. The exact URL may vary._

### All tests with reports

Run all the tests and generate reports which can be viewed in the browser from the "reports" directory:

```bash
# run on the host machine
npm test
```

## Trying UIO+ in the browser

Requirements:

* [Google Chrome browser](https://www.google.com/chrome/browser/desktop/)

Follow these steps if you want to use the unpacked version of the extension:

1. Visit [chrome://extensions](chrome://extension) in your Chrome browser.
2. Ensure that the _Developer mode_ toggle in the top right-hand corner is enabled.
3. Click _Load unpacked extension_ to open a file-selection dialog.
4. Navigate to the directory in which your local copy of the extension lives, and select the `dist` folder.

_**NOTE:** Published versions can be installed from the [Chrome Web Store](
    https://chrome.google.com/webstore/detail/ui-options-plus-uio%20/okenndailhmikjjfcnmolpaefecbpaek)._

## 3rd Party Software

### BSD 3-Clause

* [Infusion v4.6.0](https://fluidproject.org/infusion.html)

### MIT License

* [Font-Awesome-SVG-PNG v1.1.5](https://github.com/encharm/Font-Awesome-SVG-PNG)
