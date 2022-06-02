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

"use strict";

const mix = require("laravel-mix");

// Set public path.
mix.setPublicPath("dist");

// pass through files and directories
mix.copyDirectory("src", "dist");
mix.copyDirectory("node_modules/infusion", "dist/lib/infusion");


mix.options({
    // Don't output the mix-manifest.json file
    manifest: false,
    // Don't modify stylesheet url() functions.
    processCssUrls: false
});

// Add version string to assets in production.
if (mix.inProduction()) {
    mix.version();
}
