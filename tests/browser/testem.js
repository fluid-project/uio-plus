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
require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.instrumentation"],
    coverageDir: "%uio-plus/coverage",
    reportsDir: "%uio-plus/reports",
    testPages:  ["tests/browser/all-tests.html"],
    instrumentedSourceDir: "%uio-plus/instrumented",
    instrumentationOptions: {
        nonSources: [
            "./**/*.!(js)",
            "./Gruntfile.js"
        ]
    },
    sourceDirs: {
        extension: "%uio-plus/src"
    },
    contentDirs: {
        tests:   "%uio-plus/tests"
    },
    testemOptions: {
        // Due to https://issues.gpii.net/browse/GPII-4064 skipping "Headless Chrome"
        // Due to https://github.com/testem/testem/issues/1387 skipping "Safari"
        skip: "Headless Chrome,IE,PhantomJS,Safari",
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.testem().getTestemOptions();
