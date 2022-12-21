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
/* global Promise */

"use strict";

const fluid = require("infusion");
const jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
const sinon = require("sinon");
const chrome = require("sinon-chrome");

chrome.scripting = {
    executeScript: sinon.stub()
};

const uioPlus = require("../../src/js/background.js");

const initStorageGetFunc = function () {
    // Make sure chrome.storage.local.get() returns an object as per its spec
    chrome.storage.local.get.callsFake(() => {
        return {preferences: {}};
    });
};

jqUnit.test("Test createMenuItems()", async () => {
    // Reset chrome API behaviour and history as sinon stubs
    chrome.storage.local.get.reset();
    chrome.contextMenus.create.reset();

    // 1. Menu is not created when the argument is not provided
    let menu = await uioPlus.createMenuItems();
    jqUnit.assertUndefined("Return undefined when menu items to be created are not provided", menu);
    jqUnit.assertEquals("chrome.storage.local.get is not called", 0, chrome.storage.local.get.callCount);

    // 2. Menu is created when the argument is provided
    let menuItems = {
        preferences: {
            title: "Preferences Quick Panel",
            children: {
                fluid_prefs_syllabification: {
                    title: "Syllables",
                    type: "checkbox"
                }
            }
        },
        reset: {
            title: "Reset"
        }
    };
    let expected = [
        [
            {
                id: "preferences",
                title: "Preferences Quick Panel",
                type: "normal",
                parentId: undefined,
                contexts: ["action"],
                checked: false
            }
        ], [
            {
                id: "reset",
                title: "Reset",
                type: "normal",
                parentId: undefined,
                contexts: ["action"],
                checked: false
            }
        ], [
            {
                id: "fluid_prefs_syllabification",
                title: "Syllables",
                type: "checkbox",
                parentId: "preferences",
                contexts: ["action"],
                checked: false
            }
        ]
    ];

    menu = await uioPlus.createMenuItems(menuItems);
    jqUnit.assertEquals("chrome.storage.local.get is called", 2, chrome.storage.local.get.callCount);
    jqUnit.assertDeepEq("chrome.contextMenus.create() is called with the expected argument", expected, chrome.contextMenus.create.args);

    // 3. Menu reflects preferences changes saved in the storage
    chrome.storage.local.get.reset();
    chrome.contextMenus.create.reset();

    chrome.storage.local.get.callsFake(() => {
        return {
            preferences: {
                "fluid_prefs_syllabification": true
            }
        };
    });

    expected = [
        [
            {
                id: "preferences",
                title: "Preferences Quick Panel",
                type: "normal",
                parentId: undefined,
                contexts: ["action"],
                checked: false
            }
        ], [
            {
                id: "fluid_prefs_syllabification",
                title: "Syllables",
                type: "checkbox",
                parentId: "preferences",
                contexts: ["action"],
                checked: true
            }
        ], [
            {
                id: "reset",
                title: "Reset",
                type: "normal",
                parentId: undefined,
                contexts: ["action"],
                checked: false
            }
        ]
    ];

    menu = await uioPlus.createMenuItems(menuItems);
    jqUnit.assertEquals("chrome.storage.local.get is called", 1, chrome.storage.local.get.callCount);
    jqUnit.assertDeepEq("chrome.contextMenus.create() is called with the expected argument", expected, chrome.contextMenus.create.args);
});

jqUnit.test("Test storePref()", async () => {
    const testCases = [
        {
            message: "The preference with the false value is removed if it was already a part of the saved preferences",
            input: {
                prefName: "toc",
                state: false,
                getResponse: {
                    toc: true
                }
            },
            expected: {
                preferences: {}
            }
        },
        {
            message: "The preference with the false value is not saved when it previously was not a part of the saved preferences",
            input: {
                prefName: "toc",
                state: false,
                getResponse: {}
            },
            expected: {
                preferences: {}
            }
        },
        {
            message: "The preference with the true value stays unchanged if it was already a part of the saved preferences",
            input: {
                prefName: "toc",
                state: true,
                getResponse: {
                    lineSpace: 1.5
                }
            },
            expected: {
                preferences: {
                    lineSpace: 1.5,
                    toc: true
                }
            }
        },
        {
            message: "The preference with the true value is added when it previously was not a part of the saved preferences",
            input: {
                prefName: "toc",
                state: true,
                getResponse: {
                    lineSpace: 1.5,
                    toc: true
                }
            },
            expected: {
                preferences: {
                    lineSpace: 1.5,
                    toc: true
                }
            }
        }
    ];

    for (const oneTestCase of testCases) {
        chrome.storage.local.get.callsFake(() => {
            return {
                preferences: oneTestCase.input.getResponse
            };
        });

        await uioPlus.storePref(oneTestCase.input.prefName, oneTestCase.input.state);
        jqUnit.assertDeepEq(oneTestCase.message, oneTestCase.expected, chrome.storage.local.set.args[0][0]);
        chrome.storage.local.get.reset();
        chrome.storage.local.set.reset();
    }
});

jqUnit.test("Test storeZoom()", async () => {
    const testCases = [
        {
            message: "The zoom value null is not saved",
            input: {
                zoom: null
            },
            expected: {
                setCallsCount: 0
            }
        },
        {
            message: "The zoom value undefined is not saved",
            input: {
                zoom: null
            },
            expected: {
                setCallsCount: 0
            }
        },
        {
            message: "The zoom value 1 is not saved",
            input: {
                zoom: null
            },
            expected: {
                setCallsCount: 0
            }
        },
        {
            message: "The zoom value is saved as the first preference",
            input: {
                zoom: 2
            },
            expected: {
                setCallsCount: 1,
                preferences: {
                    preferences: {
                        uioPlus_prefs_zoom: 2
                    }
                }
            }
        },
        {
            message: "The zoom value is added to the existing preferences object",
            input: {
                zoom: 2,
                getResponse: {
                    lineSpace: 1.5
                }
            },
            expected: {
                setCallsCount: 1,
                preferences: {
                    preferences: {
                        lineSpace: 1.5,
                        uioPlus_prefs_zoom: 2
                    }
                }
            }
        },
        {
            message: "The zoom value is updated when the input zoom value is different",
            input: {
                zoom: 3,
                getResponse: {
                    lineSpace: 1.5,
                    uioPlus_prefs_zoom: 2
                }
            },
            expected: {
                setCallsCount: 1,
                preferences: {
                    preferences: {
                        lineSpace: 1.5,
                        uioPlus_prefs_zoom: 3
                    }
                }
            }
        }
    ];

    for (const oneTestCase of testCases) {
        chrome.storage.local.get.callsFake(() => {
            return oneTestCase.input.getResponse ? {
                preferences: oneTestCase.input.getResponse
            } : {};
        });

        await uioPlus.storeZoom(oneTestCase.input.zoom);
        jqUnit.assertDeepEq(oneTestCase.message + " - call counts on chrome.storage.local.set() is expected", oneTestCase.expected.setCallsCount, chrome.storage.local.set.callCount);
        if (chrome.storage.local.set.callCount > 0) {
            jqUnit.assertDeepEq(oneTestCase.message + " - arguments to chrome.storage.local.set() is expected", oneTestCase.expected.preferences, chrome.storage.local.set.args[0][0]);
        }
        chrome.storage.local.set.reset();
    }
});

jqUnit.test("Test applyZoom()", async () => {
    const testCases = [
        {
            message: "The unchanged zoom value is not applied",
            input: {
                zoom: 1,
                tabId: 1,
                getResponse: 1
            },
            expected: {
                setCallsCount: 0
            }
        },
        {
            message: "The changed zoom value is not applied",
            input: {
                zoom: 1,
                tabId: 1,
                getResponse: 2
            },
            expected: {
                setCallsCount: 1,
                setResponse: [1, 1]
            }
        }
    ];

    for (const oneTestCase of testCases) {
        chrome.tabs.getZoom.callsFake(() => {
            return oneTestCase.input.getResponse;
        });

        await uioPlus.applyZoom(oneTestCase.input.zoom, oneTestCase.input.tabId);

        jqUnit.assertDeepEq(oneTestCase.message + " - call counts on chrome.tabs.setZoom() is expected", oneTestCase.expected.setCallsCount, chrome.tabs.setZoom.callCount);
        if (chrome.tabs.setZoom.callCount > 0) {
            jqUnit.assertDeepEq(oneTestCase.message + " - arguments to chrome.tabs.setZoom() is expected", oneTestCase.expected.setResponse, chrome.tabs.setZoom.args[0]);
        }
        chrome.tabs.setZoom.reset();
    }
});

jqUnit.test("Test updateQuickPanelState()", async () => {
    const menuItems = {
        preferences: {
            children: {
                fluid_prefs_syllabification: {
                    title: "Syllables",
                    type: "checkbox"
                },
                uioPlus_prefs_clickToSelect: {
                    title: "Right-Click to Select",
                    type: "checkbox"
                }
            }
        }
    };

    const testCases = [
        {
            message: "The unchanged values are not applied",
            input: {
                changes: {
                    preferences: {
                        oldValue: {
                            uioPlus_prefs_clickToSelect: true
                        },
                        newValue: {
                            uioPlus_prefs_clickToSelect: true
                        }
                    }
                }
            },
            expected: {
                setCallsCount: 0
            }
        },
        {
            message: "New values are applied",
            input: {
                changes: {
                    preferences: {
                        oldValue: {},
                        newValue: {
                            uioPlus_prefs_clickToSelect: true
                        }
                    }
                }
            },
            expected: {
                setCallsCount: 1,
                updateResponse: [["uioPlus_prefs_clickToSelect", { checked: true }]]
            }
        },
        {
            message: "Updated values are applied",
            input: {
                changes: {
                    preferences: {
                        oldValue: {
                            uioPlus_prefs_clickToSelect: false,
                            fluid_prefs_syllabification: true
                        },
                        newValue: {
                            uioPlus_prefs_clickToSelect: true,
                            fluid_prefs_syllabification: true
                        }
                    }
                }
            },
            expected: {
                setCallsCount: 1,
                updateResponse: [["uioPlus_prefs_clickToSelect", { checked: true }]]
            }
        },
        {
            message: "Muliple updated values are applied",
            input: {
                changes: {
                    preferences: {
                        oldValue: {
                            uioPlus_prefs_clickToSelect: false,
                            fluid_prefs_syllabification: false
                        },
                        newValue: {
                            uioPlus_prefs_clickToSelect: true,
                            fluid_prefs_syllabification: true
                        }
                    }
                }
            },
            expected: {
                setCallsCount: 2,
                updateResponse: [["fluid_prefs_syllabification", { checked: true }], ["uioPlus_prefs_clickToSelect", { checked: true }]]
            }
        }
    ];

    for (const oneTestCase of testCases) {
        await uioPlus.updateQuickPanelState(menuItems, oneTestCase.input.changes);
        jqUnit.assertDeepEq(oneTestCase.message + " - call counts on chrome.contextMenus.update() is expected", oneTestCase.expected.setCallsCount, chrome.contextMenus.update.callCount);
        if (chrome.contextMenus.update.callCount > 0) {
            jqUnit.assertDeepEq(oneTestCase.message + " - arguments to chrome.contextMenus.update() is expected", oneTestCase.expected.updateResponse, chrome.contextMenus.update.args);
        }
        chrome.contextMenus.update.reset();
    }
});

jqUnit.test("Test updateQuickPanelState()", async () => {
    initStorageGetFunc();
    const listeners = chrome.contextMenus.onClicked._listeners;

    jqUnit.assertEquals("Test reset listener - there is one and only one listener is defined", 1, listeners.length);
    const listener = listeners[0];
    await listener({menuItemId: "reset"});
    jqUnit.assertEquals("Test reset listener - chrome.storage.local.clear() is called", 1, chrome.storage.local.clear.callCount);

    const testCases = [
        {
            menuItemId: "fluid_prefs_syllabification",
            checked: true
        },
        {
            menuItemId: "uioPlus_prefs_clickToSelect",
            checked: true
        },
        {
            menuItemId: "fluid_prefs_speak",
            checked: true
        },
        {
            menuItemId: "uioPlus_prefs_simplify",
            checked: true
        },
        {
            menuItemId: "fluid_prefs_tableOfContents",
            checked: true
        },
        {
            menuItemId: "fluid_prefs_enhanceInputs",
            checked: true
        }
    ];

    chrome.storage.local.get.reset();
    chrome.storage.local.set.reset();
    for (const oneClickData of testCases) {
        initStorageGetFunc();

        // Trigger listener to simulate a click on a corresponding menu item
        await listener(oneClickData);
        jqUnit.assertEquals("Test " + oneClickData.menuItemId + " listener - get() is called", 1, chrome.storage.local.get.callCount);
        jqUnit.assertEquals("Test " + oneClickData.menuItemId + " listener - set() is called", 1, chrome.storage.local.set.callCount);
        chrome.storage.local.get.reset();
        chrome.storage.local.set.reset();
    }
});

jqUnit.test("Test chrome.storage.onChanged listener", async () => {
    const listeners = chrome.storage.onChanged._listeners;
    jqUnit.assertEquals("Test chrome.storage.onChanged listener - there is one and only one listener is defined", 1, listeners.length);

    const listener = listeners[0];

    const testCases = [
        {
            message: "Reach all actions",
            areaName: "local",
            changes: {
                preferences: {
                    oldValue: {
                        uioPlus_prefs_clickToSelect: false
                    },
                    newValue: {
                        uioPlus_prefs_clickToSelect: true,
                        uioPlus_prefs_zoom: 2
                    }
                }
            },
            expected: {
                numOfUpdatePanelCalls: 1,
                numOfGetZoomCalls: 1
            }
        },
        {
            message: "No updates when the area name is not 'local'",
            areaName: "remote",
            expected: {
                numOfUpdatePanelCalls: 0,
                numOfGetZoomCalls: 0
            }
        },
        {
            message: "Only update zoom when zoom is changed and other preference values are not changed",
            areaName: "local",
            changes: {
                preferences: {
                    newValue: {
                        uioPlus_prefs_zoom: 1
                    }
                }
            },
            expected: {
                numOfUpdatePanelCalls: 0,
                numOfGetZoomCalls: 1
            }
        },
        {
            message: "No actions when no changes",
            areaName: "local",
            changes: {},
            expected: {
                numOfUpdatePanelCalls: 0,
                numOfGetZoomCalls: 0
            }
        }
    ];

    chrome.contextMenus.update.reset();
    chrome.tabs.getZoom.reset();
    for (const oneCase of testCases) {
        await listener(oneCase.changes, oneCase.areaName);
        jqUnit.assertEquals(oneCase.message + " - chrome.contextMenus.update() is called", oneCase.expected.numOfUpdatePanelCalls, chrome.contextMenus.update.callCount);
        jqUnit.assertEquals(oneCase.message + " - chrome.tabs.getZoom() is called", oneCase.expected.numOfGetZoomCalls, chrome.tabs.getZoom.callCount);
        chrome.contextMenus.update.reset();
        chrome.tabs.getZoom.reset();
    }
});


jqUnit.test("Test chrome.tabs.onActivated listener", async () => {
    const listeners = chrome.tabs.onActivated._listeners;
    jqUnit.assertEquals("Test chrome.tabs.onActivated listener - there is one and only one listener is defined", 1, listeners.length);
    const listener = listeners[0];

    const activeInfo = {tabId: 0};
    const testCases = [
        {
            message: "Apply zoom preference when a tab is activated",
            getPrefsResponse: {
                preferences: {
                    uioPlus_prefs_zoom: 2
                }
            },
            expected: {
                numOfGetPrefsCalls: 1,
                numOfGetZoomCalls: 1
            }
        },
        {
            message: "Don't apply zoom value when there is not a saved zoom preference",
            getPrefsResponse: {},
            expected: {
                numOfGetPrefsCalls: 1,
                numOfGetZoomCalls: 0
            }
        }
    ];

    chrome.storage.local.get.reset();
    chrome.tabs.getZoom.reset();
    for (const oneCase of testCases) {
        chrome.storage.local.get.callsFake(() => {
            return oneCase.getPrefsResponse;
        });

        await listener(activeInfo);
        jqUnit.assertEquals(oneCase.message + " - chrome.storage.local.get() is called", oneCase.expected.numOfGetPrefsCalls, chrome.storage.local.get.callCount);
        jqUnit.assertEquals(oneCase.message + " - chrome.tabs.getZoom() is called", oneCase.expected.numOfGetZoomCalls, chrome.tabs.getZoom.callCount);
        if (oneCase.expected.numOfGetZoomCalls > 0) {
            jqUnit.assertDeepEq(oneCase.message + " - arguments to chrome.tabs.getZoom() is expected", activeInfo.tabId, chrome.tabs.getZoom.args[0][0]);
        }
        chrome.storage.local.get.reset();
        chrome.tabs.getZoom.reset();
    }
});

jqUnit.test("Test chrome.tabs.onZoomChange listener", async () => {
    const listeners = chrome.tabs.onZoomChange._listeners;
    jqUnit.assertEquals("Test chrome.tabs.onZoomChange listener - there is one and only one listener is defined", 1, listeners.length);
    const listener = listeners[0];

    const testCases = [
        {
            message: "Store new zoom value when it's changed",
            zoomChangeInfo: {
                oldZoomFactor: 1,
                newZoomFactor: 2
            },
            expected: {
                numOfGetPrefsCalls: 1
            }
        },
        {
            message: "Don't store zoom value when there is not a change",
            zoomChangeInfo: {
                oldZoomFactor: 1,
                newZoomFactor: 1
            },
            expected: {
                numOfGetPrefsCalls: 0
            }
        }
    ];

    chrome.storage.local.get.reset();
    for (const oneCase of testCases) {
        initStorageGetFunc();
        await listener(oneCase.zoomChangeInfo);
        jqUnit.assertEquals(oneCase.message + " - chrome.storage.local.get() is called", oneCase.expected.numOfGetPrefsCalls, chrome.storage.local.get.callCount);
        chrome.storage.local.get.reset();
    }
});

jqUnit.test("Test chrome.runtime.onMessage listener", async () => {
    const listeners = chrome.runtime.onMessage._listeners;
    jqUnit.assertEquals("Test chrome.runtime.onMessage listener - there is one and only one listener is defined", 1, listeners.length);
    const listener = listeners[0];

    const testCases = [
        {
            message: "Request content script injection",
            input: {
                message: {
                    type: "uioPlus.requestContentScriptInjection",
                    src: "contentScript.js"
                },
                sender: {
                    tab: {
                        id: 1
                    }
                }
            },
            expected: {
                numOfExecScriptCalls: 1
            }
        },
        {
            message: "Listener doesn't execute when the incoming message type is unknown",
            input: {
                message: {
                    type: "unknown",
                    src: "contentScript.js"
                },
                sender: {
                    tab: {
                        id: 1
                    }

                }
            },
            expected: {
                numOfExecScriptCalls: 0
            }
        }
    ];

    chrome.scripting.executeScript.reset();
    for (const oneCase of testCases) {
        chrome.scripting.executeScript.callsFake(() => Promise.resolve());
        await listener(oneCase.input.message, oneCase.input.sender, {});
        jqUnit.assertEquals(oneCase.message + " - chrome.scripting.executeScript() is called", oneCase.expected.numOfExecScriptCalls, chrome.scripting.executeScript.callCount);
        if (oneCase.expected.numOfExecScriptCalls > 0) {
            jqUnit.assertDeepEq(oneCase.message + " - arguments to chrome.scripting.executeScript() is expected",
                {
                    target: { tabId: oneCase.input.sender.tab.id, allFrames: true }, files: oneCase.input.message.src
                },
                chrome.scripting.executeScript.args[0][0]
            );
        }
        chrome.scripting.executeScript.reset();
    }
});
