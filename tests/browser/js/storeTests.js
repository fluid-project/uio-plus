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

/* global jqUnit, uioPlus, chrome */

"use strict";

jqUnit.test("Test store get()", async function () {
    let store = uioPlus.prefs.store();

    await store.get();
    jqUnit.assertEquals("The chrome storage get API is called", 1, chrome.storage.local.get.callCount);
    jqUnit.assertEquals("The chrome storage get API receives correct arguments", null, chrome.storage.local.get.getCall(0).args[0]);

    chrome.storage.local.get.reset();
    chrome.storage.local.set.reset();

    store = uioPlus.prefs.store();

    await store.get({
        key: "preferences"
    });
    jqUnit.assertEquals("The chrome storage get API is called", 1, chrome.storage.local.get.callCount);
    jqUnit.assertEquals("The chrome storage get API receives correct arguments", "preferences", chrome.storage.local.get.getCall(0).args[0]);
});

jqUnit.test("Test store set()", async function () {
    chrome.storage.local.get.reset();
    chrome.storage.local.set.reset();

    let store = uioPlus.prefs.store();
    const preferences = {
        preferences: {
            lineSpace: 1
        }
    };

    await store.set(null, preferences);
    jqUnit.assertEquals("The chrome storage set API is called", 1, chrome.storage.local.set.callCount);
    jqUnit.assertEquals("The chrome storage set API receives correct arguments", preferences, chrome.storage.local.set.getCall(0).args[0]);
    jqUnit.assertEquals("The chrome storage get API is called", 1, chrome.storage.local.get.callCount);
    jqUnit.assertUndefined("The chrome storage get API is called without arguments", chrome.storage.local.get.getCall(0).args[0]);
});
