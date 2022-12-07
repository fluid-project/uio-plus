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

/* global jqUnit, uioPlus */

"use strict";

fluid.registerNamespace("uioPlus.tests");

uioPlus.tests.verifySubcomponentsExist = function (that, subcomponents) {
    subcomponents.forEach((oneComponent) => {
        jqUnit.assertNotUndefined(oneComponent + " exist", that[oneComponent]);
    });
};
