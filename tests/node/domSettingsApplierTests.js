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

var fluid = require("infusion");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome"); // eslint-disable-line no-unused-vars
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var uioPlus = fluid.registerNamespace("uioPlus");

require("./testUtils.js");
require("../../src/js/shared/portBinding.js");
require("../../src/js/background/chromeEvented.js");
require("../../src/js/background/domSettingsApplier.js");

/*********************************************************************************************************
 * uioPlus.chrome.contentScriptInjector tests
 ********************************************************************************************************/

fluid.defaults("uioPlus.tests.contentScriptInjectorTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        contentScriptInjector: {
            type: "uioPlus.chrome.contentScriptInjector"
        },
        contentScriptInjectorTester: {
            type: "uioPlus.tests.contentScriptInjectorTester"
        }
    }
});

fluid.defaults("uioPlus.tests.contentScriptInjectorTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    events: {
        onResponseReceived: null
    },
    testOpts: {
        req: {
            type: "uioPlus.chrome.contentScriptInjectionRequest",
            src: "patterns/en-us.js"
        },
        sender: {
            tab: {
                id: 123
            }
        },
        expectedInjectionArgs: {
            tabID: 123,
            message: {
                file: "patterns/en-us.js",
                allFrames: true,
                matchAboutBlank: true,
                runAt: "document_start"
            }
        }
    },
    modules: [{
        name: "UIO+ contentScriptInjector unit tests",
        tests: [{
            name: "Handle Inject Request",
            expect: 2,
            sequence: [{
                // setup
                func: "uioPlus.tests.contentScriptInjectorTester.setup"
            }, {
                func: "uioPlus.tests.contentScriptInjectorTester.triggerRuntimeMessage",
                args: ["{that}.options.testOpts.req", "{that}.options.testOpts.sender", "{that}.events.onResponseReceived.fire"]
            }, {
                event: "{that}.events.onResponseReceived",
                listener: "jqUnit.assert",
                args: ["The sendResponse should have been called"]
            }, {
                func: "uioPlus.tests.contentScriptInjectorTester.assertExecuteScriptCall",
                args: [0, "{that}.options.testOpts.expectedInjectionArgs.tabID", "{that}.options.testOpts.expectedInjectionArgs.message"]
            }, {
                // tear down
                func: "uioPlus.tests.contentScriptInjectorTester.tearDown"
            }]
        }]
    }]
});

uioPlus.tests.contentScriptInjectorTester.setup = function () {
    chrome.tabs.executeScript.callsArg(2);
};

uioPlus.tests.contentScriptInjectorTester.tearDown = function () {
    chrome.tabs.executeScript.flush();
};

uioPlus.tests.contentScriptInjectorTester.triggerRuntimeMessage = function (req, sender, sendResponse) {
    chrome.runtime.onMessage.trigger(req, sender, sendResponse);
};

uioPlus.tests.contentScriptInjectorTester.assertExecuteScriptCall = function (callNum, expectedTabID, expectedMessage) {
    var result = chrome.tabs.executeScript.getCall(callNum).calledWith(expectedTabID, expectedMessage);
    jqUnit.assertTrue("Call index #" + callNum + " of chrome.tabs.executeScript should have been called with the correct message", result);
};

/*********************************************************************************************************
 * uioPlus.chrome.domSettingsApplier tests
 ********************************************************************************************************/

fluid.defaults("uioPlus.tests.domSettingsApplierTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        domSettingsApplier: {
            type: "uioPlus.chrome.domSettingsApplier",
            options: {
                events: {
                    messagePosted: null
                },
                dynamicComponents: {
                    port: {
                        options: {
                            listeners: {
                                "onCreate.passMessage": {
                                    "this": "{that}.options.port.onPost",
                                    method: "addListener",
                                    args: ["{domSettingsApplier}.events.messagePosted.fire"]
                                }
                            }
                        }
                    }
                }
            }
        },
        domSettingsApplierTester: {
            type: "uioPlus.tests.domSettingsApplierTester"
        }
    }
});

// TODO: Refactor mockPort into a sharable mock object
// mock message port
uioPlus.tests.mockPort = {
    onMessage: {
        addListener: function (fn) {
            uioPlus.tests.mockPort.onMessage.listeners.push(fn);
        },
        listeners: []
    },
    onDisconnect: {
        addListener: function (fn) {
            uioPlus.tests.mockPort.onDisconnect.listeners.push(fn);
        },
        listeners: []
    },
    // this event is just for testing
    onPost: {
        addListener: function (fn) {
            uioPlus.tests.mockPort.onPost.listeners.push(fn);
        },
        listeners: []
    },
    requestToReceiptMap: {
        "uioPlus.chrome.readRequest": "uioPlus.chrome.readReceipt",
        "uioPlus.chrome.writeRequest": "uioPlus.chrome.writeReceipt"
    },
    postMessage: function (msg) {
        // automatically post a receipt
        var reply = fluid.copy(msg);

        // convert READ/WRITE to READ_RECEIPT/WRITE_RECEIPT
        reply.type = uioPlus.tests.mockPort.requestToReceiptMap[ msg.type] || msg.type;

        fluid.each(uioPlus.tests.mockPort.onMessage.listeners, function (fn) {
            fn(reply);
        });
        // this is just for testing.
        fluid.each(uioPlus.tests.mockPort.onPost.listeners, function (fn) {
            fn(msg);
        });
    },
    disconnect: function (msg) {
        fluid.each(uioPlus.tests.mockPort.onDisconnect.listeners, function (fn) {
            fn(msg);
        });
    }
};

// TODO: Add tests for the following:
//       - multiple open ports
//       - onDisconnect destroys port component
fluid.defaults("uioPlus.tests.domSettingsApplierTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOpts: {
        model: {
            test: "testValue"
        },
        incomingModel: {
            test: "incomingValue"
        },
        message: {
            type: "uioPlus.chrome.writeRequest",
            payload: "{that}.options.testOpts.model"
        },
        incomingWrite: {
            id: "test-1",
            type: "uioPlus.chrome.writeRequest",
            payload: "{that}.options.testOpts.incomingModel"
        },
        updateMessage: {
            type: "uioPlus.chrome.writeRequest",
            payload: "{that}.options.testOpts.incomingModel"
        },
        writeReceipt: {
            id: "test-1",
            type: "uioPlus.chrome.writeReceipt",
            payload: "{that}.options.testOpts.incomingModel"
        }
    },
    modules: [{
        name: "UIO+ domSettingsApplier unit tests",
        tests: [{
            name: "Port Connection",
            expect: 10,
            sequence: [{
                func: "uioPlus.tests.utils.assertEventRelayBound",
                args: ["{domSettingsApplier}", "{domSettingsApplier}.options.eventRelayMap"]
            }, {
                // Trigger onConnect event firer callback
                func: "uioPlus.tests.dispatchChromeEvent",
                args: [chrome.runtime.onConnect, uioPlus.tests.mockPort]
            }, {
                event: "{domSettingsApplier}.events.onConnect",
                listener: "jqUnit.assertValue",
                args: ["A port component should be created", "{domSettingsApplier}.port"]
            }, {
                // model changed - send a write request
                func: "{domSettingsApplier}.applier.change",
                args: ["test", "{that}.options.testOpts.model.test"]
            }, {
                event: "{domSettingsApplier}.events.messagePosted",
                listener: "uioPlus.tests.domSettingsApplierTester.verifyPostedMessage",
                args: ["{that}.options.testOpts.message", "{arguments}.0"]
            }, {
                // receive a write request
                func: "{domSettingsApplier}.port.events.onIncomingWrite.fire",
                args: ["{that}.options.testOpts.incomingWrite"]
            }, {
                event: "{domSettingsApplier}.events.messagePosted",
                listener: "uioPlus.tests.domSettingsApplierTester.verifyPostedMessage",
                args: ["{that}.options.testOpts.updateMessage", "{arguments}.0"]
            }, {
                event: "{domSettingsApplier}.events.messagePosted",
                listener: "uioPlus.tests.domSettingsApplierTester.verifyPostedMessage",
                args: ["{that}.options.testOpts.writeReceipt", "{arguments}.0"]
            }, {
                funcName: "jqUnit.assertDeepEq",
                args: [
                    "The model should be updated to match the incoming write",
                    "{that}.options.testOpts.incomingModel",
                    "{domSettingsApplier}.model"
                ]
            }, {
                // destroy the component
                func: "{domSettingsApplier}.destroy"
            }, {
                event: "{domSettingsApplier}.events.onDestroy",
                priority: "last:testing",
                listener: "uioPlus.tests.utils.assertEventRelayUnbound",
                args: ["{domSettingsApplier}", "{domSettingsApplier}.options.eventRelayMap"]
            }]
        }]
    }]
});

uioPlus.tests.domSettingsApplierTester.verifyPostedMessage = function (expectedPost, message) {
    jqUnit.assertEquals("The posted message type is correct", expectedPost.type, message.type);
    jqUnit.assertDeepEq("The posted message payload is correct", expectedPost.payload, message.payload);
};

fluid.test.runTests([
    "uioPlus.tests.contentScriptInjectorTests",
    "uioPlus.tests.domSettingsApplierTests"
]);
