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

/* global chrome */

"use strict";

const uioPlus = {};

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

uioPlus.createMenuItems = async (menuItems, parentId, storage) => {
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

uioPlus.storePref = async (prefName, state) => {
    let {preferences = {}} = await chrome.storage.local.get("preferences");
    state ? preferences[prefName] = state : delete preferences[prefName];
    return chrome.storage.local.set({"preferences": preferences});
};

uioPlus.storeZoom = async (zoom) => {
    let {preferences = {}} = await chrome.storage.local.get("preferences");
    if ((preferences.uioPlus_prefs_zoom || 1) !== zoom) {
        preferences.uioPlus_prefs_zoom = zoom;
        return chrome.storage.local.set({"preferences": preferences});
    }
};

uioPlus.updateQuickPanelState = (changes) => {
    Object.keys(uioPlus.contextMenuItems.preferences.children).forEach(prefName => {
        if (changes.preferences.newValue?.[prefName] !== changes.preferences.oldValue?.[prefName]) {
            chrome.contextMenus.update(prefName, {
                checked: !!changes.preferences.newValue?.[prefName]
            });
        }
    });
};

uioPlus.applyZoom = async (zoom, tabId) => {
    zoom = zoom || 1;
    let currentZoom = await chrome.tabs.getZoom(tabId);

    if (currentZoom !== zoom) {
        chrome.tabs.setZoom(tabId, zoom);
    }
};

// Listeners

chrome.contextMenus.onClicked.addListener((onClickData) => {
    uioPlus.contextMenuHandlers[onClickData.menuItemId]?.(onClickData);
});

chrome.storage.onChanged.addListener(
    (changes, areaName) => {
        if (areaName === "local" && changes.preferences) {
            uioPlus.updateQuickPanelState(changes);

            uioPlus.applyZoom(changes.preferences.newValue?.uioPlus_prefs_zoom);
        }
    }
);

chrome.tabs.onActivated.addListener(
    async (activeInfo) => {
        let {preferences = {}} = await chrome.storage.local.get("preferences");
        uioPlus.applyZoom(preferences.uioPlus_prefs_zoom, activeInfo.tabId);
    }
);

chrome.tabs.onZoomChange.addListener(
    (zoomChangeInfo) => {
        // Only handle the onZoomChange event if the Zoom factor is actually different.
        // This is necessary because Chrome will fire its onZoomChange event when a new tab or window is opened;
        // with equivalent old and new zoom factors.
        if (zoomChangeInfo.newZoomFactor !== zoomChangeInfo.oldZoomFactor) {
            uioPlus.storeZoom(zoomChangeInfo.newZoomFactor);
        }
    }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let result = uioPlus.messageHandlers[message.type]?.(message, sender);
    result.then(sendResponse);
    return true;
});

// Quick Panel Init
uioPlus.createMenuItems(uioPlus.contextMenuItems);
