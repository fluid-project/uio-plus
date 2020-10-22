/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/fluid-project/uio-plus/blob/main/AUTHORS.md
 *
 * Licensed under the BSD 3-Clause License. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/fluid-project/uio-plus/blob/main/LICENSE.txt
 */

/* eslint-env node */
/* global require */

"use strict";

var fluid = fluid || require("infusion");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");
var jqUnit = jqUnit || fluid.require("node-jqunit", require, "jqUnit");
var uioPlus = fluid.registerNamespace("uioPlus");

require("../../src/js/background/chromeEvented.js");
require("../../src/js/background/zoom.js");

fluid.defaults("uioPlus.chrome.tests.zoom.testEnvironment", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        tester: {
            type: "uioPlus.chrome.tests.zoom.tester"
        }
    }
});

fluid.defaults("uioPlus.chrome.tests.zoom.tester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    model: {},
    tabs: [{ id: 1 },
           { id: 2 },
           { id: 3 }],
    openedTab: { id: 4 },
    updatedTab: { id: 5 },
    settings: {
        magnifierEnabled: true,
        magnification: 4
    },
    newZoomLevel: {
        magnification: 2,
        magnifierEnabled: true
    },
    browserZoom: {
        newZoomFactor: 2.5,
        oldZoomFactor: 0
    },
    newTabZoom: {
        newZoomFactor: 0,
        oldZoomFactor: 0
    },
    disableZoom: {
        magnifierEnabled: false
    },
    invokers: {
        mockChrome: {
            funcName: "uioPlus.chrome.tests.zoom.mockChrome",
            args: "{that}"
        }
    },
    components: {
        zoom: {
            type: "uioPlus.chrome.zoom"
        }
    },
    events: {
        onSetZoom: null
    },
    modules: [{
        name: "zoom tests",
        tests: [{
            name: "All tabs are configured when settings change",
            expect: 6,
            sequence: [{
                funcName: "uioPlus.chrome.tests.zoom.setSettings",
                args: ["{that}", "{that}.options.settings"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.0.id",
                       "{that}.options.settings.magnification"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.1.id",
                       "{that}.options.settings.magnification"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.2.id",
                       "{that}.options.settings.magnification"]
            }]
        }, {
            name: "When new tab is created, the zoom is set",
            expect: 2,
            sequence: [{
                func: "{zoom}.events.onTabOpened.fire",
                args: "{that}.options.openedTab"
            },{
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.openedTab.id",
                       "{that}.options.settings.magnification"]
            }]
        }, {
            name: "When new tab is opened, the zoom is set",
            expect: 2,
            sequence: [{
                func: "{zoom}.events.onTabUpdated.fire",
                args: ["{that}.options.updatedTab", null,
                       "{that}.options.updatedTab"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.updatedTab.id",
                       "{that}.options.settings.magnification"]
            }]
        }, {
            name: "When changing tabs, the zoom is set",
            expect: 2,
            sequence: [{
                func: "{zoom}.events.onTabActivated.fire",
                args: "{that}.options.updatedTab"
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.updatedTab.id",
                       "{that}.options.settings.magnification"]
            }]
        }, {
            name: "magnification changes, tabs are updated",
            expect: 6,
            sequence: [{
                funcName: "uioPlus.chrome.tests.zoom.setSettings",
                args: ["{that}", "{that}.options.newZoomLevel"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.0.id",
                       "{that}.options.newZoomLevel.magnification"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.1.id",
                       "{that}.options.newZoomLevel.magnification"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.2.id",
                       "{that}.options.newZoomLevel.magnification"]
            }]
        }, {
            name: "magnification changed through browser",
            expect: 2,
            sequence: [{
                funcName: "{zoom}.events.onZoomChanged.fire",
                args: ["{that}.options.browserZoom"]
            }, {
                listener: "jqUnit.assertEquals",
                args: [
                    "The magnification model value should have updated",
                    "{that}.options.browserZoom.newZoomFactor",
                    "{zoom}.model.magnification"
                ],
                spec: {path: "magnification", priority: "last"},
                changeEvent: "{zoom}.applier.modelChanged"
            }, {
                funcName: "{zoom}.events.onZoomChanged.fire",
                args: ["{that}.options.newTabZoom"]
            }, {
                funcName: "jqUnit.assertEquals",
                args: [
                    "The magnification model value should not have updated",
                    "{that}.options.browserZoom.newZoomFactor",
                    "{zoom}.model.magnification"
                ]
            }]
        }, {
            name: "magnification disabled, tabs are updated",
            expect: 6,
            sequence: [{
                funcName: "uioPlus.chrome.tests.zoom.setSettings",
                args: ["{that}", "{that}.options.disableZoom"]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.0.id",
                       1]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.1.id",
                       1]
            }, {
                event: "{that}.events.onSetZoom",
                listener: "uioPlus.chrome.tests.zoom.checkSetZoom",
                args: ["{arguments}.0", "{arguments}.1",
                       "{that}.options.tabs.2.id",
                       1]
            }]
        }]
    }],
    listeners: {
        "onCreate.mockChrome": "{that}.mockChrome",
        "afterDestroy": "uioPlus.chrome.tests.zoom.clearTestEnv"
    }
});

uioPlus.chrome.tests.zoom.clearTestEnv = function () {
    chrome.tabs.setZoom.resetBehavior;
    chrome.tabs.getZoom.resetBehavior;
    chrome.tabs.query.resetBehavior;
};

uioPlus.chrome.tests.zoom.checkSetZoom = function (id, level, expectedId, expectedLevel) {
    jqUnit.assertEquals("setZoom receives the expected tab id", expectedId, id);
    jqUnit.assertEquals("setZoom receives the expected zoom level", expectedLevel, level);
};

uioPlus.chrome.tests.zoom.setSettings = function (that, settings) {
    that.zoom.applier.change("", settings);
};

uioPlus.chrome.tests.zoom.mockChrome = function (that) {
    chrome.tabs.getZoom.yields(1.1);
    chrome.tabs.query.yields(that.options.tabs);
    chrome.tabs.setZoom.func = function (tabId, zoomLevel) {
        that.events.onSetZoom.fire(tabId, zoomLevel);
    };
};

fluid.test.runTests("uioPlus.chrome.tests.zoom.testEnvironment");
