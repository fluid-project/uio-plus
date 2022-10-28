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

fluid.defaults("uioPlus.prefs.store", {
    gradeNames: ["fluid.dataSource", "fluid.dataSource.writable", "fluid.modelComponent"],
    components: {
        encoding: {
            type: "fluid.dataSource.encoding.model"
        }
    },
    storage: {
        "area": "local"
    },
    listeners: {
        "onRead.impl": {
            listener: "uioPlus.prefs.store.getFromStorage",
            args: ["{arguments}.1"]
        },
        "onWrite.impl": {
            listener: "uioPlus.prefs.store.writeToStorage"
        }
    },
    invokers: {
        get: {
            args: ["{that}", "{arguments}.0", "{that}.options.storage"]
        },
        set: {
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{that}.options.storage"] // directModel, model, options/callback
        }
    }
});

uioPlus.prefs.store.getFromStorage = function (options) {
    const storageArea = fluid.get(options, ["area"]);
    const key = fluid.get(options, ["directModel", "key"]) || null;

    return chrome.storage[storageArea].get(key);
};

uioPlus.prefs.store.writeToStorage = async function (payload, options) {
    payload.preferences ??= {}; // for the case of an empty payload to ensure old preferences are removed
    await chrome.storage[options.area].set(payload);

    return chrome.storage[options.area].get();
};
