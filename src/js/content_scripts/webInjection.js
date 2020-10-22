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

/* global fluid, uioPlus, chrome */
"use strict";

(function ($, fluid) {

    fluid.registerNamespace("uioPlus.chrome.webInjection");

    uioPlus.chrome.webInjection.fonts = [{
        fontFamily: "Orator-Icons",
        urls: [chrome.runtime.getURL("fonts/Orator-Icons.woff")]
    }];

    uioPlus.chrome.webInjection.styleTemplate = "<style>@font-face {font-family: \"%fontFamily\"; src: %src;}</style>";

    // inject fonts
    fluid.each(uioPlus.chrome.webInjection.fonts, function (fontInfo) {
        var urls = fluid.transform(fluid.makeArray(fontInfo.urls), function (url) {
            return "url(\"" + url + "\")";
        });

        var info = {
            fontFamily: fontInfo.fontFamily,
            src: urls.join(",")
        };

        var styleElm = $(fluid.stringTemplate(uioPlus.chrome.webInjection.styleTemplate, info));

        $("head").append(styleElm);
    });
})(jQuery, fluid);

// to allow for the pages own instance of jQuery
jQuery.noConflict();
