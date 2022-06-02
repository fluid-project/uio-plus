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

// Due to FLUID-6735, the panelIndex model configuration cannot be passed in directly and is
// added via grade merging instead.
// see: https://issues.fluidproject.org/browse/FLUID-6735
fluid.defaults("uioPlus.prefsEditor.panelIndex", {
    model: {
        local: {
            panelIndex: "{that}.model.panelIndex"
        }
    },
    modelListeners: {
        "panelIndex": [{
            listener: "{that}.save",
            namespace: "autoSavePanelIndex",
            excludeSource: ["init"]
        }]
    }
});

fluid.uiOptions(".uioPlus", {
    preferences: [
        "uioPlus.prefs.zoom",
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
        loaderGrades: ["fluid.prefs.fullNoPreview"],
        terms: {
            // adjust paths
            templatePrefix: "../lib/infusion/src/framework/preferences/html",
            messagePrefix: "../lib/infusion/src/framework/preferences/messages",
            localTemplatePrefix: "../templates",
            localMessagePrefix: "../messages"
        },
        // Remove aliases and enactors from schemas. UIO+ does not apply settings to the adjusters themselves.
        // In the future if we wish to support that, the overrides will need to be removed.
        "fluid.prefs.tableOfContents": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.enhanceInputs": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.speak": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.syllabification": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.letterSpace": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.lineSpace": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.wordSpace": {
            alias: null,
            enactor: null
        },
        "fluid.prefs.contrast": {
            alias: null,
            enactor: null
        },
        "uioPlus.prefs.clickToSelect": {
            enactor: null
        },
        "uioPlus.prefs.highlight": {
            enactor: null
        },
        "uioPlus.prefs.simplify": {
            enactor: null
        },
        "uioPlus.prefs.zoom": {
            enactor: null
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
    prefsEditor: {
        gradeNames: ["fluid.prefs.arrowScrolling", "uioPlus.prefsEditor.panelIndex"],
        autoSave: true
    }
});
