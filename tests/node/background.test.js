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

const { chrome } = require("jest-chrome");
const uioPlus = require("../../src/js/background.js");

describe("Test createMenuItems()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Return undefined when menu items to be created are not provided", async () => {
        const menu = await uioPlus.createMenuItems();
        expect(menu).toBe(undefined);
    });

    const menuItems = {
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

    test("Menu is created when menu items are provided", async () => {
        const expected = [
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

        const menu = await uioPlus.createMenuItems(menuItems);
        expect(chrome.storage.local.get.mock.calls.length).toBe(2);
        expect(chrome.contextMenus.create.mock.calls).toEqual(expected);
    });

    test("Status of menu items are set properly according to saved preferences", async () => {
        // Implement a mock response for chrome.storage.local.get()
        chrome.storage.local.get.mockImplementation(() => {
            return {
                preferences: {
                    "fluid_prefs_syllabification": true
                }
            }
        });

        const expected = [
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

        const menu = await uioPlus.createMenuItems(menuItems);
        expect(chrome.contextMenus.create.mock.calls).toEqual(expected);
    });
});

describe("Test storePref()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

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

    testCases.forEach((oneTestCase) => {
        test(oneTestCase.message, async () => {
            chrome.storage.local.get.mockImplementation(() => {
                return {
                    preferences: oneTestCase.input.getResponse
                };
            });

            await uioPlus.storePref(oneTestCase.input.prefName, oneTestCase.input.state);
            expect(chrome.storage.local.set.mock.calls[0][0]).toEqual(oneTestCase.expected);
        });
    });
});

describe("Test storeZoom()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

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

    testCases.forEach((oneTestCase) => {
        test(oneTestCase.message, async () => {
            chrome.storage.local.get.mockImplementation(() => {
                return oneTestCase.input.getResponse ? {
                    preferences: oneTestCase.input.getResponse
                } : {};
            });

            await uioPlus.storeZoom(oneTestCase.input.zoom);
            expect(chrome.storage.local.set.mock.calls.length).toBe(oneTestCase.expected.setCallsCount);
            if (oneTestCase.expected.setCallsCount > 0) {
                expect(chrome.storage.local.set.mock.calls[0][0]).toEqual(oneTestCase.expected.preferences);
            }
        });
    });
});

describe("Test applyZoom()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

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

    testCases.forEach((oneTestCase) => {
        test(oneTestCase.message, async () => {
            chrome.tabs.getZoom.mockImplementation(() => {
                return oneTestCase.input.getResponse;
            });

            await uioPlus.applyZoom(oneTestCase.input.zoom, oneTestCase.input.tabId);
            expect(chrome.tabs.setZoom.mock.calls.length).toBe(oneTestCase.expected.setCallsCount);
            if (oneTestCase.expected.setCallsCount > 0) {
                expect(chrome.tabs.setZoom.mock.calls[0]).toEqual(oneTestCase.expected.setResponse);
            }
        });
    });
});

describe("Test updateQuickPanelState()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

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

    testCases.forEach((oneTestCase) => {
        test(oneTestCase.message, async () => {
            await uioPlus.updateQuickPanelState(menuItems, oneTestCase.input.changes);
            expect(chrome.contextMenus.update.mock.calls.length).toBe(oneTestCase.expected.setCallsCount);
            if (oneTestCase.expected.setCallsCount > 0) {
                expect(chrome.contextMenus.update.mock.calls).toEqual(oneTestCase.expected.updateResponse);
            }
        });
    });
});

describe("Test chrome.contextMenus.onClicked listener", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Make sure chrome.storage.local.get() returns an object as per its spec
        chrome.storage.local.get.mockImplementation(() => {
            return {};
        });
    });

    const listeners = chrome.contextMenus.onClicked.getListeners();
    const listener = Array.from(listeners)[0];

    test("Test reset listener", async () => {
        // There is one and only one listener is defined
        expect(listeners.size).toBe(1);
        // Trigger listener to simulate a click on the "reset" menu item
        await listener({menuItemId: "reset"});
        expect(chrome.storage.local.clear.mock.calls.length).toBe(1);
    });

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

    testCases.forEach((oneClickData) => {
        test("Test " + oneClickData.menuItemId + " listener", async () => {
            // Trigger listener to simulate a click on a corresponding menu item
            await listener(oneClickData);
            expect(chrome.storage.local.get.mock.calls.length).toBe(1);
            expect(chrome.storage.local.set.mock.calls.length).toBe(1);
        });
    });
});

describe("Test chrome.storage.onChanged listener", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const listeners = chrome.storage.onChanged.getListeners();
    const listener = Array.from(listeners)[0];

    test("Test the number of listeners", () => {
        expect(listeners.size).toBe(1);
    });

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

    testCases.forEach((oneCase) => {
        test(oneCase.message, async () => {
            await listener(oneCase.changes, oneCase.areaName);
            expect(chrome.contextMenus.update.mock.calls.length).toBe(oneCase.expected.numOfUpdatePanelCalls);
            expect(chrome.tabs.getZoom.mock.calls.length).toBe(oneCase.expected.numOfGetZoomCalls);
        });
    });
});

describe("Test chrome.tabs.onActivated listener", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const listeners = chrome.tabs.onActivated.getListeners();
    const listener = Array.from(listeners)[0];

    test("Test the number of listeners", () => {
        expect(listeners.size).toBe(1);
    });

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

    testCases.forEach((oneCase) => {
        test(oneCase.message, async () => {
            chrome.storage.local.get.mockImplementation(() => {
                return oneCase.getPrefsResponse;
            });

            await listener(activeInfo);
            expect(chrome.storage.local.get.mock.calls.length).toBe(oneCase.expected.numOfGetPrefsCalls);
            expect(chrome.tabs.getZoom.mock.calls.length).toBe(oneCase.expected.numOfGetZoomCalls);
            if (oneCase.expected.numOfGetZoomCalls > 0) {
                expect(chrome.tabs.getZoom.mock.calls[0][0]).toBe(activeInfo.tabId);
            }
        });
    });
});

describe("Test chrome.tabs.onZoomChange listener", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        chrome.storage.local.get.mockImplementation(() => {
            return {};
        });
    });

    const listeners = chrome.tabs.onZoomChange.getListeners();
    const listener = Array.from(listeners)[0];

    test("Test the number of listeners", () => {
        expect(listeners.size).toBe(1);
    });

    const activeInfo = {tabId: 0};
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

    testCases.forEach((oneCase) => {
        test(oneCase.message, async () => {
            await listener(oneCase.zoomChangeInfo);
            expect(chrome.storage.local.get.mock.calls.length).toBe(oneCase.expected.numOfGetPrefsCalls);
        });
    });
});

describe("Test chrome.runtime.onMessage listener", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.chrome.scripting.executeScript.mockImplementation(() => Promise.resolve());
    });

    const listeners = chrome.runtime.onMessage.getListeners();
    const listener = Array.from(listeners)[0];

    test("Test the number of listeners", () => {
        expect(listeners.size).toBe(1);
    });

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

    testCases.forEach((oneCase) => {
        test(oneCase.message, async () => {
            await listener(oneCase.input.message, oneCase.input.sender, {});
            expect(chrome.scripting.executeScript.mock.calls.length).toBe(oneCase.expected.numOfExecScriptCalls);
            if (oneCase.expected.numOfExecScriptCalls > 0) {
                expect(chrome.scripting.executeScript.mock.calls[0][0]).toEqual({
                    target: { tabId: oneCase.input.sender.tab.id, allFrames: true }, files: oneCase.input.message.src }
                );
            }
        });
    });
});
