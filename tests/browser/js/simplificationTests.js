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

        jqUnit.module("Simplification Tests");

        jqUnit.test("Initialization - simplify disabled", function () {
            jqUnit.expect(3);
            var that = uioPlus.simplify(".uioPlusJS-simplify-init", {model: {simplify: false}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
            jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
        });

        jqUnit.test("Initialization - simplify enabled", function () {
            jqUnit.expect(3);
            var that = uioPlus.simplify(".uioPlusJS-simplify-init", {model: {simplify: true}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertEquals("Visibility styling on the container should have been set", "hidden", that.container.css("visibility"));
            jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
        });

        jqUnit.test("Initialization - simplify enabled, wth nav", function () {
            jqUnit.expect(6);
            var that = uioPlus.simplify(".uioPlusJS-simplify-init-withNav", {model: {simplify: true}});
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
            var that = uioPlus.simplify(".uioPlusJS-simplify-init-noContent", {model: {simplify: true}});
            var navToggle = that.locate("navToggle");

            jqUnit.assertValue("The simplify enactor should have initialized", that);
            jqUnit.assertFalse("Visibility styling on the container should not have been set", that.container.attr("style"));
            jqUnit.assertEquals("The navigation toggle button should not be inserted", 0, navToggle.length);
            jqUnit.assertEquals("Should not have found any content elements", 0, that.content.length);
        });

        jqUnit.test("findNav - generic", function () {
            jqUnit.expect(1);
            var that = uioPlus.simplify(".uioPlusJS-simplify-navigation");

            jqUnit.assertEquals("Should have found all of the nav elements", 6, that.nav.length);
        });


        fluid.defaults("uioPlus.tests.simplifyTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            markupFixture: ".gpii-test-simplify",
            components: {
                simplify: {
                    type: "uioPlus.simplify",
                    container: ".gpii-test-simplify",
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
            markupFixture: ".gpii-test-simplify",
            components: {
                simplify: {
                    type: "uioPlus.simplify",
                    container: ".gpii-test-simplify",
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
    });
})(jQuery);
