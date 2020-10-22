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
/* global fluid */

"use strict";

fluid.defaults("uioPlus.chrome.settings", {
    gradeNames: ["fluid.modelComponent", "uioPlus.chrome.eventedComponent"],
    defaultSettings: {
        // not all of the following settings are in the common terms yet.
        // and may need to be updated once they are added there.
        characterSpace: 1, // from characterSpace
        clickToSelectEnabled: false,
        contrastTheme: "default", // from highContrastEnabled and highContrastTheme
        fontSize: 1, // from fontSize
        inputsLargerEnabled: false, // from inputsLargerEnabled
        lineSpace: 1, // from lineSpace
        selectionTheme: "default", // from highlightColor
        selfVoicingEnabled: false, // from selfVoicingEnabled
        simplifiedUiEnabled: false, // from simplifiedUiEnabled
        syllabificationEnabled: false, // from syllabificationEnabled
        tableOfContentsEnabled: false, // from tableOfContents,
        wordSpace: 1 // from wordSpace
    },
    model: {
        settings: "{settings}.options.defaultSettings"
    },
    components: {
        domSettingsApplier: {
            type: "uioPlus.chrome.domSettingsApplier",
            options: {
                model: "{settings}.model"
            }
        },
        zoom: {
            type: "uioPlus.chrome.zoom",
            options: {
                model: {
                    magnifierEnabled: true, // set to true because fontSize is always enabled
                    magnification: "{settings}.model.settings.fontSize"
                }
            }
        },
        contextMenuPanel: {
            type: "uioPlus.chrome.settingsContextPanel",
            options: {
                model: "{settings}.model",
                distributeOptions: {
                    reset: {
                        target: "{that reset}.options.invokers.click",
                        record: {
                            changePath: "{settings}.model.settings",
                            value: "{settings}.options.defaultSettings",
                            source: "reset"
                        }
                    }
                }
            }
        }
    }
});

fluid.defaults("uioPlus.chrome.settingsContextPanel", {
    gradeNames: ["uioPlus.chrome.contextMenuPanel"],
    strings: {
        inputsLarger: "enhance inputs",
        rightClickToSelect: "right-click to select",
        selfVoicing: "text-to-speech",
        simplifiedUI: "reading mode",
        syllabification: "syllables",
        tableOfContents: "table of contents"
    },
    events: {
        afterContextMenuItemsCreated: null
    },
    listeners: {
        "onCreate.createContextMenuItems": "uioPlus.chrome.contextMenuPanel.createContextMenuItems"
    },
    components: {
        "syllabification": {
            type: "uioPlus.chrome.contextItem.checkbox",
            options: {
                priority: "after:parent",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.syllabification",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.syllabificationEnabled"
                }
            }
        },
        "rightClickToSelect": {
            type: "uioPlus.chrome.contextItem.checkbox",
            options: {
                priority: "after:syllabification",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.rightClickToSelect",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.clickToSelectEnabled"
                }
            }
        },
        "selfVoicing": {
            type: "uioPlus.chrome.contextItem.checkbox",
            options: {
                priority: "after:rightClickToSelect",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.selfVoicing",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.selfVoicingEnabled"
                }
            }
        },
        "simplifiedUI": {
            type: "uioPlus.chrome.contextItem.checkbox",
            options: {
                priority: "after:selfVoicing",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.simplifiedUI",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.simplifiedUiEnabled"
                }
            }
        },
        "tableOfContents": {
            type: "uioPlus.chrome.contextItem.checkbox",
            options: {
                priority: "after:simplifiedUI",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.tableOfContents",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.tableOfContentsEnabled"
                }
            }
        },
        "inputsLarger": {
            type: "uioPlus.chrome.contextItem.checkbox",
            options: {
                priority: "after:tableOfContents",
                contextProps: {
                    title: "{settingsContextPanel}.options.strings.inputsLarger",
                    parentId: "{parent}.options.contextProps.id"
                },
                model: {
                    value: "{settingsContextPanel}.model.settings.inputsLargerEnabled"
                }
            }
        }
    }
});
