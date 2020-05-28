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

/* global fluid, uioPlus */
"use strict";

(function ($, fluid) {

    // TODO: if possible automate the model transformation bindings so we don't
    //       have to know the model paths ahead of time.
    fluid.defaults("uioPlus.chrome.prefs.extensionPanel.store", {
        gradeNames: ["uioPlus.chrome.portBinding.store"],
        portName: "extensionPanel",
        rules: {
            "panelIndex": "panelIndex",
            "preferences.fluid_prefs_enhanceInputs": "settings.inputsLargerEnabled",
            "preferences.fluid_prefs_letterSpace": "settings.characterSpace",
            "preferences.fluid_prefs_speak": "settings.selfVoicingEnabled",
            "preferences.fluid_prefs_syllabification": "settings.syllabificationEnabled",
            "preferences.fluid_prefs_tableOfContents": "settings.tableOfContentsEnabled",
            "preferences.uioPlus_chrome_prefs_contrast": "settings.contrastTheme",
            "preferences.uioPlus_chrome_prefs_clickToSelect": "settings.clickToSelectEnabled",
            "preferences.uioPlus_chrome_prefs_highlight": "settings.selectionTheme",
            "preferences.uioPlus_chrome_prefs_lineSpace": "settings.lineSpace",
            "preferences.uioPlus_chrome_prefs_simplify": "settings.simplifiedUiEnabled",
            "preferences.uioPlus_chrome_prefs_textSize": "settings.fontSize",
            "preferences.uioPlus_chrome_prefs_wordSpace": "settings.wordSpace"
        },
        listeners: {
            "onRead.transform": {
                func: "uioPlus.chrome.prefs.extensionPanel.store.transform",
                priority: "after:encoding",
                args: ["{that}.options.rules", false, "{arguments}.0"]
            },
            "onWrite.transform": {
                func: "uioPlus.chrome.prefs.extensionPanel.store.transform",
                priority: "before:encoding",
                args: ["{that}.options.rules", true, "{arguments}.0"]
            },
            "onWriteResponse.transform": {
                func: "uioPlus.chrome.prefs.extensionPanel.store.transform",
                priority: "after:encoding",
                args: ["{that}.options.rules", false, "{arguments}.0"]
            }
        }
    });

    uioPlus.chrome.prefs.extensionPanel.store.transform = function (rules, invert, data) {
        rules = invert ? fluid.model.transform.invertConfiguration(rules) : rules;
        return fluid.model.transform(data, rules);
    };

    fluid.contextAware.makeChecks({"uioPlus.chrome.prefs.portBinding": true});

    fluid.contextAware.makeAdaptation({
        distributionName: "uioPlus.chrome.prefs.portBinding.storeDistributor",
        targetName: "fluid.prefs.store",
        adaptationName: "strategy",
        checkName: "portBinding",
        record: {
            contextValue: "{uioPlus.chrome.prefs.portBinding}",
            gradeNames: "uioPlus.chrome.prefs.extensionPanel.store",
            priority: "after:user"
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.extensionPanel", {
        gradeNames: ["fluid.prefs.fullNoPreview"],
        selectors: {
            loading: ".uioPlusJS-loading"
        },
        listeners: {
            "onReady.removeSpinner": {
                "this": "{that}.dom.loading",
                method: "remove",
                args: []
            },
            "onReady.updateAria": {
                "this": "{that}.container",
                method: "removeAttr",
                args: ["aria-busy"]
            }
        },
        components: {
            prefsEditor: {
                options: {
                    invokers: {
                        writeImpl: {
                            funcName: "uioPlus.chrome.prefs.extensionPanel.writeImpl"
                        }
                    },
                    model: {
                        preferences: "{prefsEditorLoader}.model.preferences",
                        panelIndex: "{prefsEditorLoader}.model.panelIndex",
                        panelMaxIndex: "{prefsEditorLoader}.model.panelMaxIndex",
                        local: {
                            panelIndex: "{that}.model.panelIndex"
                        }
                    },
                    listeners: {
                        // auto fetch changes from the store
                        "{fluid.prefs.store}.events.onIncomingRead": {
                            listener: "{that}.fetch",
                            priority: "after:handle",
                            namespace: "autoFetchFromStore"
                        },
                        "afterFetch.updateEnhancer": {
                            listener: "{that}.applyChanges",
                            priority: "after:unblock"
                        }
                    },
                    modelListeners: {
                        "preferences": {
                            // can't use the autoSave option because we need to exclude init
                            listener: "{that}.save",
                            excludeSource: "init"
                        },
                        "panelIndex": {
                            // can't use the autoSave option because we need to exclude init
                            listener: "{that}.save",
                            excludeSource: "init"
                        }
                    }
                }
            }
        }
    });

    /**
     * Sends the prefsEditor.model to the store and fires onSave
     * Overrides the default writeImpl functionality as all of the model, including the default values, must be sent
     * to the store.
     *
     * @param {Component} that - the component
     * @param {Object} modelToSave - the model to be written
     *
     * @return {Promise} promise - a promise that is resolved when the model is saved.
     */
    uioPlus.chrome.prefs.extensionPanel.writeImpl = function (that, modelToSave) {
        var promise = fluid.promise();

        that.events.onSave.fire(modelToSave);
        var setPromise = that.setSettings(modelToSave);

        fluid.promise.follow(setPromise, promise);
        return promise;
    };

    /**********
     * panels *
     **********/

    fluid.defaults("uioPlus.chrome.prefs.panel.textSize", {
        gradeNames: ["fluid.prefs.panel.textSize"],
        preferenceMap: {
            "uioPlus.chrome.prefs.textSize": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        },
        distributeOptions: [{
            record: {
                scale: 2
            },
            target: "{that textfieldStepper}.options",
            namespace: "scale"
        }]
    });

    fluid.defaults("uioPlus.chrome.prefs.panel.lineSpace", {
        gradeNames: ["fluid.prefs.panel.lineSpace"],
        preferenceMap: {
            "uioPlus.chrome.prefs.lineSpace": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.panel.wordSpace", {
        gradeNames: ["fluid.prefs.panel.wordSpace"],
        preferenceMap: {
            "uioPlus.chrome.prefs.wordSpace": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.panel.contrast", {
        gradeNames: ["fluid.prefs.panel.contrast"],
        preferenceMap: {
            "uioPlus.chrome.prefs.contrast": {
                "model.value": "value",
                "controlValues.theme": "enum"
            }
        },
        stringArrayIndex: {
            theme: [
                "contrast-default",
                "contrast-bw",
                "contrast-wb",
                "contrast-by",
                "contrast-yb",
                "contrast-gw",
                "contrast-gd",
                "contrast-bbr"
            ]
        },
        controlValues: {
            theme: ["default", "bw", "wb", "by", "yb", "gw", "gd", "bbr"]
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.panel.simplify", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "uioPlus.chrome.prefs.simplify": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.panel.clickToSelect", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "uioPlus.chrome.prefs.clickToSelect": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.panel.highlight", {
        gradeNames: ["fluid.prefs.panel.themePicker"],
        preferenceMap: {
            "uioPlus.chrome.prefs.highlight": {
                "model.value": "value",
                "controlValues.theme": "enum"
            }
        },
        selectors: {
            header: ".uioPlusJS-prefsEditor-highlight-header"
        },
        selectorsToIgnore: ["header"],
        stringArrayIndex: {
            theme: ["selectionHighlight-default", "selectionHighlight-yellow", "selectionHighlight-green", "selectionHighlight-pink"]
        },
        controlValues: {
            theme: ["default", "yellow", "green", "pink"]
        }
    });

    /***********
     * schemas *
     ***********/

    fluid.defaults("uioPlus.chrome.auxSchema.clickToSelect", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.clickToSelect": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.clickToSelect",
                    "container": ".uioPlusJS-prefsEditor-clickToSelect",
                    "template": "%templatePrefix/ClickToSelectPanelTemplate.html",
                    "message": "%messagePrefix/clickToSelect.json"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.auxSchema.contrast", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.contrast": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.contrast",
                    "container": ".uioPlusJS-prefsEditor-contrast",
                    "classnameMap": {
                        "theme": {
                            "default": "fl-theme-prefsEditor-default",
                            "bw": "fl-theme-bw",
                            "wb": "fl-theme-wb",
                            "by": "fl-theme-by",
                            "yb": "fl-theme-yb",
                            "gd": "fl-theme-gd",
                            "gw": "fl-theme-gw",
                            "bbr": "fl-theme-bbr"
                        }
                    },
                    "template": "%templatePrefix/PrefsEditorTemplate-contrast.html",
                    "message": "%messagePrefix/contrast.json"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.auxSchema.lineSpace", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.lineSpace": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.lineSpace",
                    "container": ".uioPlusJS-prefsEditor-line-space",
                    "message": "%messagePrefix/lineSpace.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-lineSpace.html"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.auxSchema.highlight", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.highlight": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.highlight",
                    "container": ".uioPlusJS-prefsEditor-selectionHighlight",
                    "classnameMap": {
                        "theme": {
                            "default": "fl-theme-prefsEditor-default",
                            "yellow": "uioPlus-selection-preview-yellow",
                            "green": "uioPlus-selection-preview-green",
                            "pink": "uioPlus-selection-preview-pink"
                        }
                    },
                    "template": "%templatePrefix/SelectionHighlightPanelTemplate.html",
                    "message": "%messagePrefix/selectionHighlight.json"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.auxSchema.simplify", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.simplify": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.simplify",
                    "container": ".uioPlusJS-prefsEditor-simplify",
                    "template": "%templatePrefix/SimplifyPanelTemplate.html",
                    "message": "%messagePrefix/simplify.json"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.auxSchema.textSize", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.textSize": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.textSize",
                    "container": ".uioPlusJS-prefsEditor-text-size",
                    "message": "%messagePrefix/zoom.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-textSize.html"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.auxSchema.wordSpace", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "uioPlus.chrome.prefs.wordSpace": {
                panel: {
                    "type": "uioPlus.chrome.prefs.panel.wordSpace",
                    "container": ".uioPlusJS-prefsEditor-word-space",
                    "message": "%messagePrefix/wordSpace.json",
                    "template": "%templatePrefix/PrefsEditorTemplate-wordSpace.html"
                }
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.textSize", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.textSize": {
                "type": "number",
                "default": 1,
                "minimum": 0.25,
                "maximum": 5,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.lineSpace", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.lineSpace": {
                "type": "number",
                "default": 1,
                "minimum": 0.7,
                "maximum": 3,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.contrast", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.contrast": {
                "type": "string",
                "default": "default",
                "enum": ["default", "bw", "wb", "by", "yb", "gw", "gd", "bbr"]
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.simplify", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.simplify": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.clickToSelect", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.clickToSelect": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.highlight", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.highlight": {
                "type": "string",
                "default": "default",
                "enum": ["default", "yellow", "green", "pink"]
            }
        }
    });

    fluid.defaults("uioPlus.chrome.prefs.schemas.wordSpace", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "uioPlus.chrome.prefs.wordSpace": {
                "type": "number",
                "default": 1,
                "minimum": 0.7,
                "maximum": 4,
                "divisibleBy": 0.1
            }
        }
    });

    /****************
     * Prefs Editor *
     ****************/

    fluid.defaults("uioPlus.chrome.prefsEditor", {
        gradeNames: ["fluid.uiOptions"],
        preferences: [
            "uioPlus.chrome.prefs.textSize",
            "fluid.prefs.letterSpace",
            "uioPlus.chrome.prefs.wordSpace",
            "uioPlus.chrome.prefs.lineSpace",
            "fluid.prefs.syllabification",
            "uioPlus.chrome.prefs.contrast",
            "uioPlus.chrome.prefs.clickToSelect",
            "uioPlus.chrome.prefs.highlight",
            "fluid.prefs.speak",
            "uioPlus.chrome.prefs.simplify",
            "fluid.prefs.tableOfContents",
            "fluid.prefs.enhanceInputs"
        ],
        auxiliarySchema: {
            loaderGrades: ["uioPlus.chrome.prefs.extensionPanel"],
            terms: {
                templatePrefix: "../templates/",
                messagePrefix: "../messages/"
            },
            // Remove aliases and enactors from schemas. UIO+ does not apply settings to the adjusters themselves.
            // In the future if we wish to support that, the overrides will need to be removed.
            "fluid.prefs.tableOfContents": {
                alias: null,
                enactor: null
            },
            "fluid.prefs.enhanceInputs": {
                alias: null,
                enactor: null
            },
            "fluid.prefs.speak": {
                enactor: null
            },
            "fluid.prefs.syllabification": {
                enactor: null
            },
            "fluid.prefs.letterSpace": {
                enactor: null
            }
        },
        prefsEditor: {
            gradeNames: ["fluid.prefs.arrowScrolling"],
            listeners: {
                "onReady.scrollToPanel": {
                    listener: "fluid.prefs.arrowScrolling.scrollToPanel",
                    args: ["{that}", "{that}.model.panelIndex"]
                }
            },
            // TODO: Remove this modelListener after FLUID-6230 is addressed
            // https://issues.fluidproject.org/browse/FLUID-6230
            modelListeners: {
                "panelIndex": {
                    listener: "fluid.prefs.arrowScrolling.scrollToPanel",
                    args: ["{that}", "{that}.model.panelIndex"],
                    includeSource: "scrollEvent"
                }
            }
        }
    });

})(jQuery, fluid);
