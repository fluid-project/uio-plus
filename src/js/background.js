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

"use strict";

const uioPlus = {};
var chrome = chrome || require("sinon-chrome");

// Quick Panel Config

uioPlus.contextMenuItems = {
    preferences: {
        title: "Preferences Quick Panel",
        children: {
            fluid_prefs_syllabification: {
                title: "Syllables",
                type: "checkbox"
            },
            uioPlus_prefs_clickToSelect: {
                title: "Right-Click to Select",
                type: "checkbox"
            },
            fluid_prefs_speak: {
                title: "Text-to-Speech",
                type: "checkbox"
            },
            uioPlus_prefs_simplify: {
                title: "Reading Mode",
                type: "checkbox"
            },
            fluid_prefs_tableOfContents: {
                title: "Table of Contents",
                type: "checkbox"
            },
            fluid_prefs_enhanceInputs: {
                title: "Enhance Inputs",
                type: "checkbox"
            }
        }
    },
    reset: {
        title: "Reset"
    }
};

// Handler Config

uioPlus.contextMenuHandlers = {
    reset: () => chrome.storage.local.clear(),
    fluid_prefs_syllabification: (onClickData) => {
        uioPlus.storePref("fluid_prefs_syllabification", onClickData.checked);
    },
    uioPlus_prefs_clickToSelect: (onClickData) => {
        uioPlus.storePref("uioPlus_prefs_clickToSelect", onClickData.checked);
    },
    fluid_prefs_speak: (onClickData) => {
        uioPlus.storePref("fluid_prefs_speak", onClickData.checked);
    },
    uioPlus_prefs_simplify: (onClickData) => {
        uioPlus.storePref("uioPlus_prefs_simplify", onClickData.checked);
    },
    fluid_prefs_tableOfContents: (onClickData) => {
        uioPlus.storePref("fluid_prefs_tableOfContents", onClickData.checked);
    },
    fluid_prefs_enhanceInputs: (onClickData) => {
        uioPlus.storePref("fluid_prefs_enhanceInputs", onClickData.checked);
    }
};

uioPlus.messageHandlers = {
    "uioPlus.requestContentScriptInjection": (message, sender) => {
        return chrome.scripting.executeScript({
            target: {
                tabId: sender.tab?.id,
                allFrames: true
            },
            files: message.src
        });
    }
};

// Functions

/**
 * A recursive function for creating checkbox menu items.
 *
 * @param {Object} menuItems - menu items structure. See `uioPlus.contextMenuItems` for an example.
 * @param  {Number} parentId - the parent menu item id.
 * @param  {Object} storage - the currently saved preferences.
 */
uioPlus.createMenuItems = async (menuItems, parentId, storage) => {
    if (!menuItems) {
        return undefined;
    }

    storage ??= await chrome.storage.local.get("preferences");

    Object.entries(menuItems).forEach(([id, props]) => {
        chrome.contextMenus.create({
            id: id,
            title: props.title,
            type: props.type || "normal",
            parentId: parentId,
            contexts: ["action"],
            checked: storage?.preferences?.[id] || false
        });

        if (props.children) {
            uioPlus.createMenuItems(props.children, id, storage);
        }
    });
};

/**
 * Update checkbox states based on values updated into the local storage.
 *
 * @param {Object} menuItems - menu items structure. See `uioPlus.contextMenuItems` for an example.
 * @param {Object} changes - the changed preferences.
 */
uioPlus.updateQuickPanelState = (menuItems, changes) => {
    Object.keys(menuItems.preferences.children).forEach(prefName => {
        if (changes.preferences.newValue?.[prefName] !== changes.preferences.oldValue?.[prefName]) {
            chrome.contextMenus.update(prefName, {
                checked: !!changes.preferences.newValue?.[prefName]
            });
        }
    });
};

/**
 * Save preferences whose values are boolean.
 * If the previously saved preference value is false, remove it from the saved preferences object. Otherwise, save it.
 *
 * @param {String} prefName - a preference name.
 * @param  {Boolean} state - the state of the given preference.
 * @return {Promise} - the result of saving the preference.
 */
uioPlus.storePref = async (prefName, state) => {
    let {preferences = {}} = await chrome.storage.local.get("preferences");
    state ? preferences[prefName] = state : delete preferences[prefName];
    return chrome.storage.local.set({"preferences": preferences});
};

/**
 * Save the zoom preference.
 *
 * @param {Number} zoom - the zoom value.
 * @return {Promise} - the result of saving the preference.
 */
uioPlus.storeZoom = async (zoom) => {
    if (!zoom) {
        return undefined;
    }

    let {preferences = {}} = await chrome.storage.local.get("preferences");
    if ((preferences.uioPlus_prefs_zoom || 1) !== zoom) {
        preferences.uioPlus_prefs_zoom = zoom;
        return chrome.storage.local.set({"preferences": preferences});
    }
};

/**
 * Apply zoom to a tab when the zoom value is changed.
 *
 * @param {Number} zoom - the zoom value.
 * @param {Number} tabId - the tab id.
 * @return {Promise} - the result of the applying action.
 */
uioPlus.applyZoom = async (zoom, tabId) => {
    zoom = zoom || 1;
    let currentZoom = await chrome.tabs.getZoom(tabId);
    if (currentZoom !== zoom) {
        return chrome.tabs.setZoom(tabId, zoom);
    }
};

// Listeners

chrome.contextMenus.onClicked.addListener(async (onClickData) => {
    uioPlus.contextMenuHandlers[onClickData.menuItemId]?.(onClickData);
});

chrome.storage.onChanged.addListener(
    async (changes, areaName) => {
        if (areaName === "local" && changes.preferences) {
            uioPlus.updateQuickPanelState(uioPlus.contextMenuItems, changes);

            uioPlus.applyZoom(changes.preferences.newValue?.uioPlus_prefs_zoom);
        }
    }
);

chrome.tabs.onActivated.addListener(
    async (activeInfo) => {
        let {preferences = {}} = await chrome.storage.local.get("preferences");
        if (preferences.uioPlus_prefs_zoom) {
            uioPlus.applyZoom(preferences.uioPlus_prefs_zoom, activeInfo.tabId);
        }
    }
);

chrome.tabs.onZoomChange.addListener(
    async (zoomChangeInfo) => {
        // Only handle the onZoomChange event if the Zoom factor is actually different.
        // This is necessary because Chrome will fire its onZoomChange event when a new tab or window is opened;
        // with equivalent old and new zoom factors.
        if (zoomChangeInfo.newZoomFactor !== zoomChangeInfo.oldZoomFactor) {
            uioPlus.storeZoom(zoomChangeInfo.newZoomFactor);
        }
    }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (uioPlus.messageHandlers[message.type]) {
        let result = uioPlus.messageHandlers[message.type](message, sender);
        result.then(sendResponse);
    }
    return true;
});

// Quick Panel Init
let menu;
// Create the menu only once
if (!menu) {
    menu = uioPlus.createMenuItems(uioPlus.contextMenuItems);
}

// For node.js tests only
if (typeof exports !== "undefined") {
    exports.createMenuItems = uioPlus.createMenuItems;
    exports.storePref = uioPlus.storePref;
    exports.storeZoom = uioPlus.storeZoom;
    exports.applyZoom = uioPlus.applyZoom;
    exports.updateQuickPanelState = uioPlus.updateQuickPanelState;
}
