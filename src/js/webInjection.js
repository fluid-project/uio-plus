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

fluid.registerNamespace("uioPlus.webInjection");

uioPlus.webInjection.fonts = [{
    fontFamily: "Orator-Icons",
    urls: [chrome.runtime.getURL("lib/infusion/src/components/orator/fonts/Orator-Icons.woff")]
}];

uioPlus.webInjection.styleTemplate = "<style>@font-face {font-family: \"%fontFamily\"; src: %src;}</style>";

// inject fonts
fluid.each(uioPlus.webInjection.fonts, function (fontInfo) {
    var urls = fluid.transform(fluid.makeArray(fontInfo.urls), function (url) {
        return "url(\"" + url + "\")";
    });

    var info = {
        fontFamily: fontInfo.fontFamily,
        src: urls.join(",")
    };

    var styleElm = $(fluid.stringTemplate(uioPlus.webInjection.styleTemplate, info));

    $("head").append(styleElm);
});
