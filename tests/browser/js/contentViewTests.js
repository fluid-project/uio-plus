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

/* global fluid, jqUnit, uioPlus */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("uioPlus.tests");

        fluid.defaults("uioPlus.tests.chrome.contentView", {
            gradeNames: ["uioPlus.chrome.contentView"],
            selectors: {
                toFind: "span"
            }
        });

        uioPlus.tests.chrome.contentView.asssertSelection = function (that, prefix, selection, selectorName, expected) {
            expected = $(expected);
            var selector = that.options.selectors[selectorName];

            jqUnit.assertEquals(prefix + ": " + expected.length + " element(s) were found.", expected.length, selection.length);

            selection.each(function (idx, elm) {
                elm = $(elm);
                jqUnit.assertTrue(prefix + ": The element at index " + idx + " matches the selector \"" + selector + "\"", elm.is(selector));
                jqUnit.assertTrue(prefix + ": The element at index " + idx + " is in the expected set", elm.is(expected));
            });
        };

        uioPlus.tests.chrome.contentView.assertSearch = function (that, prefix, method, expected) {
            var selection = that[method]("toFind");
            uioPlus.tests.chrome.contentView.asssertSelection(that, prefix + " - " + method, selection, "toFind", expected);
        };

        fluid.defaults("uioPlus.tests.contentView.check", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                func: "uioPlus.tests.chrome.contentView.asssertSelection",
                args: [
                    "{contentView}",
                    "{testCaseHolder}.options.testOpts.prefix",
                    "{contentView}.content",
                    "{testCaseHolder}.options.testOpts.selector",
                    "{testCaseHolder}.options.testOpts.expectedSelection"
                ]
            }, {
                func: "uioPlus.tests.chrome.contentView.assertSearch",
                args: [
                    "{contentView}",
                    "{testCaseHolder}.options.testOpts.prefix",
                    "locateInContent",
                    "{testCaseHolder}.options.testOpts.expectedInContent"
                ]
            }, {
                func: "uioPlus.tests.chrome.contentView.assertSearch",
                args: [
                    "{contentView}",
                    "{testCaseHolder}.options.testOpts.prefix",
                    "locateOutOfContent",
                    "{testCaseHolder}.options.testOpts.expectedOutOfContent"
                ]
            }]
        });

        fluid.defaults("uioPlus.tests.contentView.priority", {
            gradeNames: "fluid.test.sequence",
            sequenceElements: {
                main: {
                    gradeNames: "uioPlus.tests.contentView.check"
                }
            }
        });

        /******************************************************
         * Found Article Content
         ******************************************************/

        fluid.defaults("uioPlus.tests.contentViewArticleTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "uioPlus.tests.chrome.contentView",
                    container: ".uioPlusJS-contentView-article"
                },
                contentViewTester: {
                    type: "uioPlus.tests.contentViewArticleTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.contentViewArticleTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "Article",
                selector: "article",
                expectedSelection: ".uioPlusJS-contentView-articleSelection",
                expectedInContent: ".uioPlusJS-contentView-articleSelection-inContent",
                expectedOutOfContent: ".uioPlusJS-contentView-articleSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "Article Content",
                    sequenceGrade: "uioPlus.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * Found Main Content
         ******************************************************/

        fluid.defaults("uioPlus.tests.contentViewMainTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "uioPlus.tests.chrome.contentView",
                    container: ".uioPlusJS-contentView-main"
                },
                contentViewTester: {
                    type: "uioPlus.tests.contentViewMainTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.contentViewMainTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "Main",
                selector: "main",
                expectedSelection: ".uioPlusJS-contentView-mainSelection",
                expectedInContent: ".uioPlusJS-contentView-mainSelection-inContent",
                expectedOutOfContent: ".uioPlusJS-contentView-mainSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "Main Content",
                    sequenceGrade: "uioPlus.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * Found Generic Content
         ******************************************************/

        fluid.defaults("uioPlus.tests.contentViewGenericTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "uioPlus.tests.chrome.contentView",
                    container: ".uioPlusJS-contentView-genericContent"
                },
                contentViewTester: {
                    type: "uioPlus.tests.contentViewGenericTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.contentViewGenericTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "Generic",
                selector: "genericContent",
                expectedSelection: ".uioPlusJS-contentView-genericSelection",
                expectedInContent: ".uioPlusJS-contentView-genericSelection-inContent",
                expectedOutOfContent: ".uioPlusJS-contentView-genericSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "Generic Content",
                    sequenceGrade: "uioPlus.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * All Content types present
         ******************************************************/

        fluid.defaults("uioPlus.tests.contentViewAllTypesTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "uioPlus.tests.chrome.contentView",
                    container: ".uioPlusJS-contentView-allContent"
                },
                contentViewTester: {
                    type: "uioPlus.tests.contentViewAllTypesTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.contentViewAllTypesTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "All Content Types",
                selector: "main",
                expectedSelection: ".uioPlusJS-contentView-allSelection",
                expectedInContent: ".uioPlusJS-contentView-allSelection-inContent",
                expectedOutOfContent: ".uioPlusJS-contentView-allSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "All Content Types",
                    sequenceGrade: "uioPlus.tests.contentView.priority"
                }]
            }]
        });

        /******************************************************
         * No Content types present
         ******************************************************/

        fluid.defaults("uioPlus.tests.contentViewNoTypesTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contentView: {
                    type: "uioPlus.tests.chrome.contentView",
                    container: ".uioPlusJS-contentView-noContent"
                },
                contentViewTester: {
                    type: "uioPlus.tests.contentViewNoTypesTester"
                }
            }
        });

        fluid.defaults("uioPlus.tests.contentViewNoTypesTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                prefix: "No Content Types",
                selector: "article",
                expectedSelection: ".uioPlusJS-contentView-noSelection",
                expectedInContent: ".uioPlusJS-contentView-noSelection-inContent",
                expectedOutOfContent: ".uioPlusJS-contentView-noSelection-outOfContent"
            },
            modules: [{
                name: "Content View Tests",
                tests: [{
                    name: "No Content Types",
                    sequenceGrade: "uioPlus.tests.contentView.priority"
                }]
            }]
        });

        fluid.test.runTests([
            "uioPlus.tests.contentViewArticleTests",
            "uioPlus.tests.contentViewMainTests",
            "uioPlus.tests.contentViewGenericTests",
            "uioPlus.tests.contentViewAllTypesTests",
            "uioPlus.tests.contentViewNoTypesTests"
        ]);

    });
})(jQuery);
