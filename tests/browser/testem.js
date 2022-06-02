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
var fluid = require("infusion");
fluid.setLogging(true);

fluid.require("%uio-plus");
require("fluid-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["fluid.testem.instrumentation"],
    coverageDir: "%uio-plus/coverage",
    reportsDir: "%uio-plus/reports",
    testPages:  ["tests/browser/all-tests.html"],
    instrumentationOptions: {
        nonSources: [
            "./**/*.!(js)",
            "./webpack.mix.js"
        ]
    },
    sourceDirs: {
        extension: "%uio-plus/src"
    },
    contentDirs: {
        tests:   "%uio-plus/tests"
    },
    testemOptions: {
        launch: "Headless Chrome,Headless Firefox,Headless Edge",
        ignore_missing_launchers: true,
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.testem().getTestemOptions();
