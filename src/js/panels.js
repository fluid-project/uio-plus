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

/******************************************
 * click-to-select preference             *
 ******************************************/

fluid.defaults("uioPlus.prefs.panel.clickToSelect", {
    gradeNames: ["fluid.prefs.panel.switchAdjuster"],
    preferenceMap: {
        "uioPlus.prefs.clickToSelect": {
            "model.value": "value"
        }
    }
});

/******************************************
 * selection highlight preference         *
 ******************************************/

fluid.defaults("uioPlus.prefs.panel.highlight", {
    gradeNames: ["fluid.prefs.panel.themePicker"],
    preferenceMap: {
        "uioPlus.prefs.highlight": {
            "model.value": "value",
            "controlValues.theme": "enum",
            "stringArrayIndex.theme": "enumLabels"
        }
    },
    selectors: {
        header: ".uioPlusJS-prefsEditor-highlight-header"
    },
    selectorsToIgnore: ["header"]
});

/******************************************
 * simplify preference                    *
 ******************************************/

fluid.defaults("uioPlus.prefs.panel.simplify", {
    gradeNames: ["fluid.prefs.panel.switchAdjuster"],
    preferenceMap: {
        "uioPlus.prefs.simplify": {
            "model.value": "value"
        }
    }
});

/********************************************
 * zoom preference                          *
 ********************************************/

fluid.defaults("uioPlus.prefs.panel.zoom", {
    gradeNames: ["fluid.prefs.panel.stepperAdjuster"],
    preferenceMap: {
        "uioPlus.prefs.zoom": {
            "model.value": "value",
            "range.min": "minimum",
            "range.max": "maximum",
            "step": "multipleOf"
        }
    },
    scale: 2,
    distributeOptions: [{
        source: "{that}.options.scale",
        target: "{that textfieldStepper}.options.scale",
        namespace: "scale"
    }]
});
