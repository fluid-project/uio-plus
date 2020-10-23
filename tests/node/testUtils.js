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
var jqUnit = fluid.require("node-jqunit", require, "jqUnit"); // eslint-disable-line no-unused-vars
var uioPlus = fluid.registerNamespace("uioPlus"); // eslint-disable-line no-unused-vars

fluid.registerNamespace("uioPlus.tests.utils");

fluid.defaults("uioPlus.tests.testEnvironmentWithSetup", {
    gradeNames: ["fluid.test.testEnvironment"],
    invokers: {
        setup: "fluid.identity",
        teardown: "fluid.identity"
    },
    listeners: {
        "onCreate.setup": {
            listener: "{that}.setup",
            priority: "first"
        },
        "onDestroy.teardown": "{that}.teardown"
    }
});

uioPlus.tests.dispatchChromeEvent = function (chromeEvent, args) {
    args = fluid.makeArray(args);
    chromeEvent.dispatch.apply(chromeEvent, args);
};

uioPlus.tests.utils.assertEventRelayBound = function (that, eventRelayMap) {
    fluid.each(eventRelayMap, function (componentEventName, chromeEventName) {
        var addListenerFunc = fluid.getGlobalValue(chromeEventName).addListener;
        var isBound = addListenerFunc.calledWithExactly(that.events[componentEventName].fire);
        jqUnit.assertTrue("The " + chromeEventName + " event is relayed to the " + componentEventName + " component event.", isBound);
    });
};

uioPlus.tests.utils.assertEventRelayUnbound = function (that, eventRelayMap) {
    fluid.each(eventRelayMap, function (componentEventName, chromeEventName) {
        var removeListenerFunc = fluid.getGlobalValue(chromeEventName).removeListener;
        var isUnbound = removeListenerFunc.calledWithExactly(that.events[componentEventName].fire);
        jqUnit.assertTrue("The " + chromeEventName + " event relay was removed.", isUnbound);
    });
};
