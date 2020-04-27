/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/fluid-project/uio-plus/blob/master/AUTHORS.md
 *
 * Licensed under the BSD 3-Clause License. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/fluid-project/uio-plus/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global require */

"use strict";

var fluid = require("infusion");
var chrome = fluid.require("sinon-chrome"); // eslint-disable-line no-unused-vars
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var uioPlus = fluid.registerNamespace("uioPlus"); // eslint-disable-line no-unused-vars

require("./testUtils.js");
require("../../src/js/background/chromeEvented.js");

fluid.defaults("uioPlus.tests.chrome.eventedComponent", {
    gradeNames: ["uioPlus.chrome.eventedComponent"],
    events: {
        onTabOpened: null,
        onTabUpdated: null,
        onWindowFocusChanged: null
    },
    eventRelayMap: {
        "chrome.tabs.onCreated": "onTabOpened",
        "chrome.tabs.onUpdated": "onTabUpdated",
        "chrome.windows.onFocusChanged": "onWindowFocusChanged"
    }
});

fluid.defaults("uioPlus.tests.chromeEventedTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        chromeEvented: {
            type: "uioPlus.tests.chrome.eventedComponent",
            createOnEvent: "{chromeEventedTester}.events.onTestCaseStart"
        },
        chromeEventedTester: {
            type: "uioPlus.tests.chromeEventedTester"
        }
    }
});

fluid.defaults("uioPlus.tests.chromeEventedTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "UIO+ chromeEvented unit tests",
        tests: [{
            name: "interaction",
            expect: 9,
            sequence: [{
                event: "{chromeEventedTests chromeEvented}.events.onCreate",
                priority: "last:testing",
                listener: "uioPlus.tests.utils.assertEventRelayBound",
                args: ["{chromeEvented}", "{chromeEvented}.options.eventRelayMap"]
            }, {
                // Dispatch tabs onCreated event
                func: "uioPlus.tests.dispatchChromeEvent",
                args: [chrome.tabs.onCreated]
            }, {
                event: "{chromeEvented}.events.onTabOpened",
                listener: "jqUnit.assert",
                args: ["The onTabOpened event was fired"]
            }, {
                // Dispatch tabs onUpdated event
                func: "uioPlus.tests.dispatchChromeEvent",
                args: [chrome.tabs.onUpdated]
            }, {
                event: "{chromeEvented}.events.onTabUpdated",
                listener: "jqUnit.assert",
                args: ["The onTabUpdated event was fired"]
            }, {
                // Dispatch window onFocusChanged event
                func: "uioPlus.tests.dispatchChromeEvent",
                args: [chrome.windows.onFocusChanged]
            }, {
                event: "{chromeEvented}.events.onWindowFocusChanged",
                listener: "jqUnit.assert",
                args: ["The onWindowFocusChanged event was fired"]
            }, {
                func: "{chromeEvented}.destroy"
            }, {
                event: "{chromeEvented}.events.onDestroy",
                priority: "last:testing",
                listener: "uioPlus.tests.utils.assertEventRelayUnbound",
                args: ["{chromeEvented}", "{chromeEvented}.options.eventRelayMap"]
            }]
        }]
    }]
});

fluid.test.runTests([
    "uioPlus.tests.chromeEventedTests"
]);
