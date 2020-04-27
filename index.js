/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/fluid-project/uio-plus/blob/master/AUTHORS.md
 *
 * Licensed under the BSD 3-Clause License. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/fluid-project/uio-plus/blob/master/LICENSE.txt
 */

/*

    As this is a browser component, this file is only meant to make it easier to refer to our code and fixtures using
    the standard `%package-name/path/to/content` notation.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.module.register("ui-options-chrome", __dirname, require);
