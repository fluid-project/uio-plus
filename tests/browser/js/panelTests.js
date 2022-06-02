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

fluid.defaults("uioPlus.tests.elementPriority.switchRender", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        func: "{panel}.refreshView"
    }, {
        listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
        event: "{panel}.events.afterRender",
        args: ["{panel}", "{testCaseHolder}.options.testOptions.originalValue"]
    }]
});

fluid.defaults("uioPlus.tests.elementPriority.switchClick", {
    gradeNames: "fluid.test.sequenceElement",
    sequence: [{
        jQueryTrigger: "click",
        element: "{panel}.switchUI.dom.control"
    }, {
        listener: "fluid.tests.panels.utils.checkModel",
        args: ["value", "{panel}.model", "{testCaseHolder}.options.testOptions.newValue"],
        spec: {path: "value", priority: "last"},
        changeEvent: "{panel}.applier.modelChanged"
    }]
});

fluid.defaults("uioPlus.tests.switchPanelSequence", {
    gradeNames: "fluid.test.sequence",
    sequenceElements: {
        render: {
            gradeNames: "uioPlus.tests.elementPriority.switchRender",
            priority: "before:sequence"
        },
        click: {
            gradeNames: "uioPlus.tests.elementPriority.switchClick",
            priority: "after:render"
        }
    }
});

/******************************************
 * click-to-select preference             *
 ******************************************/

fluid.defaults("uioPlus.tests.prefs.panel.clickToSelect", {
    gradeNames: ["uioPlus.prefs.panel.clickToSelect", "fluid.tests.panels.utils.defaultTestPanel"],
    messageBase: {
        "label": "Right-click To Select",
        "description": "Right click to select paragraph",
        "switchOn": "Click to Select ON",
        "switchOff": "Click to Select OFF"
    },
    model: {
        value: false
    },
    resources: {
        template: {
            url: "../../../src/templates/ClickToSelectPanelTemplate.html"
        }
    },
    renderOnInit: true
});

fluid.defaults("uiPlus.tests.clickToSelectPanel", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        panel: {
            type: "uioPlus.tests.prefs.panel.clickToSelect",
            container: ".uioPlusJS-prefsEditor-clickToSelect",
            createOnEvent: "{panelTester}.events.onTestCaseStart"
        },
        panelTester: {
            type: "uioPlus.tests.clickToSelectTester"
        }
    }
});

fluid.defaults("uioPlus.tests.clickToSelectTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOptions: {
        originalValue: false,
        newValue: true
    },
    modules: [{
        name: "Test the Click to Select settings panel",
        tests: [{
            expect: 7,
            name: "Test the rendering of the Click to Select panel",
            sequenceGrade: "uioPlus.tests.switchPanelSequence"
        }]
    }]
});

/******************************************
 * selection highlight preference         *
 ******************************************/

fluid.defaults("uioPlus.tests.prefs.panel.selectionHighlight", {
    gradeNames: ["uioPlus.prefs.panel.highlight", "fluid.tests.panels.utils.defaultTestPanel"],
    renderOnInit: true,
    messageBase: {
        "selectionHighlight-default": "Default",
        "selectionHighlight-yellow": "Yellow highlight",
        "selectionHighlight-green": "Green highlight",
        "selectionHighlight-pink": "Pink highlight",
        "label": "Selection Highlight",
        "description": "Change the highlight colour"
    },
    model: {
        value: "default"
    },
    resources: {
        template: {
            url: "../../../src/templates/SelectionHighlightPanelTemplate.html"
        }
    },
    classnameMap: {
        theme: {
            default: "fl-theme-prefsEditor-default",
            yellow: "uioPlus-selection-preview-yellow",
            green: "uioPlus-selection-preview-green",
            pink: "uioPlus-selection-preview-pink"
        }
    },
    stringArrayIndex: {
        theme: [
            "selectionHighlight-default",
            "selectionHighlight-yellow",
            "selectionHighlight-green",
            "selectionHighlight-pink"
        ]
    },
    controlValues: {
        theme: ["default", "yellow", "green", "pink"]
    }
});

fluid.defaults("uiPlus.tests.selectionHighlightPanel", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        panel: {
            type: "uioPlus.tests.prefs.panel.selectionHighlight",
            container: ".uioPlusJS-prefsEditor-selectionHighlight",
            createOnEvent: "{panelTester}.events.onTestCaseStart"
        },
        panelTester: {
            type: "uioPlus.tests.selectionHighlightTester"
        }
    }
});

fluid.defaults("uioPlus.tests.selectionHighlightTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOptions: {
        expectedNumOfOptions: 4,
        defaultValue: "default",
        newValue: "pink"
    },
    modules: [{
        name: "Test the Selection Highlight settings panel",
        tests: [{
            expect: 14,
            name: "Test the rendering of the Selection Highlight panel",
            sequence: [{
                listener: "uioPlus.tests.selectionHighlightTester.testDefault",
                args: ["{panel}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                spec: {priority: "last"},
                event: "{selectionHighlightPanel panel}.events.afterRender"
            }, {
                func: "uioPlus.tests.selectionHighlightTester.changeChecked",
                args: ["{panel}.dom.themeInput", "{that}.options.testOptions.newValue"]
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", "{that}.options.testOptions.newValue"],
                spec: {path: "value", priority: "last"},
                changeEvent: "{panel}.applier.modelChanged"
            }]
        }]
    }]
});

uioPlus.tests.selectionHighlightTester.testDefault = function (that, expectedNumOfOptions, expectedHighlightColour) {
    var inputs = that.locate("themeInput");
    var labels = that.locate("themeLabel");
    var messageBase = that.options.messageBase;

    jqUnit.assertEquals(`The label text is ${messageBase.label}`, messageBase.label, that.locate("label").text());
    jqUnit.assertEquals(`The description text is ${messageBase.description}`, messageBase.description, that.locate("description").text());

    jqUnit.assertEquals(`There are ${expectedNumOfOptions} highlight options in the control`, expectedNumOfOptions, inputs.length);
    jqUnit.assertEquals(`The first highlight colour is ${expectedHighlightColour}`, expectedHighlightColour, inputs.filter(":checked").val());

    var inputValue, label;
    fluid.each(inputs, function (input, index) {
        inputValue = input.value;
        label = labels.eq(index);
        jqUnit.assertTrue("The selection highlight label has appropriate css applied", label.hasClass(that.options.classnameMap.theme[inputValue]));
        jqUnit.assertEquals("The input has the correct name attribute", that.id, $(input).attr("name"));
    });

    jqUnit.assertTrue("The default selection highlight label has the default label css applied", labels.eq(0).hasClass(that.options.styles.defaultThemeLabel));
};

uioPlus.tests.selectionHighlightTester.changeChecked = function (inputs, newValue) {
    inputs.prop("checked", false);
    var matchingInput = inputs.filter(`[value="${newValue}"]`);
    matchingInput.prop("checked", "checked").trigger("change");
};

/******************************************
 * simplify preference                    *
 ******************************************/

fluid.defaults("uioPlus.tests.prefs.panel.simplify", {
    gradeNames: ["uioPlus.prefs.panel.simplify", "fluid.tests.panels.utils.defaultTestPanel"],
    messageBase: {
        "label": "Reading Mode",
        "description": "Only display the main content",
        "switchOn": "Simplify ON",
        "switchOff": "Simplify OFF"
    },
    model: {
        value: false
    },
    resources: {
        template: {
            url: "../../../src/templates/SimplifyPanelTemplate.html"
        }
    },
    renderOnInit: true
});

fluid.defaults("uiPlus.tests.simplifyPanel", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        panel: {
            type: "uioPlus.tests.prefs.panel.simplify",
            container: ".uioPlusJS-prefsEditor-simplify",
            createOnEvent: "{panelTester}.events.onTestCaseStart"
        },
        panelTester: {
            type: "fluid.tests.simplifyTester"
        }
    }
});

fluid.defaults("fluid.tests.simplifyTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOptions: {
        originalValue: false,
        newValue: true
    },
    modules: [{
        name: "Test the Simplify settings panel",
        tests: [{
            expect: 7,
            name: "Test the rendering of the Simplify panel",
            sequenceGrade: "uioPlus.tests.switchPanelSequence"
        }]
    }]
});

/********************************************
 * zoom preference                          *
 ********************************************/

fluid.defaults("uioPlus.tests.prefs.panel.zoom", {
    gradeNames: ["uioPlus.prefs.panel.zoom", "fluid.tests.panels.utils.defaultTestPanel"],
    messageBase: {
        "label": "Zoom",
        "description": "Adjust zoom level",
        "increaseLabel": "increase",
        "decreaseLabel": "decrease"
    },
    model: {
        value: 0
    },
    resources: {
        template: {
            url: "../../../node_modules/infusion/src/framework/preferences/html/PrefsEditorTemplate-textSize.html"
        }
    },
    renderOnInit: true
});

fluid.defaults("uiPlus.tests.zoomPanel", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        panel: {
            type: "uioPlus.tests.prefs.panel.zoom",
            container: ".uioPlusJS-prefsEditor-zoom",
            createOnEvent: "{panelTester}.events.onTestCaseStart"
        },
        panelTester: {
            type: "uioPlus.tests.zoomTester"
        }
    }
});

fluid.defaults("uioPlus.tests.zoomTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOptions: {
        newValue: 2.5
    },
    modules: [{
        name: "Test the zoom settings panel",
        tests: [{
            expect: 2,
            name: "Test the rendering of the zoom panel",
            sequence: [{
                event: "{zoomPanel panel}.events.afterRender",
                priority: "last:testing",
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", 0]
            }, {
                func: "fluid.tests.panels.changeInput",
                args: ["{panel}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", "{that}.options.testOptions.newValue"],
                spec: {path: "value", priority: "last:testing"},
                changeEvent: "{panel}.applier.modelChanged"
            }]
        }]
    }]
});

fluid.test.runTests([
    "uiPlus.tests.clickToSelectPanel",
    "uiPlus.tests.simplifyPanel",
    "uiPlus.tests.selectionHighlightPanel",
    "uiPlus.tests.zoomPanel"
]);
