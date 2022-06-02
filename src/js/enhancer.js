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

/* global chrome, uioPlus */

"use strict";

fluid.registerNamespace("uioPlus.contentScript");

uioPlus.contentScript.requestInjection = function (src) {
    return chrome.runtime.sendMessage({
        type: "uioPlus.requestContentScriptInjection",
        src: fluid.makeArray(src)
    });
};

let uio = fluid.uiOptions("body", {
    buildType: "enhancer",
    preferences: [
        "fluid.prefs.letterSpace",
        "fluid.prefs.wordSpace",
        "fluid.prefs.lineSpace",
        "fluid.prefs.syllabification",
        "fluid.prefs.contrast",
        "uioPlus.prefs.clickToSelect",
        "uioPlus.prefs.highlight",
        "fluid.prefs.speak",
        "uioPlus.prefs.simplify",
        "fluid.prefs.tableOfContents",
        "fluid.prefs.enhanceInputs"
    ],
    storeType: "uioPlus.prefs.store",
    auxiliarySchema: {
        // Remove aliases and panels from schemas.
        "fluid.prefs.tableOfContents": {
            alias: null,
            enactor: {
                type: "uioPlus.enactor.tableOfContents",
                tocTemplate: chrome.runtime.getURL("lib/infusion/src/components/tableOfContents/html/TableOfContents.html"),
                tocMessage: chrome.runtime.getURL("lib/infusion/src/framework/preferences/messages/tableOfContents-enactor.json")
            }
        },
        "fluid.prefs.enhanceInputs": {
            alias: null
        },
        "fluid.prefs.speak": {
            alias: null,
            enactor: {
                type: "uioPlus.enactor.selfVoicing"
            }
        },
        "fluid.prefs.syllabification": {
            alias: null,
            enactor: {
                terms: {
                    patternPrefix: "lib/infusion/src/lib/hypher/patterns"
                },
                invokers: {
                    injectScript: "uioPlus.contentScript.requestInjection"
                }
            }
        },
        "fluid.prefs.letterSpace": {
            alias: null
        },
        "fluid.prefs.lineSpace": {
            alias: null
        },
        "fluid.prefs.wordSpace": {
            alias: null
        },
        "fluid.prefs.contrast": {
            alias: null
        },
        "uioPlus.prefs.simplify": {
            panel: null
        },
        "uioPlus.prefs.clickToSelect": {
            panel: null
        },
        "uioPlus.prefs.highlight": {
            panel: null
        }
    },
    primarySchema: {
        "fluid.prefs.lineSpace": {
            "maximum": 3
        },
        "fluid.prefs.wordSpace": {
            "maximum": 4
        }
    },
    enhancer: {
        gradeNames: ["{fluid.uiOptions}.options.componentGrades.initialModel"]
    }
});

// update model from store
chrome.storage.onChanged.addListener(
    (changes, areaName) => {
        if (changes.preferences && areaName === "local") {
            uio.enhancer.uiEnhancer.updateModel({...uio.enhancer.uiEnhancer.initialModel.preferences, ...changes.preferences.newValue});
        }
    }
);
