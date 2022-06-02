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

/* global jqUnit, sinon, uioPlus */
"use strict";

fluid.registerNamespace("uioPlus.tests");

/*********************************************************************************************************
 * Common Assertions
 ********************************************************************************************************/

uioPlus.tests.assertSubComponentNotCreated = function (that, subComponentName) {
    jqUnit.assertUndefined(`"The ${subComponentName} subcomponent should not have be created yet.`, that[subComponentName]);
};

/******************************************
 * Helper functions                       *
 ******************************************/

uioPlus.tests.clearSelection = function () {
    window.getSelection().removeAllRanges();
};

uioPlus.tests.cloneSelectedNode = function () {
    return window.getSelection().getRangeAt(0).cloneContents().children[0];
};

uioPlus.tests.getContextMenuEvent = function (mousePressed) {
    var event = jQuery.Event("contextmenu");
    if (mousePressed) {
        event.button = 2;
    }
    sinon.spy(event, "preventDefault");
    return event;
};

/******************************************
 * click-to-select Tests                  *
 ******************************************/

jqUnit.module("Click to Select Tests");

jqUnit.test("uioPlus.enactor.clickToSelect.selectParagraph tests", function () {
    uioPlus.tests.clearSelection();

    // select nested element
    uioPlus.enactor.clickToSelect.selectParagraph($(".uioPlusJS-test-clickToSelect-nestedElm")[0]);
    let selectedParagraph = uioPlus.tests.cloneSelectedNode();

    jqUnit.assertTrue("The paragraph should be selected", $(selectedParagraph).is(".uioPlusJS-test-clickToSelect-paragraph"));
    uioPlus.tests.clearSelection();

    // select no <p> parent
    uioPlus.enactor.clickToSelect.selectParagraph($(".uioPlusJS-test-clickToSelect-node")[0]);
    let selectedNode = uioPlus.tests.cloneSelectedNode();

    jqUnit.assertTrue("The node should be selected", $(selectedNode).is(".uioPlusJS-test-clickToSelect-node"));
    uioPlus.tests.clearSelection();
});

uioPlus.tests.handleRightClickTestCases = [{
    name: "Enabled - no right click",
    model: {
        value: true
    },
    event: uioPlus.tests.getContextMenuEvent()
}, {
    name: "Disabled - no right click",
    model: {
        value: false
    },
    event: uioPlus.tests.getContextMenuEvent()
}, {
    name: "Enabled - right click",
    model: {
        value: true
    },
    event: uioPlus.tests.getContextMenuEvent(true)
}, {
    name: "Disabled - right click",
    model: {
        value: false
    },
    event: uioPlus.tests.getContextMenuEvent(true)
}];

jqUnit.test("uioPlus.enactor.clickToSelect.handleRightClick tests", function () {
    jqUnit.expect(10);

    fluid.each(uioPlus.tests.handleRightClickTestCases, function (testCase) {
        let handler = sinon.fake();
        uioPlus.enactor.clickToSelect.handleRightClick(testCase.model, testCase.event, handler);

        if (testCase.model.value && testCase.event.button === 2) {
            jqUnit.assertTrue(`${testCase.name}: The right click handler was fired`, handler.calledOnceWith(testCase.event.target));
            jqUnit.assertEquals(`${testCase.name}: The second button should have been pressed`, 2, testCase.event.button);
            jqUnit.assertTrue(`${testCase.name}: The model value should be set to true`, testCase.model.value);
            jqUnit.assertTrue(`${testCase.name}: event.preventDefault should have been called`, testCase.event.preventDefault.calledOnce);
        } else {
            jqUnit.assertFalse(`${testCase.name}: The right click handler was not fired`, handler.called);
            jqUnit.assertFalse(`${testCase.name}: event.preventDefault should not have been called`, testCase.event.preventDefault.called);
        }
    });
});

fluid.defaults("uioPlus.tests.enactor.clickToSelect", {
    gradeNames: ["uioPlus.enactor.clickToSelect"],
    model: {
        value: false
    }
});

fluid.defaults("uioPlus.tests.clickToSelectTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        clickToSelect: {
            type: "uioPlus.tests.enactor.clickToSelect",
            container: ".uioPlusJS-test-clickToSelect"
        },
        clickToSelectTester: {
            type: "uioPlus.tests.clickToSelectTester"
        }
    }
});

uioPlus.tests.clickToSelectTests.assertSelectedText = function (expectedSelector) {
    var selectedNode = uioPlus.tests.cloneSelectedNode();
    jqUnit.assertTrue(`The node with selector "${expectedSelector}" should be selected`, $(selectedNode).is(expectedSelector));
};

fluid.defaults("uioPlus.tests.clickToSelectTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "Click-to-Select Tests",
        tests: [{
            name: "Model Changes",
            expect: 2,
            sequence: [{
                func: "jqUnit.assertFalse",
                args: ["The model.value should be set to 'false'", "{clickToSelect}.model.value"]
            }, {
                func: "{clickToSelect}.applier.change",
                args: ["value", true]
            }, {
                changeEvent: "{clickToSelect}.applier.modelChanged",
                path: "value",
                listener: "jqUnit.assertTrue",
                args: ["The model.value should be set to 'true'", "{clickToSelect}.model.value"]
            }]
        }, {
            name: "Selection",
            expect: 3,
            sequence: [{
                jQueryTrigger: uioPlus.tests.getContextMenuEvent(true),
                element: ".uioPlusJS-test-clickToSelect-paragraph"
            }, {
                func: "uioPlus.tests.clickToSelectTests.assertSelectedText",
                args: [".uioPlusJS-test-clickToSelect-paragraph"]
            }, {
                jQueryTrigger: uioPlus.tests.getContextMenuEvent(true),
                element: ".uioPlusJS-test-clickToSelect-nestedElm"
            }, {
                func: "uioPlus.tests.clickToSelectTests.assertSelectedText",
                args: [".uioPlusJS-test-clickToSelect-paragraph"]
            }, {
                jQueryTrigger: uioPlus.tests.getContextMenuEvent(true),
                element: $(".uioPlusJS-test-clickToSelect-node")
            }, {
                func: "uioPlus.tests.clickToSelectTests.assertSelectedText",
                args: [".uioPlusJS-test-clickToSelect-node"]
            }]
        }]
    }]
});

/******************************************
 * selection highlight enactor            *
 ******************************************/

jqUnit.module("Selection Highlight Tests");

fluid.defaults("uioPlus.tests.enactor.selectionHighlight", {
    gradeNames: ["uioPlus.enactor.selectionHighlight"],
    classes: {
        "default": "",
        "yellow": "uioPlus-selection-yellow",
        "green": "uioPlus-selection-green",
        "pink": "uioPlus-selection-pink"
    },
    model: {
        value: "default"
    }
});

fluid.defaults("uioPlus.tests.selectionHighlightTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        selectionHighlight: {
            type: "uioPlus.tests.enactor.selectionHighlight",
            container: ".uioPlusJS-test-selectionHighlight"
        },
        selectionHighlightTester: {
            type: "uioPlus.tests.selectionHighlightTester"
        }
    }
});

fluid.defaults("uioPlus.tests.selectionHighlightTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "Selection Highlight Tests",
        tests: [{
            name: "Model Changes",
            expect: 17,
            sequence: [{
                func: "jqUnit.assertEquals",
                args: ["The model.value should be set to 'default'", "default", "{selectionHighlight}.model.value"]
            }, {
                func: "{selectionHighlight}.applier.change",
                args: ["value", "yellow"]
            }, {
                changeEvent: "{selectionHighlight}.applier.modelChanged",
                path: "value",
                listener: "jqUnit.assertEquals",
                args: ["The model.value should be set to 'yellow'", "yellow", "{selectionHighlight}.model.value"]
            }, {
                func: "uioPlus.tests.selectionHighlightTester.assertClasses",
                args: ["{selectionHighlight}", "yellow"]
            }, {
                func: "{selectionHighlight}.applier.change",
                args: ["value", "pink"]
            }, {
                changeEvent: "{selectionHighlight}.applier.modelChanged",
                path: "value",
                listener: "jqUnit.assertEquals",
                args: ["The model.value should be set to 'pink'", "pink", "{selectionHighlight}.model.value"]
            }, {
                func: "uioPlus.tests.selectionHighlightTester.assertClasses",
                args: ["{selectionHighlight}", "pink"]
            }, {
                func: "{selectionHighlight}.applier.change",
                args: ["value", "green"]
            }, {
                changeEvent: "{selectionHighlight}.applier.modelChanged",
                path: "value",
                listener: "jqUnit.assertEquals",
                args: ["The model.value should be set to 'green'", "green", "{selectionHighlight}.model.value"]
            }, {
                func: "uioPlus.tests.selectionHighlightTester.assertClasses",
                args: ["{selectionHighlight}", "green"]
            }, {
                func: "{selectionHighlight}.applier.change",
                args: ["value", "default"]
            }, {
                changeEvent: "{selectionHighlight}.applier.modelChanged",
                path: "value",
                listener: "jqUnit.assertEquals",
                args: ["The model.value should be set to 'default'", "default", "{selectionHighlight}.model.value"]
            }, {
                func: "uioPlus.tests.selectionHighlightTester.assertClasses",
                args: ["{selectionHighlight}", "default"]
            }]
        }]
    }]
});

uioPlus.tests.selectionHighlightTester.assertClasses = function (that, setting) {
    fluid.each(that.options.classes, function (className, settingName) {
        if (settingName === setting && className) {
            jqUnit.assertTrue("The " + className + " class should be applied.", that.container.hasClass(className));
        } else if (className) {
            jqUnit.assertFalse("The " + className + " class should not be applied.", that.container.hasClass(className));
        }
    });
};

/******************************************
 * simplify enactor                       *
 ******************************************/

jqUnit.module("Simplification Tests");

jqUnit.test("Initialization - simplify disabled", function () {
    jqUnit.expect(3);
    var that = uioPlus.enactor.simplify(".uioPlusJS-test-simplify-init", {model: {simplify: false}});
    var navToggle = that.locate("navToggle");

    jqUnit.assertValue("The simplify enactor should have initialized", that);
    jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
    jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
});

jqUnit.test("Initialization - simplify enabled", function () {
    jqUnit.expect(3);
    var that = uioPlus.enactor.simplify(".uioPlusJS-test-simplify-init", {model: {simplify: true}});
    var navToggle = that.locate("navToggle");

    jqUnit.assertValue("The simplify enactor should have initialized", that);
    jqUnit.assertEquals("Visibility styling on the container should have been set", "hidden", that.container.css("visibility"));
    jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
});

jqUnit.test("Initialization - simplify enabled, wth nav", function () {
    jqUnit.expect(6);
    var that = uioPlus.enactor.simplify(".uioPlusJS-test-simplify-init-withNav", {model: {simplify: true}});
    var navToggle = that.locate("navToggle");

    jqUnit.assertValue("The simplify enactor should have initialized", that);
    jqUnit.assertEquals("Visibility styling on the container should have been set", "hidden", that.container.css("visibility"));
    jqUnit.assertEquals("The navigation toggle button should be inserted", 1, navToggle.length);
    jqUnit.assertEquals("The navToggle's text should be set", that.options.strings.navToggle, navToggle.text());
    jqUnit.assertTrue("The navToggle style should be set", navToggle.hasClass(that.options.styles.navToggle));
    jqUnit.assertEquals("The navToggle's pressed state should be set", "false", navToggle.attr("aria-pressed"));
});

jqUnit.test("Initialization - simplify enabled, noContent", function () {
    jqUnit.expect(4);
    var that = uioPlus.enactor.simplify(".uioPlusJS-test-simplify-init-noContent", {model: {simplify: true}});
    var navToggle = that.locate("navToggle");

    jqUnit.assertValue("The simplify enactor should have initialized", that);
    jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
    jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
    jqUnit.assertEquals("Should not have found any content elements", 0, that.content.length);
});

jqUnit.test("findNav - generic", function () {
    jqUnit.expect(1);
    var that = uioPlus.enactor.simplify(".uioPlusJS-test-simplify-navigation");

    jqUnit.assertEquals("Should have found all of the nav elements", 6, that.nav.length);
});


fluid.defaults("uioPlus.tests.simplifyTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    markupFixture: ".uioPlusJS-test-simplify",
    components: {
        simplify: {
            type: "uioPlus.enactor.simplify",
            container: ".uioPlusJS-test-simplify",
            options: {
                model: {
                    simplify: false,
                    showNav: false
                }
            }
        },
        simplifyTester: {
            type: "fluid.tests.simplifyTester"
        }
    }
});

uioPlus.tests.simplifyTests.assertSimplified = function (that) {
    jqUnit.assertEquals("The container should be set to hidden", "hidden", that.container.css("visibility"));
    that.content.each(function (idx, node) {
        jqUnit.isVisible("The content element at index " + idx + " should be visible", node);
    });
    fluid.each(that.options.alwaysVisible, function (selector) {
        that.locate(selector).each(function (idx, node) {
            jqUnit.isVisible("The always visible element at index " + idx + " should be visible", node);
        });
    });
    jqUnit.isVisible("The navigation toggle should be visible", that.locate("navToggle"));
};

uioPlus.tests.simplifyTests.assertNotSimplified = function (that) {
    jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
    jqUnit.notVisible("The navigation toggle should be visible", that.locate("navToggle"));
};

uioPlus.tests.simplifyTests.assertNavShown = function (that) {
    that.nav.each(function (idx, node) {
        jqUnit.isVisible("The navigation element at index " + idx + " should be visible", node);
    });
    jqUnit.assertEquals("The aria-pressed state for the nav toggle should be set to true", "true", that.locate("navToggle").attr("aria-pressed"));
};

uioPlus.tests.simplifyTests.assertNavNotShown = function (that) {
    that.nav.each(function (idx, node) {
        jqUnit.assertEquals("The navigation element at index " + idx + " should be set to hidden", "hidden", $(node).css("visibility"));
    });
    jqUnit.assertEquals("The aria-pressed state for the nav toggle should be set to false", "false", that.locate("navToggle").attr("aria-pressed"));
};

fluid.defaults("fluid.tests.simplifyTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "Simplification Tests",
        tests: [{
            name: "Model Changes",
            expect: 11,
            sequence: [{
                func: "{simplify}.applier.change",
                args: ["simplify", true]
            }, {
                changeEvent: "{simplify}.applier.modelChanged",
                path: "simplify",
                listener: "uioPlus.tests.simplifyTests.assertSimplified",
                args: ["{simplify}"]
            }, {
                jQueryTrigger: "click",
                element: "{simplify}.dom.navToggle"
            }, {
                changeEvent: "{simplify}.applier.modelChanged",
                path: "showNav",
                listener: "uioPlus.tests.simplifyTests.assertNavShown",
                args: ["{simplify}"]
            }, {
                func: "{simplify}.applier.change",
                args: ["showNav", false]
            }, {
                changeEvent: "{simplify}.applier.modelChanged",
                path: "showNav",
                listener: "uioPlus.tests.simplifyTests.assertNavNotShown",
                args: ["{simplify}"]
            }, {
                func: "{simplify}.applier.change",
                args: ["simplify", false]
            }, {
                changeEvent: "{simplify}.applier.modelChanged",
                path: "simplify",
                listener: "uioPlus.tests.simplifyTests.assertNotSimplified",
                args: ["{simplify}"]
            }]
        }, {
            name: "Dynamically added always visible element",
            expect: 1,
            sequence: [{
                func: "{simplify}.applier.change",
                args: ["simplify", true]
            }, {
                func: "fluid.tests.simplifyTester.injectElement",
                args: ["{simplify}"]
            }, {
                event: "{simplify}.observer.events.onNodeAdded",
                priority: "after:makeVisible",
                listener: "fluid.tests.simplifyTester.assertElmVisible"
            }]
        }]
    }]
});

fluid.tests.simplifyTester.injectElement = function (that) {
    var elm = $("<button class=\"uioPlusJS-simplify-visible\">Test</button>");
    that.container.append(elm);
};

fluid.tests.simplifyTester.assertElmVisible = function (elm) {
    jqUnit.assertEquals("The element should be visible", "visible", $(elm).css("visibility"));
};

fluid.defaults("uioPlus.tests.simplifyNoNavToggleTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    markupFixture: ".uioPlusJS-test-simplify",
    components: {
        simplify: {
            type: "uioPlus.enactor.simplify",
            container: ".uioPlusJS-test-simplify",
            options: {
                injectNavToggle: false,
                model: {
                    simplify: false,
                    showNav: false
                }
            }
        },
        simplifyTester: {
            type: "fluid.tests.simplifyNoNavToggleTester"
        }
    }
});

uioPlus.tests.simplifyNoNavToggleTests.assertNoNavToggle = function (navToggleElm) {
    jqUnit.assertEquals("The nav toggle element should not exist", 0, navToggleElm.length);
};

fluid.defaults("fluid.tests.simplifyNoNavToggleTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "Simplification Tests ",
        tests: [{
            name: "No Nav Toggle",
            expect: 2,
            sequence: [{
                func: "{simplify}.applier.change",
                args: ["simplify", true]
            }, {
                changeEvent: "{simplify}.applier.modelChanged",
                path: "simplify",
                listener: "uioPlus.tests.simplifyNoNavToggleTests.assertNoNavToggle",
                args: ["{simplify}.dom.navToggle"]
            }, {
                func: "{simplify}.applier.change",
                args: ["simplify", false]
            }, {
                changeEvent: "{simplify}.applier.modelChanged",
                path: "simplify",
                listener: "uioPlus.tests.simplifyNoNavToggleTests.assertNoNavToggle",
                args: ["{simplify}.dom.navToggle"]
            }]
        }]
    }]
});

fluid.test.runTests([
    "uioPlus.tests.simplifyTests",
    "uioPlus.tests.simplifyNoNavToggleTests"
]);

/******************************************
 * table of contents enactor              *
 ******************************************/

fluid.defaults("uioPlus.tests.enactor.tableOfContents", {
    gradeNames: ["uioPlus.enactor.tableOfContents"],
    selectors: {
        tocContainer: ".flc-toc-tocContainer"
    },
    tocTemplate: "../../../node_modules/infusion/src/components/tableOfContents/html/TableOfContents.html",
    tocMessage: "../../../node_modules/infusion/src/framework/preferences/messages/tableOfContents-enactor.json",
    model: {
        toc: false
    }
});

fluid.defaults("uioPlus.tests.tocTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        toc: {
            type: "uioPlus.tests.enactor.tableOfContents",
            container: ".uioPlusJS-test-toc"
        },
        tocTester: {
            type: "uioPlus.tests.tocTester"
        }
    }
});

fluid.defaults("uioPlus.tests.tocTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "Table of Contents Tests",
        tests: [{
            name: "Model Changes",
            expect: 5,
            sequence: [{
                // The table of contents subcomponent is not initialized until the enactor is enabled for the first time.
                func: "uioPlus.tests.assertSubComponentNotCreated",
                args: ["{toc}", "tableOfContents"]
            }, {
                func: "{toc}.applier.change",
                args: ["toc", true]
            }, {
                event: "{toc}.events.afterTocRender",
                listener: "uioPlus.tests.tocTester.assertToc",
                args: ["{toc}", true]
            }, {
                func: "jqUnit.assertTrue",
                args: ["The model changed to true", "{toc}.model.toc"]
            }, {
                func: "{toc}.applier.change",
                args: ["toc", false]
            }, {
                changeEvent: "{toc}.applier.modelChanged",
                path: "toc",
                listener: "uioPlus.tests.tocTester.assertToc",
                args: ["{toc}", false]
            }]
        }]
    }]
});

uioPlus.tests.tocTester.assertToc = function (that, applied) {
    var tocElm = that.locate("tocContainer");
    if (applied) {
        jqUnit.isVisible("The Table of Contents should be visible", tocElm);
        jqUnit.assertTrue("The Table of Contents should be populated", tocElm.children("ul").length);
    } else {
        jqUnit.notVisible("The Table of Contents should not be visible", tocElm);
    }
};

/******************************************
 * text-to-speech enactor                 *
 ******************************************/

fluid.defaults("uioPlus.tests.enactor.selfVoicing", {
    gradeNames: ["uioPlus.enactor.selfVoicing"],
    model: {
        enabled: false
    }
});

fluid.defaults("uioPlus.tests.selfVoicingTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        selfVoicing: {
            type: "uioPlus.tests.enactor.selfVoicing",
            container: ".uioPlusJS-test-selfVoicing"
        },
        selfVoicingTester: {
            type: "uioPlus.tests.selfVoicingTester"
        }
    }
});

fluid.defaults("uioPlus.tests.selfVoicingTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [{
        name: "Self Voicing Tests",
        tests: [{
            name: "Model Changes",
            expect: 5,
            sequence: [{
                // The orator subcomponent is not initialized until the enactor is enabled for the first time.
                func: "uioPlus.tests.assertSubComponentNotCreated",
                args: ["{selfVoicing}", "orator"]
            }, {
                func: "{selfVoicing}.applier.change",
                args: ["enabled", true]
            }, {
                event: "{selfVoicing}.events.onInitOrator",
                spec: {priority: "last:testing"},
                listener: "uioPlus.tests.selfVoicingTester.assertOratorInit",
                args: ["{selfVoicing}"]
            }, {
                func: "{selfVoicing}.applier.change",
                args: ["enabled", false]
            }, {
                changeEvent: "{selfVoicing}.applier.modelChanged",
                spec: {path: "enabled", priority: "last:testing"},
                listener: "jqUnit.notVisible",
                args: ["The orator controller should no longer be visible", "{selfVoicing}.orator.controller.container"]
            }]
        }]
    }]
});

uioPlus.tests.selfVoicingTester.assertOratorInit = function (that) {
    var controller = that.orator.controller;
    var domReader = that.orator.domReader;

    jqUnit.assertTrue("The domReaders's container should be set properly", domReader.container.hasClass("flc-orator-content"));
    jqUnit.assertTrue("The controller's parentContainer should be set properly", controller.options.parentContainer.hasClass("flc-prefs-selfVoicingWidget"));
    jqUnit.isVisible("The orator controller should be visible", controller.container);
};

fluid.test.runTests([
    "uioPlus.tests.clickToSelectTests",
    "uioPlus.tests.selectionHighlightTests",
    "uioPlus.tests.simplifyTests",
    "uioPlus.tests.simplifyNoNavToggleTests",
    "uioPlus.tests.tocTests",
    "uioPlus.tests.selfVoicingTests"
]);
