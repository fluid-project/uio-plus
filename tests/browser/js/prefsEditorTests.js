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

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("uioPlus.tests");

        uioPlus.tests.runTests = function (that) {
            uioPlus.tests.verifySubcomponentsExist(that, ["store", "enhancer", "prefsEditorLoader"]);
            uioPlus.tests.verifySubcomponentsExist(that.prefsEditorLoader.prefsEditor, [
                "fluid_prefs_panel_letterSpace",
                "fluid_prefs_panel_wordSpace",
                "fluid_prefs_panel_lineSpace",
                "fluid_prefs_panel_syllabification",
                "fluid_prefs_panel_speak",
                "fluid_prefs_panel_contrast",
                "fluid_prefs_panel_enhanceInputs",
                "fluid_prefs_panel_layoutControls",
                "uioPlus_prefs_panel_clickToSelect",
                "uioPlus_prefs_panel_highlight",
                "uioPlus_prefs_panel_zoom",
                "uioPlus_prefs_panel_simplify"
            ]);

            const prefsEditor = that.prefsEditorLoader.prefsEditor;
            jqUnit.assertTrue("The panel index grade are distributed properly", prefsEditor.options.gradeNames.includes("uioPlus.prefsEditor.panelIndex"));
            jqUnit.assertTrue("The arrow scrolling grade are distributed properly", prefsEditor.options.gradeNames.includes("fluid.prefs.arrowScrolling"));
            jqUnit.assertTrue("Auto save is set to true", prefsEditor.options.autoSave);

            const prefsContainers = [
                ".flc-prefsEditor-uioPlus_prefs_zoom",
                ".flc-prefsEditor-fluid_prefs_letterSpace",
                ".flc-prefsEditor-fluid_prefs_wordSpace",
                ".flc-prefsEditor-fluid_prefs_lineSpace",
                ".flc-prefsEditor-fluid_prefs_syllabification",
                ".flc-prefsEditor-fluid_prefs_contrast",
                ".flc-prefsEditor-uioPlus_prefs_clickToSelect",
                ".flc-prefsEditor-uioPlus_prefs_highlight",
                ".flc-prefsEditor-fluid_prefs_speak",
                ".flc-prefsEditor-fluid_prefs_tableOfContents",
                ".flc-prefsEditor-fluid_prefs_enhanceInputs",
                ".flc-prefsEditor-uioPlus_prefs_simplify"
            ];
            prefsContainers.forEach((oneContainer) => {
                jqUnit.assertNotUndefined(oneContainer + " is rendered", that.container[0].querySelector(oneContainer));
            });

            jqUnit.start();
        };

        jqUnit.asyncTest("Test UIO+ prefs editor", function () {
            uioPlus.prefsEditor(".uioPlus", {
                auxiliarySchema: {
                    terms: {
                        // adjust paths
                        templatePrefix: "../../../node_modules/infusion/src/framework/preferences/html",
                        messagePrefix: "../../../node_modules/infusion/src/framework/preferences/messages",
                        localTemplatePrefix: "../../../src/templates",
                        localMessagePrefix: "../../../src/messages"
                    }
                },
                listeners: {
                    "onPrefsEditorReady.runTests": {
                        listener: "uioPlus.tests.runTests",
                        args: ["{that}"]
                    }
                }
            });

        });
    });
})(jQuery);
