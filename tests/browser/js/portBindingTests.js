/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/fluid-project/uio-plus/blob/master/AUTHORS.md
 *
 * Licensed under the BSD 3-Clause License. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/fluid-project/uio-plus/blob/master/LICENSE.txt
 */

/* global fluid, uioPlus, jqUnit, sinon */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("uioPlus.tests");

        /*********************
         * portBinding tests *
         *********************/

        fluid.defaults("uioPlus.tests.chrome.portBindingSpies", {
            members: {
                handleReadSpy: {
                    expander: {
                        "this": sinon,
                        method: "spy"
                    }
                },
                handleWriteSpy: {
                    expander: {
                        "this": sinon,
                        method: "spy"
                    }
                }
            },
            invokers: {
                handleRead: {
                    funcName: "uioPlus.tests.chrome.portBinding.handle",
                    args: ["{that}.handleReadSpy", "{arguments}.0"]
                },
                handleWrite: {
                    funcName: "uioPlus.tests.chrome.portBinding.handle",
                    args: ["{that}.handleWriteSpy", "{arguments}.0"]
                }
            }
        });

        fluid.defaults("uioPlus.tests.chrome.portBinding", {
            gradeNames: ["uioPlus.chrome.portBinding", "uioPlus.tests.chrome.portBindingSpies"],
            portName: "portBindingTests"
        });

        uioPlus.tests.chrome.portBinding.handle = function (spy, data) {
            var promise = fluid.promise();
            spy(data);

            if (fluid.get(data, ["payload", "reject"])) {
                promise.reject({message: "rejected"});
            } else {
                promise.resolve(fluid.get(data, ["payload", "toReturn"]));
            }

            return promise;
        };

        fluid.defaults("uioPlus.tests.portBindingTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                portBinding: {
                    type: "uioPlus.tests.chrome.portBinding"
                },
                portBindingTester: {
                    type: "uioPlus.tests.portBindingTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.portBindingTester", {
            gradeNames: ["fluid.test.testCaseHolder", "uioPlus.tests.portBinding.portName"],
            testOpts: {
                posted: {pref: "posted"},
                messages: {
                    incomingRead: {
                        type: "uioPlus.chrome.readRequest",
                        id: "incomingRead-1",
                        payload: {
                            toReturn: {value: "test"}
                        }
                    },
                    returnedReadReceipt: {
                        type: "uioPlus.chrome.readReceipt",
                        id: "incomingRead-1",
                        payload: {
                            value: "test"
                        }
                    },
                    incomingReadRejected: {
                        type: "uioPlus.chrome.readRequest",
                        id: "incomingRead-2",
                        payload: {
                            reject: true
                        }
                    },
                    returnedRejectedReadReceipt: {
                        type: "uioPlus.chrome.readReceipt",
                        id: "incomingRead-2",
                        payload: {
                            reject: true
                        },
                        error: {
                            message: "rejected"
                        }
                    },
                    incomingWrite: {
                        type: "uioPlus.chrome.writeRequest",
                        id: "incomingWrite-1",
                        payload: {
                            toReturn: {value: "test"}
                        }
                    },
                    returnedWriteReceipt: {
                        type: "uioPlus.chrome.writeReceipt",
                        id: "incomingWrite-1",
                        payload: {
                            value: "test"
                        }
                    },
                    incomingWriteRejected: {
                        type: "uioPlus.chrome.writeRequest",
                        id: "incomingWrite-2",
                        payload: {
                            reject: true
                        }
                    },
                    returnedRejectedWriteReceipt: {
                        type: "uioPlus.chrome.writeReceipt",
                        id: "incomingWrite-2",
                        payload: {
                            reject: true
                        },
                        error: {
                            message: "rejected"
                        }
                    },
                    readRequest: {
                        type: "uioPlus.chrome.readRequest",
                        // the id is created with a unique number, so it will not be tested
                        payload: {}
                    },
                    readRequestReceipt: {
                        type: "uioPlus.chrome.readReceipt",
                        // the id will be added by uioPlus.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "one"}
                    },
                    readRequestRejectedReceipt: {
                        type: "uioPlus.chrome.readReceipt",
                        // the id will be added by uioPlus.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "one"},
                        error: {message: "rejected"}
                    },
                    writeRequest: {
                        type: "uioPlus.chrome.writeRequest",
                        // the id is created with a unique number, so it will not be tested
                        payload: {pref: "posted"}
                    },
                    writeRequestReceipt: {
                        type: "uioPlus.chrome.writeReceipt",
                        // the id will be added by uioPlus.tests.chrome.portBinding.returnReceipt
                        payload: {pref: "posted"}
                    }
                }
            },
            modules: [{
                name: "portBinding Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 23,
                    sequence: [{
                        // connection
                        func: "uioPlus.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        // accepted incoming read
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingRead"]
                    }, {
                        event: "{portBinding}.events.onIncomingRead",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Accepted Incoming Read: The onIncomingRead event should have passed along the message", "{that}.options.testOpts.messages.incomingRead", "{arguments}.0"]
                    }, {
                        func: "uioPlus.tests.portBindingTester.verifyHandleFn",
                        args: ["Accepted Incoming Read: The handleRead method was called correctly", "{portBinding}.handleReadSpy", "{that}.options.testOpts.messages.incomingRead"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedReadReceipt"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // rejected incoming read
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingReadRejected"]
                    }, {
                        event: "{portBinding}.events.onIncomingRead",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Rejected Incoming Read: The onIncomingRead event should have passed along the message", "{that}.options.testOpts.messages.incomingReadRejected", "{arguments}.0"]
                    }, {
                        func: "uioPlus.tests.portBindingTester.verifyHandleFn",
                        args: ["Rejected Incoming Read: The handleRead method was called correctly", "{portBinding}.handleReadSpy", "{that}.options.testOpts.messages.incomingReadRejected"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedRejectedReadReceipt"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // accepted incoming write
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingWrite"]
                    }, {
                        event: "{portBinding}.events.onIncomingWrite",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Accepted Incoming Write: The onIncomingWrite event should have passed along the message", "{that}.options.testOpts.messages.incomingWrite", "{arguments}.0"]
                    }, {
                        func: "uioPlus.tests.portBindingTester.verifyHandleFn",
                        args: ["Accepted Incoming Write: The handleWrite method was called correctly", "{portBinding}.handleWriteSpy", "{that}.options.testOpts.messages.incomingWrite"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedWriteReceipt"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // rejected incoming write
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.incomingWriteRejected"]
                    }, {
                        event: "{portBinding}.events.onIncomingWrite",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Rejected Incoming Write: The onIncomingWrite event should have passed along the message", "{that}.options.testOpts.messages.incomingWriteRejected", "{arguments}.0"]
                    }, {
                        func: "uioPlus.tests.portBindingTester.verifyHandleFn",
                        args: ["Rejected Incoming Write: The handleWrite method was called correctly", "{portBinding}.handleWriteSpy", "{that}.options.testOpts.messages.incomingWriteRejected"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBinding}.port", "{that}.options.testOpts.messages.returnedRejectedWriteReceipt"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port", "resetHistory"]
                    }, {
                        // send read Request
                        func: "uioPlus.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.readRequestReceipt"]
                    }, {
                        task: "{portBinding}.read",
                        args: [{}],
                        resolve: "uioPlus.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        resolveArgs: ["Read Request", "{portBinding}.port", "{that}.options.testOpts.messages.readRequest"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // reject read Request
                        func: "uioPlus.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.readRequestRejectedReceipt"]
                    }, {
                        task: "{portBinding}.read",
                        args: [{}],
                        reject: "uioPlus.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        rejectArgs: ["Read Request - Rejected", "{portBinding}.port", "{that}.options.testOpts.messages.readRequest"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // send write Request
                        func: "uioPlus.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.writeRequestReceipt"]
                    }, {
                        task: "{portBinding}.write",
                        args: ["{that}.options.testOpts.posted"],
                        resolve: "uioPlus.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        resolveArgs: ["Write Request", "{portBinding}.port", "{that}.options.testOpts.messages.writeRequest"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // reject write Request
                        func: "uioPlus.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBinding}", "{that}.options.testOpts.messages.writeRequestRejectedReceipt"]
                    }, {
                        task: "{portBinding}.write",
                        args: ["{that}.options.testOpts.posted"],
                        reject: "uioPlus.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        rejectArgs: ["Write Request - Rejected", "{portBinding}.port", "{that}.options.testOpts.messages.writeRequest"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBinding}.port"]
                    }, {
                        // disconnect
                        func: "uioPlus.tests.mockPort.trigger.onDisconnect",
                        args: ["{portBinding}.port"]
                    }, {
                        event: "{portBinding}.events.onDisconnect",
                        priority: "last:testing",
                        listener: "jqUnit.assert",
                        args: ["The onDisconnect event should have fired"]
                    }, {
                        // remove port
                        func: "fluid.set",
                        args: ["{portBinding}", ["port"], undefined]
                    }, {
                        task: "{portBinding}.read",
                        args: ["{that}.options.testOpts.posted"],
                        reject: "jqUnit.assert",
                        rejectArgs: ["The postMessage promise should have been rejected"]
                    }]
                }]
            }]
        });

        uioPlus.tests.portBindingTester.verifyHandleFn = function (msg, spy, expectedData) {
            jqUnit.assertTrue(msg, spy.calledWithExactly(expectedData));
        };

        /***************
         * store tests *
         ***************/

        fluid.defaults("uioPlus.tests.portBindingStoreTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                portBindingStore: {
                    type: "uioPlus.chrome.portBinding.store",
                    options: {
                        gradeNames: ["uioPlus.tests.chrome.portBindingSpies", "fluid.dataSource.writable"],
                        portName: "portBindingStoreTests"
                    }
                },
                portBindingStoreTester: {
                    type: "uioPlus.tests.portBindingStoreTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.portBindingStoreTester", {
            gradeNames: ["fluid.test.testCaseHolder", "uioPlus.tests.portBinding.portName"],
            testOpts: {
                prefs: {
                    preferences: {
                        setting: "set"
                    }
                },
                messages: {
                    readRequestReceipt: {
                        type: "uioPlus.chrome.readReceipt",
                        // the id will be added by uioPlus.tests.chrome.portBinding.returnReceipt
                        payload: "{that}.options.testOpts.prefs"
                    },
                    writeRequest: {
                        type: "uioPlus.chrome.writeRequest",
                        // the id is created with a unique number, so it will not be tested
                        payload: "{that}.options.testOpts.prefs"
                    },
                    writeRequestReceipt: {
                        type: "uioPlus.chrome.writeReceipt",
                        // the id will be added by uioPlus.tests.chrome.portBinding.returnReceipt
                        payload: "{that}.options.testOpts.prefs"
                    },
                    incomingReadRejected: {
                        type: "uioPlus.chrome.readRequest",
                        id: "incomingRead-1",
                        payload: {
                            reject: true
                        }
                    },
                    returnedRejectedReadReceipt: {
                        type: "uioPlus.chrome.readReceipt",
                        id: "incomingRead-1",
                        payload: null,
                        error: {
                            message: "Request of type: uioPlus.chrome.readRequest are not accepted."
                        }
                    },
                    incomingWriteRejected: {
                        type: "uioPlus.chrome.writeRequest",
                        id: "incomingWrite-1",
                        payload: {
                            reject: true
                        }
                    },
                    returnedRejectedWriteReceipt: {
                        type: "uioPlus.chrome.writeReceipt",
                        id: "incomingWrite-1",
                        payload: null,
                        error: {
                            message: "Request of type: uioPlus.chrome.writeRequest are not accepted."
                        }
                    }
                }
            },
            modules: [{
                name: "portBinding store Tests",
                tests: [{
                    name: "getting/setting",
                    expect: 8,
                    sequence: [{
                        func: "uioPlus.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        // Get
                        func: "uioPlus.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBindingStore}", "{that}.options.testOpts.messages.readRequestReceipt"]
                    }, {
                        task: "{portBindingStore}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the stored prefs correctly", "{that}.options.testOpts.prefs", "{arguments}.0"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBindingStore}.port"]
                    }, {
                        // Set
                        func: "uioPlus.tests.chrome.portBinding.returnReceipt",
                        args: ["{portBindingStore}", "{that}.options.testOpts.messages.writeRequestReceipt"]
                    }, {
                        task: "{portBindingStore}.set",
                        args: [null, "{that}.options.testOpts.prefs"],
                        resolve: "uioPlus.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        resolveArgs: ["Set", "{portBindingStore}.port", "{that}.options.testOpts.messages.writeRequest"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBindingStore}.port"]
                    }, {
                        // reject read Request
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{portBindingStore}.port", "{that}.options.testOpts.messages.incomingReadRejected"]
                    }, {
                        event: "{portBindingStore}.events.onIncomingRead",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Rejected Incoming Read: The onIncomingRead event should have passed along the message", "{that}.options.testOpts.messages.incomingReadRejected", "{arguments}.0"]
                    }, {
                        funcName: "uioPlus.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBindingStore}.port", "{that}.options.testOpts.messages.returnedRejectedReadReceipt"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBindingStore}.port"]
                    }, {
                        // reject write Request
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{portBindingStore}.port", "{that}.options.testOpts.messages.incomingWriteRejected"]
                    }, {
                        event: "{portBindingStore}.events.onIncomingWrite",
                        priority: "last:testing",
                        listener: "jqUnit.assertDeepEq",
                        args: ["Rejected Incoming Write: The onIncomingWrite event should have passed along the message", "{that}.options.testOpts.messages.incomingWriteRejected", "{arguments}.0"]
                    }, {
                        funcName: "uioPlus.tests.chrome.portBinding.assertPostMessage",
                        args: ["{portBindingStore}.port", "{that}.options.testOpts.messages.returnedRejectedWriteReceipt"]
                    }, {
                        func: "uioPlus.tests.chrome.portBinding.resetPostMessage",
                        args: ["{portBindingStore}.port"]
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "uioPlus.tests.portBindingTests",
            "uioPlus.tests.portBindingStoreTests"
        ]);
    });
})(jQuery);
