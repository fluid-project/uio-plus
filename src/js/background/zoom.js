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
/* global fluid, require */

"use strict";

var uioPlus = fluid.registerNamespace("uioPlus");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

/*
 * `uioPlus.chrome.zoom` sets the browser zoom. This can be used for enacting preferences such as magnification or
 * font size. The browser zoom updates tabs in the currently focused window, updated tabs, created tabs, and tabs in
 * other windows as they become focused.
 *
 * In addition to being able to set zoom from a preference set or editor, the zoom factor can be retrieved from the
 * onZoomChanged event. This allows for a user to set the zoom using the browsers built in mechanisms and propagate
 * that change to other tabs. See https://issues.gpii.net/browse/GPII-3386
 */

fluid.defaults("uioPlus.chrome.zoom", {
    gradeNames: ["fluid.modelComponent", "uioPlus.chrome.eventedComponent"],
    model: {
        magnifierEnabled: false,
        magnification: 1
    },
    events: {
        onError: null,
        onTabOpened: null,
        onTabUpdated: null,
        onTabActivated: null,
        onWindowFocusChanged: null,
        onZoomChanged: null
    },
    eventRelayMap: {
        "chrome.tabs.onCreated": "onTabOpened",
        "chrome.tabs.onUpdated": "onTabUpdated",
        "chrome.tabs.onActivated": "onTabActivated",
        "chrome.tabs.onZoomChange": "onZoomChanged",
        "chrome.windows.onFocusChanged": "onWindowFocusChanged"
    },
    invokers: {
        applyZoomSettings: {
            funcName: "uioPlus.chrome.zoom.applyZoomSettings",
            args: "{that}"
        },
        applyZoomInTab: {
            funcName: "uioPlus.chrome.zoom.applyZoomInTab",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        },
        updateTab: {
            funcName: "uioPlus.chrome.zoom.updateTab",
            args: ["{that}", "{arguments}.0"]
        }
    },
    modelListeners: {
        "zoom.modelChanged": {
            path: ["magnifierEnabled", "magnification"],
            funcName: "{that}.applyZoomSettings",
            excludeSource: ["onZoomChanged"]
        }
    },
    listeners: {
        "onTabOpened.applyZoom": "{that}.updateTab",
        "onTabUpdated.applyZoom": {
            funcName: "{that}.updateTab",
            args: "{arguments}.2"
        },
        "onTabActivated.applyZoom": "{that}.updateTab",
        "onWindowFocusChanged.applyZoomSettings": "{that}.applyZoomSettings",
        "onZoomChanged.updateMagnification": {
            funcName: "uioPlus.chrome.zoom.updateFromZoomChange",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

uioPlus.chrome.zoom.updateFromZoomChange = function (that, ZoomChangeInfo) {
    // Only fire the onZoomChanged event if the Zoom factor is actually different.
    // This is necessary because chrome will fire its onZoomChange event when a new tab or window is opened;
    // with old and new zoom factors of 0. If this check isn't present, all pages will be reset.
    if (ZoomChangeInfo.oldZoomFactor !== ZoomChangeInfo.newZoomFactor) {
        that.applier.change("magnification", ZoomChangeInfo.newZoomFactor, "ADD", "onZoomChanged");
    }
};

uioPlus.chrome.zoom.applyZoomInTab = function (that, tab, value) {
    // set the zoom value if it hasn't already been set.
    chrome.tabs.getZoom(tab.id, function (currentZoom) {
        if (currentZoom !== value) {
            chrome.tabs.setZoom(tab.id, value, function () {
                if (chrome.runtime.lastError) {
                    fluid.log("Could not apply zoom in tab'",
                              tab.url, "', error was: ",
                              chrome.runtime.lastError.message);
                    that.events.onError.fire(chrome.runtime.lastError);
                }
            });
        }
    });
};

uioPlus.chrome.zoom.applyZoomSettings = function (that) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
    // Iterate over all tabs in the current window and set the zoom factor
    // Only changing in the current window to address cases where changing the
    // zoom level in other windows causes it to gain focus. See: https://issues.gpii.net/browse/GPII-2525
    chrome.tabs.query({currentWindow: true}, function (tabs) {
        fluid.each(tabs, function (tab) {
            that.applyZoomInTab(tab, value);
        });
    });
};

uioPlus.chrome.zoom.updateTab = function (that, tab) {
    var value = that.model.magnifierEnabled ? that.model.magnification : 1;
    that.applyZoomInTab(tab, value);
};
