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

/* global jqUnit, chrome */

"use strict";

jqUnit.test("Test the effect of webInjection.js", function () {
    jqUnit.assertEquals("The chrome runtime API is called", 1, chrome.runtime.getURL.callCount);
    jqUnit.assertEquals("The chrome runtime API receives correct arguments", "lib/infusion/src/components/orator/fonts/Orator-Icons.woff", chrome.runtime.getURL.getCall(0).args[0]);

    const expectedStyle = "</script><style>@font-face {font-family: \"Orator-Icons\"; src: url(\"undefined\");}</style>";
    jqUnit.assertTrue("The style element is appended", document.head.innerHTML.includes(expectedStyle));
});
