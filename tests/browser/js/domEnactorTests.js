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

/* global fluid, jqUnit, chrome, uioPlus */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("uioPlus.tests");

        /*********************************************************************************************************
         * Chrome Mocks
         ********************************************************************************************************/

        // using the sinon-chrome stub, we return the correct path to the table of contents template
        chrome.runtime.getURL.withArgs("templates/TableOfContents.html")
                             .returns("../../../node_modules/infusion/src/components/tableOfContents/html/TableOfContents.html");

        chrome.runtime.getURL.withArgs("messages/tableOfContents-enactor.json")
                             .returns("../../../node_modules/infusion/src/framework/preferences/messages/tableOfContents-enactor.json");

        /*********************************************************************************************************
         * Common Assertions
         ********************************************************************************************************/

        uioPlus.tests.assertClasses = function (that, setting) {
            fluid.each(that.options.classes, function (className, settingName) {
                if (settingName === setting && className) {
                    jqUnit.assertTrue("The " + className + " class should be applied.", that.container.hasClass(className));
                } else if (className) {
                    jqUnit.assertFalse("The " + className + " class should not be applied.", that.container.hasClass(className));
                }
            });
        };

        uioPlus.tests.assertSubComponentNotCreated = function (that, subComponentName) {
            jqUnit.assertUndefined("The " + subComponentName + " subcomponent should not have be created yet.", that[subComponentName]);
        };

        /*********************************************************************************************************
         * Selection Highlight Tests
         ********************************************************************************************************/

        jqUnit.module("Selection Highlight Tests");

        uioPlus.tests.clearSelection = function () {
            window.getSelection()
                  .removeAllRanges();
        };

        uioPlus.tests.cloneSelectedNode = function () {
            return window.getSelection()
                         .getRangeAt(0)
                         .cloneContents()
                         .children[0];
        };

        jqUnit.test("uioPlus.chrome.enactor.selectionHighlight.selectParagraph tests", function () {
            uioPlus.tests.clearSelection();

            uioPlus.chrome.enactor.selectionHighlight.selectParagraph($(".gpii-test-selectionHighlight-nestedElm")[0]);
            var selectedParagraph = uioPlus.tests.cloneSelectedNode();
            jqUnit.assertTrue("The paragraph should be selected", $(selectedParagraph).is(".gpii-test-selectionHighlight-paragraph"));
            uioPlus.tests.clearSelection();

            uioPlus.chrome.enactor.selectionHighlight.selectParagraph($(".gpii-test-selectionHighlight-node")[0]);
            var selectedNode = uioPlus.tests.cloneSelectedNode();
            jqUnit.assertTrue("The node should be selected", $(selectedNode).is(".gpii-test-selectionHighlight-node"));
            uioPlus.tests.clearSelection();
        });

        uioPlus.tests.getContextMenuEvent = function (mousePressed) {
            var event = jQuery.Event("contextmenu");
            if (mousePressed) {
                event.button = 2;
            }
            return event;
        };

        uioPlus.tests.handleRightClickTestCases = [{
            model: {
                selectParagraph: true
            },
            event: uioPlus.tests.getContextMenuEvent()
        }, {
            model: {
                selectParagraph: false
            },
            event: uioPlus.tests.getContextMenuEvent()
        }, {
            model: {
                selectParagraph: true
            },
            event: uioPlus.tests.getContextMenuEvent(true)
        }, {
            model: {
                selectParagraph: false
            },
            event: uioPlus.tests.getContextMenuEvent(true)
        }];

        jqUnit.test("uioPlus.chrome.enactor.selectionHighlight.handleRightClick tests", function () {
            jqUnit.expect(3);

            fluid.each(uioPlus.tests.handleRightClickTestCases, function (testCase) {
                uioPlus.chrome.enactor.selectionHighlight.handleRightClick(testCase.model, testCase.event, function () {
                    jqUnit.assert("The rick click handler was fired");
                    jqUnit.assertEquals("The second button should have been pressed", 2, testCase.event.button);
                    jqUnit.assertTrue("The selectParagraph model value should be set to true", testCase.model.selectParagraph);
                });
            });
        });

        fluid.defaults("uioPlus.tests.selectionHighlightTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                selectionHighlight: {
                    type: "uioPlus.chrome.enactor.selectionHighlight",
                    container: ".gpii-test-selectionHighlight",
                    options: {
                        model: {
                            value: "default"
                        }
                    }
                },
                selectionHighlightTester: {
                    type: "uioPlus.tests.selectionHighlightTester"
                }
            }
        });

        uioPlus.tests.selectionHighlightTests.assertSelectedText = function (expectedSelector) {
            var selectedNode = uioPlus.tests.cloneSelectedNode();
            jqUnit.assertTrue("The node with selector '" + expectedSelector + "' should be selected", $(selectedNode).is(expectedSelector));
        };

        fluid.defaults("uioPlus.tests.selectionHighlightTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Selection Highlight Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 17,
                    sequence: [{
                        func: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{selectionHighlight}.model.value"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["value", "yellow"]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"yellow\"", "yellow", "{selectionHighlight}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{selectionHighlight}", "yellow"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["value", "pink"]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"pink\"", "pink", "{selectionHighlight}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{selectionHighlight}", "pink"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["value", "green"]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"green\"", "green", "{selectionHighlight}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{selectionHighlight}", "green"]
                    }, {
                        func: "{selectionHighlight}.applier.change",
                        args: ["value", "default"]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{selectionHighlight}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{selectionHighlight}", "default"]
                    }]
                }, {
                    name: "Paragraph selection",
                    expect: 4,
                    sequence: [{
                        func: "{selectionHighlight}.applier.change",
                        args: ["", {
                            value: "yellow",
                            selectParagraph: true
                        }]
                    }, {
                        changeEvent: "{selectionHighlight}.applier.modelChanged",
                        path: "",
                        listener: "jqUnit.assertTrue",
                        args: ["The selectParagraph model value is updated", "{selectionHighlight}.model.selectParagraph"]
                    }, {
                        jQueryTrigger: uioPlus.tests.getContextMenuEvent(true),
                        element: ".gpii-test-selectionHighlight-paragraph"
                    }, {
                        func: "uioPlus.tests.selectionHighlightTests.assertSelectedText",
                        args: [".gpii-test-selectionHighlight-paragraph"]
                    }, {
                        jQueryTrigger: uioPlus.tests.getContextMenuEvent(true),
                        element: ".gpii-test-selectionHighlight-nestedElm"
                    }, {
                        func: "uioPlus.tests.selectionHighlightTests.assertSelectedText",
                        args: [".gpii-test-selectionHighlight-paragraph"]
                    }, {
                        jQueryTrigger: uioPlus.tests.getContextMenuEvent(true),
                        element: $(".gpii-test-selectionHighlight-node")
                    }, {
                        func: "uioPlus.tests.selectionHighlightTests.assertSelectedText",
                        args: [".gpii-test-selectionHighlight-node"]
                    }]
                }]
            }]
        });

        /*********************************************************************************************************
         * High Contrast Tests
         ********************************************************************************************************/

        jqUnit.module("Contrast Tests");

        fluid.defaults("uioPlus.tests.contrastTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contrast: {
                    type: "uioPlus.chrome.enactor.contrast",
                    container: ".gpii-test-contrast",
                    options: {
                        model: {
                            value: "default"
                        }
                    }
                },
                contrastTester: {
                    type: "uioPlus.tests.contrastTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.contrastTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Contrast Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 65,
                    sequence: [{
                        func: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{contrast}.model.value"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "by"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"by\"", "by", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "by"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "yb"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"yb\"", "yb", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "yb"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "wb"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"wb\"", "wb", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "wb"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "bw"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"bw\"", "bw", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "bw"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "gd"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"gd\"", "gd", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "gd"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "gw"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"gw\"", "gw", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "gw"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "bbr"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"bbr\"", "bbr", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "bbr"]
                    }, {
                        func: "{contrast}.applier.change",
                        args: ["value", "default"]
                    }, {
                        changeEvent: "{contrast}.applier.modelChanged",
                        path: "value",
                        listener: "jqUnit.assertEquals",
                        args: ["The model.value should be set to \"default\"", "default", "{contrast}.model.value"]
                    }, {
                        func: "uioPlus.tests.assertClasses",
                        args: ["{contrast}", "default"]
                    }]
                }]
            }]
        });

        /*********************************************************************************************************
         * Line Space Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.lineSpaceTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                lineSpace: {
                    type: "uioPlus.chrome.enactor.lineSpace",
                    container: ".gpii-test-lineSpace",
                    options: {
                        model: {
                            value: 1
                        }
                    }
                },
                lineSpaceTester: {
                    type: "uioPlus.tests.lineSpaceTester"
                }
            }
        });

        uioPlus.tests.lineSpaceTests.assertLineSpace = function (that, expectedMultiplier, baseLineSpace) {
            baseLineSpace = baseLineSpace || 1.2;
            var expectedLineHeight = baseLineSpace * expectedMultiplier;
            jqUnit.assertEquals("The model value should be set to " + expectedMultiplier, expectedMultiplier, that.model.value);
            jqUnit.assertEquals("The line height should be set to " + expectedLineHeight, "line-height: " + expectedLineHeight + ";", that.container.attr("style"));
        };

        fluid.defaults("uioPlus.tests.lineSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Line Space Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 8,
                    sequence: [{
                        func: "uioPlus.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 1]
                    }, {
                        func: "{lineSpace}.applier.change",
                        args: ["value", 1.3]
                    }, {
                        changeEvent: "{lineSpace}.applier.modelChanged",
                        path: "value",
                        listener: "uioPlus.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 1.3]
                    }, {
                        func: "{lineSpace}.applier.change",
                        args: ["value", 2]
                    }, {
                        changeEvent: "{lineSpace}.applier.modelChanged",
                        path: "value",
                        listener: "uioPlus.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 2]
                    }, {
                        func: "{lineSpace}.applier.change",
                        args: ["value", 1]
                    }, {
                        changeEvent: "{lineSpace}.applier.modelChanged",
                        path: "value",
                        listener: "uioPlus.tests.lineSpaceTests.assertLineSpace",
                        args: ["{lineSpace}", 1]
                    }]
                }]
            }]
        });

        /*********************************************************************************************************
         * Character and Word Space Test Helpers
         ********************************************************************************************************/

        fluid.registerNamespace("uioPlus.tests.spacingSetterTester");

        fluid.defaults("uioPlus.tests.spacingSetter.modelChanges", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                func: "uioPlus.tests.spacingSetterTester.assertSpace",
                args: ["{spacingSetter}", "{testCaseHolder}.options.cssProp", 1, 0.2]
            }, {
                func: "{spacingSetter}.applier.change",
                args: ["value", 1.3]
            }, {
                changeEvent: "{spacingSetter}.applier.modelChanged",
                path: "value",
                listener: "uioPlus.tests.spacingSetterTester.assertSpace",
                args: ["{spacingSetter}", "{testCaseHolder}.options.cssProp", 1.3, 0.2]
            }, {
                func: "{spacingSetter}.applier.change",
                args: ["value", 2]
            }, {
                changeEvent: "{spacingSetter}.applier.modelChanged",
                path: "value",
                listener: "uioPlus.tests.spacingSetterTester.assertSpace",
                args: ["{spacingSetter}", "{testCaseHolder}.options.cssProp", 2, 0.2]
            }, {
                func: "{spacingSetter}.applier.change",
                args: ["value", 1]
            }, {
                changeEvent: "{spacingSetter}.applier.modelChanged",
                path: "value",
                listener: "uioPlus.tests.spacingSetterTester.assertSpace",
                args: ["{spacingSetter}", "{testCaseHolder}.options.cssProp", 1, 0.2]
            }]
        });

        fluid.defaults("uioPlus.tests.spacingSetter.sequences", {
            gradeNames: "fluid.test.sequence",
            sequenceElements: {
                modelChanges: {
                    gradeNames: "uioPlus.tests.spacingSetter.modelChanges",
                    priority: "after:end"
                }
            }
        });

        uioPlus.tests.spacingSetterTester.assertSpace = function (that, cssProp, expectedValue, baseSpace) {
            baseSpace = baseSpace || 0;
            var expectedUnit = fluid.roundToDecimal(expectedValue - 1, 2);
            var expectedSpacing = fluid.roundToDecimal(baseSpace + expectedUnit, 2) + "em";
            jqUnit.assertEquals("The model value should be set to " + expectedValue, expectedValue, that.model.value);
            jqUnit.assertEquals("The model unit should be set to " + expectedUnit, expectedUnit, that.model.unit);
            jqUnit.assertEquals("The " + cssProp + " should be set to " + expectedSpacing, cssProp + ": " + expectedSpacing + ";", that.container.attr("style"));
        };

        /*********************************************************************************************************
         * Character Space Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.charSpaceTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                charSpace: {
                    type: "fluid.prefs.enactor.letterSpace",
                    container: ".gpii-test-charSpace",
                    options: {
                        model: {
                            value: 1
                        }
                    }
                },
                charSpaceTester: {
                    type: "uioPlus.tests.charSpaceTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.charSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            cssProp: "letter-spacing",
            modules: [{
                name: "Character Space Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 12,
                    sequenceGrade: "uioPlus.tests.spacingSetter.sequences"
                }]
            }]
        });

        /*********************************************************************************************************
         * Word Space Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.wordSpaceTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                wordSpace: {
                    type: "fluid.prefs.enactor.wordSpace",
                    container: ".gpii-test-wordSpace",
                    options: {
                        model: {
                            value: 1
                        }
                    }
                },
                wordSpaceTester: {
                    type: "uioPlus.tests.wordSpaceTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.wordSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            cssProp: "word-spacing",
            modules: [{
                name: "Word Space Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 12,
                    sequenceGrade: "uioPlus.tests.spacingSetter.sequences"
                }]
            }]
        });

        /*********************************************************************************************************
         * Inputs Larger Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.inputsLargerTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                inputsLarger: {
                    type: "uioPlus.chrome.enactor.inputsLarger",
                    container: ".gpii-test-inputsLarger",
                    options: {
                        model: {
                            value: false
                        }
                    }
                },
                inputsLargerTester: {
                    type: "uioPlus.tests.inputsLargerTester"
                }
            }
        });

        uioPlus.tests.inputsLargerTests.assertClass = function (that, applied) {
            var enhanceClass = that.options.cssClass;

            if (applied) {
                jqUnit.assertEquals("Inputs Larger should be enabled", applied, that.model.value);
                jqUnit.assertTrue("The " + enhanceClass + " class should be applied", that.container.hasClass(enhanceClass));
            } else {
                jqUnit.assertEquals("Inputs Larger should be disabled", applied, that.model.value);
                jqUnit.assertFalse("The " + enhanceClass + " class should not be applied", that.container.hasClass(enhanceClass));
            }
        };

        fluid.defaults("uioPlus.tests.inputsLargerTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "Inputs Larger Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 6,
                    sequence: [{
                        func: "uioPlus.tests.inputsLargerTests.assertClass",
                        args: ["{inputsLarger}", false]
                    }, {
                        func: "{inputsLarger}.applier.change",
                        args: ["value", true]
                    }, {
                        changeEvent: "{inputsLarger}.applier.modelChanged",
                        path: "value",
                        listener: "uioPlus.tests.inputsLargerTests.assertClass",
                        args: ["{inputsLarger}", true]
                    }, {
                        func: "{inputsLarger}.applier.change",
                        args: ["value", false]
                    }, {
                        changeEvent: "{inputsLarger}.applier.modelChanged",
                        path: "value",
                        listener: "uioPlus.tests.inputsLargerTests.assertClass",
                        args: ["{inputsLarger}", false]
                    }]
                }]
            }]
        });

        /*********************************************************************************************************
         * Table of Contents Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.tocTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                toc: {
                    type: "uioPlus.chrome.enactor.tableOfContents",
                    container: ".gpii-test-toc",
                    options: {
                        selectors: {
                            tocContainer: ".flc-toc-tocContainer"
                        },
                        model: {
                            toc: false
                        }
                    }
                },
                tocTester: {
                    type: "uioPlus.tests.tocTester"
                }
            }
        });

        uioPlus.tests.tocTests.assertToc = function (that, applied) {
            var tocElm = that.locate("tocContainer");
            if (applied) {
                jqUnit.isVisible("The Table of Contents should be visible", tocElm);
                jqUnit.assertTrue("The Table of Contents should be populated", tocElm.children("ul").length);
            } else {
                jqUnit.notVisible("The Table of Contents should not be visible", tocElm);
            }
        };

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
                        listener: "uioPlus.tests.tocTests.assertToc",
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
                        listener: "uioPlus.tests.tocTests.assertToc",
                        args: ["{toc}", false]
                    }]
                }]
            }]
        });

        /*********************************************************************************************************
         * Self Voicing Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.selfVoicingTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                selfVoicing: {
                    type: "uioPlus.chrome.enactor.selfVoicing",
                    container: ".gpii-test-selfVoicing",
                    options: {
                        model: {
                            enabled: false
                        }
                    }
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

        /*********************************************************************************************************
         * Syllabification Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.syllabificationTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                syllabification: {
                    type: "uioPlus.chrome.enactor.syllabification",
                    container: ".gpii-test-syllabification",
                    options: {
                        terms: {
                            patternPrefix: "../../../node_modules/infusion/src/lib/hypher/patterns"
                        },
                        model: {
                            enabled: false
                        }
                    }
                },
                syllabificationTester: {
                    type: "uioPlus.tests.syllabificationTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.syllabificationTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                text: "Global temperature has increased over the past 50 years.",
                syllabified: [{
                    type: Node.TEXT_NODE,
                    text: "Global tem"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "per"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "a"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "ture has in"
                }, {
                    type: Node.ELEMENT_NODE
                }, {
                    type: Node.TEXT_NODE,
                    text: "creased over the past 50 years."
                }],
                injectRequestMessage: {
                    type: "uioPlus.chrome.contentScriptInjectionRequest",
                    src: "../../../node_modules/infusion/src/lib/hypher/patterns/en-us.js"
                }
            },
            modules: [{
                name: "Syllabification Tests",
                tests: [{
                    name: "Model Changes",
                    expect: 25,
                    sequence: [{
                        func: "uioPlus.tests.syllabificationTester.setup"
                    }, {
                        func: "uioPlus.tests.syllabificationTester.assertUnsyllabified",
                        args: ["Init", "{syllabification}", "{that}.options.testOpts.text"]
                    }, {
                        func: "{syllabification}.applier.change",
                        args: ["enabled", true]
                    }, {
                        event: "{syllabification}.events.afterSyllabification",
                        priority: "last:testing",
                        listener: "uioPlus.tests.syllabificationTester.assertInjectionCall",
                        args: ["Syllabified", 0, "{that}.options.testOpts.injectRequestMessage"]
                    }, {
                        func: "uioPlus.tests.syllabificationTester.assertSyllabified",
                        args: ["Syllabified", "{syllabification}", "{that}.options.testOpts.syllabified", "{that}.options.testOpts.text"]
                    }, {
                        func: "{syllabification}.applier.change",
                        args: ["enabled", false]
                    }, {
                        changeEvent: "{syllabification}.applier.modelChanged",
                        spec: {path: "enabled", priority: "last:testing"},
                        listener: "uioPlus.tests.syllabificationTester.assertUnsyllabified",
                        args: ["Syllabification Removed", "{syllabification}", "{that}.options.testOpts.text"]
                    }, {
                        // tear down
                        func: "uioPlus.tests.syllabificationTester.tearDown"
                    }]
                }]
            }]
        });

        uioPlus.tests.syllabificationTester.setup = function () {
            var browserInject = function (msg, callback) {
                var injectPromise = $.ajax({
                    url: msg.src,
                    datatype: "script",
                    cache: true
                });
                injectPromise.then(callback);
            };
            chrome.runtime.sendMessage.callsFake(browserInject);
        };

        uioPlus.tests.syllabificationTester.tearDown = function () {
            chrome.runtime.sendMessage.flush();
        };

        uioPlus.tests.syllabificationTester.assertInjectionCall = function (prefix, callNum, expectedMessage) {
            var result = chrome.runtime.sendMessage.getCall(callNum).calledWith(expectedMessage);
            jqUnit.assertTrue(prefix + ": Call index #" + callNum + " of chrome.runtime.sendMessage should have been called with the correct message", result);
        };

        uioPlus.tests.syllabificationTester.assertUnsyllabified = function (prefix, that, expectedText) {
            jqUnit.assertEquals(prefix + ": The text value should be correct", expectedText, that.container.text());
            jqUnit.assertEquals(prefix + ": There should be no separator elements", 0, that.locate("separator").length);
        };

        uioPlus.tests.syllabificationTester.assertSyllabified = function (prefix, that, syllabified, expectedText) {
            var childNodes = that.container[0].childNodes;
            var separatorCount = 0;

            jqUnit.assertEquals(prefix + ": The text for is returned correctly", expectedText, that.container.text());

            fluid.each(syllabified, function (expected, index) {
                var childNode = childNodes[index];
                jqUnit.assertEquals(prefix + ": The childNode at index \"" + index + "\", is the correct node type", expected.type, childNode.nodeType);

                if (expected.type === Node.TEXT_NODE) {
                    jqUnit.assertEquals(prefix + ": The childNode at index \"" + index + "\", has the correct text content", expected.text, childNode.textContent);
                } else {
                    separatorCount += 1;
                    jqUnit.assertTrue(prefix + ": The childNode at index \"" + index + "\", is a separator", $(childNode).is(that.options.selectors.separator));
                }
            });

            jqUnit.assertEquals(prefix + ": The correct number of separator elements are added", separatorCount, that.locate("separator").length);
        };

        /*********************************************************************************************************
         * domEnactor Tests
         ********************************************************************************************************/

        fluid.defaults("uioPlus.tests.domEnactorTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                domEnactor: {
                    type: "uioPlus.chrome.domEnactor",
                    container: ".gpii-test-domEnactor"
                },
                domEnactorTester: {
                    type: "uioPlus.tests.domEnactorTester"
                }
            }
        });

        uioPlus.tests.domEnactorTests.assertConnection = function (that) {
            jqUnit.assertTrue("Connection only triggered once", chrome.runtime.connect.calledOnce);
            jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: "domEnactor-" + that.id}));
        };

        uioPlus.tests.domEnactorTests.assertHasGrade = function (that, grade, expected) {
            jqUnit.assertEquals("The " + grade + " grade should " + (expected ? "" : "not ") + "be applied", expected, fluid.hasGrade(that.options, grade));
        };

        fluid.defaults("uioPlus.tests.domEnactorTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                messages: {
                    one: {
                        type: "uioPlus.chrome.writeRequest",
                        id: "test-1",
                        payload: {settings: {testOne: 1}}
                    },
                    two: {
                        type: "uioPlus.chrome.writeRequest",
                        id: "test-2",
                        payload: {settings: {testTwo: 2}}
                    }
                }
            },
            events: {
                onMessageReceived: null
            },
            modules: [{
                name: "domEnactor Tests",
                tests: [{
                    name: "Port Connection",
                    expect: 4,
                    sequence: [{
                        func: "uioPlus.tests.domEnactorTests.assertConnection",
                        args: ["{domEnactor}"]
                    }, {
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{domEnactor}.portBinding.port", "{that}.options.testOpts.messages.one"]
                    }, {
                        event: "{domEnactor}.events.onIncomingSettings",
                        listener: "jqUnit.assertDeepEq",
                        priority: "last:testing",
                        args: ["The onIncomingSettings event was fired", "{that}.options.testOpts.messages.one.payload.settings", "{arguments}.0"]
                    }, {
                        func: "uioPlus.tests.mockPort.trigger.onMessage",
                        args: ["{domEnactor}.portBinding.port", "{that}.options.testOpts.messages.two"]
                    }, {
                        changeEvent: "{domEnactor}.applier.modelChanged",
                        path: "testTwo",
                        listener: "jqUnit.assertEquals",
                        args: ["The model should have been updated after receiving the message", "{that}.options.testOpts.messages.two.payload.settings.testTwo", "{domEnactor}.model.testTwo"]
                    }]
                }, {
                    name: "Simplification",
                    expect: 2,
                    sequence: [{
                        func: "uioPlus.tests.domEnactorTests.assertHasGrade",
                        args: ["{domEnactor}", "uioPlus.chrome.domEnactor.simplify", true]
                    }, {
                        func: "jqUnit.assertValue",
                        args: ["The simplify subcomponent should have been added", "{domEnactor}.simplify"]
                    }]
                }]
            }]
        });

        fluid.defaults("uioPlus.tests.domEnactorWithoutSimplificationTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            events: {
                afterSetup: null
            },
            components: {
                domEnactor: {
                    type: "uioPlus.chrome.domEnactor",
                    container: ".gpii-test-domEnactor",
                    createOnEvent: "afterSetup"
                },
                domEnactorTester: {
                    type: "uioPlus.tests.domEnactorWithoutSimplificationTester",
                    createOnEvent: "afterSetup"
                }
            },
            listeners: {
                "onCreate.setup": {
                    listener: "uioPlus.tests.domEnactorWithoutSimplificationTests.setup",
                    priority: "first"
                }
            }
        });

        uioPlus.tests.domEnactorWithoutSimplificationTests.setup = function (that) {
            fluid.contextAware.forgetChecks(["uioPlus.chrome.allowSimplification"]);
            that.events.afterSetup.fire();
        };

        fluid.defaults("uioPlus.tests.domEnactorWithoutSimplificationTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [{
                name: "domEnactor without Simplify Tests",
                tests: [{
                    name: "Simplification",
                    expect: 2,
                    sequence: [{
                        func: "uioPlus.tests.domEnactorTests.assertHasGrade",
                        args: ["{domEnactor}", "uioPlus.tests.domEnactorTests.assertHasGrade", false]
                    }, {
                        func: "jqUnit.assertUndefined",
                        args: ["The simplify subcomponent should not have been added", "{domEnactor}.simplify"]
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "uioPlus.tests.selectionHighlightTests",
            "uioPlus.tests.contrastTests",
            "uioPlus.tests.lineSpaceTests",
            "uioPlus.tests.charSpaceTests",
            "uioPlus.tests.wordSpaceTests",
            "uioPlus.tests.inputsLargerTests",
            "uioPlus.tests.tocTests",
            "uioPlus.tests.selfVoicingTests",
            "uioPlus.tests.syllabificationTests",
            "uioPlus.tests.domEnactorTests",
            "uioPlus.tests.domEnactorWithoutSimplificationTests"
        ]);
    });
})(jQuery);
