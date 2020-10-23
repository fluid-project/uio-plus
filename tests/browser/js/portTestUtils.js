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

/* global fluid, chrome, sinon, uioPlus */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("uioPlus.tests.mockPort");

        uioPlus.tests.mockPort.returnPort = function () {
            var port = {
                onMessage: {
                    addListener: function (handler) {
                        port.onMessage.listeners.push(handler);
                    },
                    listeners: []
                },
                onDisconnect: {
                    addListener: function (handler) {
                        port.onDisconnect.listeners.push(handler);
                    },
                    listeners: []
                },
                postMessage: sinon.stub()
            };
            return port;
        };

        uioPlus.tests.mockPort.trigger = {
            onMessage: function (port, msg) {
                fluid.each(port.onMessage.listeners, function (handler) {
                    handler(msg, port);
                });
            },
            onDisconnect: function (port) {
                fluid.each(port.onDisconnect.listeners, function (handler) {
                    handler(port);
                });
            }
        };

        uioPlus.tests.mockPort.reset = function () {
            // using the sinon-chrome stub we return a fresh mockPort
            chrome.runtime.connect.returns(uioPlus.tests.mockPort.returnPort());
        };

        uioPlus.tests.mockPort.reset();
    });
})(jQuery);
