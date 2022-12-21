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

/* global jqUnit, uio, uioPlus, chrome */

"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("uioPlus.tests");

        jqUnit.test("Test instantiated UIO", function () {
            // Initial Instantiation
            jqUnit.assertNotUndefined("UIO enhancer has been instantiated", uio);
            jqUnit.assertEquals("The enhancer acts on the body element", "body", uio.container.selector);
            uioPlus.tests.verifySubcomponentsExist(uio, ["store", "enhancer"]);
            uioPlus.tests.verifySubcomponentsExist(uio.enhancer.uiEnhancer, [
                "fluid_prefs_enactor_letterSpace",
                "fluid_prefs_enactor_wordSpace",
                "fluid_prefs_enactor_lineSpace",
                "fluid_prefs_enactor_syllabification",
                "fluid_prefs_enactor_contrast",
                "fluid_prefs_enactor_enhanceInputs",
                "uioPlus_enactor_clickToSelect",
                "uioPlus_enactor_selectionHighlight",
                "uioPlus_enactor_selfVoicing",
                "uioPlus_enactor_simplify",
                "uioPlus_enactor_tableOfContents"
            ]);

            // Letter space
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_letterSpace: 1.5
            });
            jqUnit.assertEquals("The --fl-letterSpace value is set properly", "0.5em", document.body.style.getPropertyValue("--fl-letterSpace"));
            jqUnit.assertEquals("The --fl-letterSpace-factor value is set properly", "0.5", document.body.style.getPropertyValue("--fl-letterSpace-factor"));
            jqUnit.assertTrue("The fl-letterSpace-enabled class is applied properly", document.body.classList.contains("fl-letterSpace-enabled"));

            // Word space
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_wordSpace: 1.5
            });
            jqUnit.assertEquals("The --fl-wordSpace value is set properly", "0.5em", document.body.style.getPropertyValue("--fl-wordSpace"));
            jqUnit.assertEquals("The --fl-wordSpace-factor value is set properly", "0.5", document.body.style.getPropertyValue("--fl-wordSpace-factor"));
            jqUnit.assertTrue("The fl-wordSpace-enabled class is applied properly", document.body.classList.contains("fl-wordSpace-enabled"));

            // Line space
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_lineSpace: 1.5
            });
            // As the calculation of line space value depends on the base font size of the browsser that
            // the test is running in, only check the existence of this value instead of its actual number.
            jqUnit.assertNotUndefined("The --fl-lineSpace value is set properly", document.body.style.getPropertyValue("--fl-lineSpace"));
            jqUnit.assertEquals("The --fl-lineSpace-factor value is set properly", "1.5", document.body.style.getPropertyValue("--fl-lineSpace-factor"));
            jqUnit.assertTrue("The fl-lineSpace-enabled class is applied properly", document.body.classList.contains("fl-lineSpace-enabled"));

            // Syllabification
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_syllabification: true
            });
            jqUnit.assertTrue("The model value is properly relayed to the syllabification enactor", uio.enhancer.uiEnhancer.fluid_prefs_enactor_syllabification.model.enabled);
            jqUnit.assertEquals("The patternPrefix has been set properly", "lib/infusion/src/lib/hypher/patterns", uio.enhancer.uiEnhancer.fluid_prefs_enactor_syllabification.options.terms.patternPrefix);
            jqUnit.assertEquals("The injectScript function is properly set", "uioPlus.contentScript.requestInjection", uio.enhancer.uiEnhancer.fluid_prefs_enactor_syllabification.options.invokers.injectScript.funcName);

            // Contrast
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_contrast: "bw"
            });
            jqUnit.assertTrue("The fl-theme-bw class is applied properly", document.body.classList.contains("fl-theme-bw"));

            // Enhance inputs
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_enhanceInputs: true
            });
            jqUnit.assertTrue("The css class for enhancing inputs is applied properly", document.body.classList.contains("fl-input-enhanced"));

            // Speak
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_speak: true
            });
            jqUnit.assertTrue("The correct enactor is in use", "uioPlus.enactor.selfVoicing", uio.enhancer.uiEnhancer.uioPlus_enactor_selfVoicing.typeName);
            jqUnit.assertTrue("The model value is properly relayed to the selfVoicing enactor", uio.enhancer.uiEnhancer.uioPlus_enactor_selfVoicing.model.enabled);

            // Table of contents
            uio.enhancer.uiEnhancer.applier.change("", {
                fluid_prefs_tableOfContents: true
            });
            jqUnit.assertTrue("The correct enactor is in use", "uioPlus.enactor.tableOfContents", uio.enhancer.uiEnhancer.uioPlus_enactor_tableOfContents.typeName);
            jqUnit.assertTrue("The model value is properly relayed to the tableOfContents enactor", uio.enhancer.uiEnhancer.uioPlus_enactor_tableOfContents.model.toc);

            // Click to select
            uio.enhancer.uiEnhancer.applier.change("", {
                uioPlus_prefs_clickToSelect: true
            });
            jqUnit.assertTrue("The correct enactor is in use", "uioPlus.enactor.clickToSelect", uio.enhancer.uiEnhancer.uioPlus_enactor_clickToSelect.typeName);
            jqUnit.assertTrue("The model value is properly relayed to the clickToSelect enactor", uio.enhancer.uiEnhancer.uioPlus_enactor_clickToSelect.model.value);

            // Highlight
            uio.enhancer.uiEnhancer.applier.change("", {
                uioPlus_prefs_highlight: true
            });
            jqUnit.assertTrue("The correct enactor is in use", "uioPlus.enactor.highlight", uio.enhancer.uiEnhancer.uioPlus_enactor_selectionHighlight.typeName);
            jqUnit.assertTrue("The model value is properly relayed to the highlight enactor", uio.enhancer.uiEnhancer.uioPlus_enactor_selectionHighlight.model.value);

            // Simplify
            uio.enhancer.uiEnhancer.applier.change("", {
                uioPlus_prefs_simplify: true
            });
            jqUnit.assertTrue("The correct enactor is in use", "uioPlus.enactor.simplify", uio.enhancer.uiEnhancer.uioPlus_enactor_simplify.typeName);
            jqUnit.assertTrue("The model value is properly relayed to the simplify enactor", uio.enhancer.uiEnhancer.uioPlus_enactor_simplify.model.simplify);
            jqUnit.assertFalse("The model value is properly relayed to the simplify enactor", uio.enhancer.uiEnhancer.uioPlus_enactor_simplify.model.showNav);
        });

        jqUnit.test("Test uioPlus.contentScript.requestInjection()", function () {
            uioPlus.contentScript.requestInjection("/test/injection.js");
            jqUnit.assertEquals("The chrome send message API is called", 1, chrome.runtime.sendMessage.callCount);
            jqUnit.assertDeepEq("The chrome send message API receives correct arguments", {
                type: "uioPlus.requestContentScriptInjection",
                src: ["/test/injection.js"]
            }, chrome.runtime.sendMessage.getCall(0).args[0]);
            jqUnit.assertTrue("The returned value is a function", typeof chrome.runtime.sendMessage.returnsArg === "function");
        });

        jqUnit.test("Test chrome.storage.onChanged listener", function () {
            const onChangedListener = chrome.storage.onChanged._listeners[0];
            jqUnit.assertTrue("chrome.storage.onChanged has a listener", typeof onChangedListener === "function");

            // Trigger the listener and test the result
            const initialModel = uio.enhancer.uiEnhancer.initialModel;
            const testCases = [
                {
                    areaName: "local",
                    changes: {
                        preferences: {
                            newValue: {
                                fluid_prefs_tableOfContents: true
                            }
                        }
                    },
                    shouldChangeApply: true
                },
                {
                    areaName: "random",
                    changes: {
                        preferences: {
                            newValue: {
                                fluid_prefs_tableOfContents: true
                            }
                        }
                    },
                    shouldChangeApply: false
                },
                {
                    areaName: "local",
                    changes: {
                        fluid_prefs_tableOfContents: true
                    },
                    shouldChangeApply: false
                }
            ];

            testCases.forEach((oneTestCase) => {
                onChangedListener(oneTestCase.changes, oneTestCase.areaName);
                if (oneTestCase.shouldChangeApply) {
                    jqUnit.assertDeepEq("The listener applies new values to the uiEnhancer model",
                        {...uio.enhancer.uiEnhancer.initialModel.preferences, ...oneTestCase.changes.preferences.newValue},
                        uio.enhancer.uiEnhancer.model
                    );
                    // Reset the uiEnhancer model back to the initial for the next test to run
                    uio.enhancer.uiEnhancer.updateModel(initialModel);
                }
            });
        });
    });
})(jQuery);
