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

fluid.defaults("uioPlus.auxSchema.clickToSelect", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "uioPlus.prefs.clickToSelect": {
            panel: {
                "type": "uioPlus.prefs.panel.clickToSelect",
                "container": ".uioPlusJS-prefsEditor-clickToSelect",
                "template": "%localTemplatePrefix/ClickToSelectPanelTemplate.html",
                "message": "%localMessagePrefix/clickToSelect.json"
            },
            enactor: {
                type: "uioPlus.enactor.clickToSelect"
            }
        }
    }
});

fluid.defaults("uioPlus.prefs.schemas.clickToSelect", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "uioPlus.prefs.clickToSelect": {
            "type": "boolean",
            "default": false
        }
    }
});

/******************************************
 * selection highlight preference         *
 ******************************************/

fluid.defaults("uioPlus.auxSchema.highlight", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "uioPlus.prefs.highlight": {
            panel: {
                "type": "uioPlus.prefs.panel.highlight",
                "container": ".uioPlusJS-prefsEditor-selectionHighlight",
                "classnameMap": {
                    "theme": {
                        "default": "fl-theme-prefsEditor-default",
                        "yellow": "uioPlus-selection-preview-yellow",
                        "green": "uioPlus-selection-preview-green",
                        "pink": "uioPlus-selection-preview-pink"
                    }
                },
                "template": "%localTemplatePrefix/SelectionHighlightPanelTemplate.html",
                "message": "%localMessagePrefix/selectionHighlight.json"
            },
            enactor: {
                type: "uioPlus.enactor.selectionHighlight",
                classes: {
                    "default": "",
                    "yellow": "uioPlus-selection-yellow",
                    "green": "uioPlus-selection-green",
                    "pink": "uioPlus-selection-pink"
                }
            }
        }
    }
});

fluid.defaults("uioPlus.prefs.schemas.highlight", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "uioPlus.prefs.highlight": {
            "type": "string",
            "default": "default",
            "enum": ["default", "yellow", "green", "pink"],
            "enumLabels": [
                "selectionHighlight-default",
                "selectionHighlight-yellow",
                "selectionHighlight-green",
                "selectionHighlight-pink"
            ]
        }
    }
});

/******************************************
 * simplify preference                    *
 ******************************************/

fluid.defaults("uioPlus.auxSchema.simplify", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "uioPlus.prefs.simplify": {
            panel: {
                "type": "uioPlus.prefs.panel.simplify",
                "container": ".uioPlusJS-prefsEditor-simplify",
                "template": "%localTemplatePrefix/SimplifyPanelTemplate.html",
                "message": "%localMessagePrefix/simplify.json"
            },
            enactor: {
                type: "uioPlus.enactor.simplify"
            }
        }
    }
});

fluid.defaults("uioPlus.prefs.schemas.simplify", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "uioPlus.prefs.simplify": {
            "type": "boolean",
            "default": false
        }
    }
});

/********************************************
 * zoom preference                          *
 ********************************************/

fluid.defaults("uioPlus.auxSchema.zoom", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "uioPlus.prefs.zoom": {
            panel: {
                "type": "uioPlus.prefs.panel.zoom",
                "container": ".uioPlusJS-prefsEditor-zoom",
                "message": "%localMessagePrefix/zoom.json",
                "template": "%templatePrefix/PrefsEditorTemplate-textSize.html"
            }
        }
    }
});

fluid.defaults("uioPlus.prefs.schemas.zoom", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "uioPlus.prefs.zoom": {
            "type": "number",
            "default": 1,
            "minimum": 0.25,
            "maximum": 5,
            "multipleOf": 0.1
        }
    }
});
