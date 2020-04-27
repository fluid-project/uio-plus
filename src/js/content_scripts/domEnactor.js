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

/* global fluid, chrome */
"use strict";

(function ($, fluid) {

    var uioPlus = fluid.registerNamespace("uioPlus");

    // The main component to handle settings that require DOM manipulations.
    // It contains various subcomponents for handling various settings.
    fluid.defaults("uioPlus.chrome.domEnactor", {
        gradeNames: ["fluid.contextAware", "fluid.viewComponent"],
        model: {
            // Accepted model values:
            // characterSpace: Number,
            // contrastTheme: String,
            // inputsLargerEnabled: Boolean,
            // lineSpace: Number,    // the multiplier to the current line space
            // selectionTheme: String,
            // selfVoicingEnabled: Boolean,
            // simplifiedUiEnabled: Boolean,
            // syllabificationEnabled: Boolean,
            // tableOfContentsEnabled: Boolean
        },
        events: {
            onIncomingSettings: null
        },
        listeners: {
            "onIncomingSettings.updateModel": "{that}.updateModel"
        },
        contextAwareness: {
            simplify: {
                checks: {
                    allowSimplification: {
                        contextValue: "{uioPlus.chrome.allowSimplification}",
                        gradeNames: "uioPlus.chrome.domEnactor.simplify"
                    }
                }
            }
        },
        invokers: {
            updateModel: {
                funcName: "uioPlus.chrome.domEnactor.updateModel",
                args: ["{that}", "{arguments}.0"]
            }
        },
        distributeOptions: {
            record: "{that}.container",
            target: "{that > fluid.prefs.enactor}.container"
        },
        components: {
            portBinding: {
                type: "uioPlus.chrome.portBinding",
                options: {
                    portName: "contentScript",
                    listeners: {
                        "onIncomingRead.handle": {
                            listener: "{that}.rejectMessage",
                            args: ["{that}.options.messageTypes.readReceipt", "{arguments}.0"]
                        }
                    },
                    invokers: {
                        handleRead: "fluid.identity",
                        handleWrite: {
                            func: "{domEnactor}.events.onIncomingSettings.fire",
                            args: ["{arguments}.0.payload.settings"]
                        }
                    }
                }
            },
            charSpace: {
                type: "uioPlus.chrome.enactor.charSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.characterSpace"
                    }
                }
            },
            contrast: {
                type: "uioPlus.chrome.enactor.contrast",
                options: {
                    model: {
                        value: "{domEnactor}.model.contrastTheme"
                    }
                }
            },
            inputsLarger: {
                type: "uioPlus.chrome.enactor.inputsLarger",
                options: {
                    model: {
                        value: "{domEnactor}.model.inputsLargerEnabled"
                    }
                }
            },
            lineSpace: {
                type: "uioPlus.chrome.enactor.lineSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.lineSpace"
                    }
                }
            },
            selectionHighlight: {
                type: "uioPlus.chrome.enactor.selectionHighlight",
                options: {
                    model: {
                        value: "{domEnactor}.model.selectionTheme",
                        selectParagraph: "{domEnactor}.model.clickToSelectEnabled"
                    }
                }
            },
            selfVoicing: {
                type: "uioPlus.chrome.enactor.selfVoicing",
                options: {
                    model: {
                        enabled: "{domEnactor}.model.selfVoicingEnabled"
                    },
                    // GPII-3373: temporarily remove the page level TTS until GPII-3286 is fixed
                    // https://issues.gpii.net/browse/GPII-3286
                    components: {
                        orator: {
                            options: {
                                components: {
                                    controller: {
                                        type: "fluid.emptySubcomponent"
                                    },
                                    domReader: {
                                        type: "fluid.emptySubcomponent"
                                    },
                                    selectionReader: {
                                        options: {
                                            markup: {
                                                control: "<button class=\"flc-orator-selectionReader-control uioPlusJS-simplify-visible \"><span class=\"uioPlus-icon-orator\"></span><span class=\"flc-orator-selectionReader-controlLabel\"></span></button>"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            syllabification: {
                type: "uioPlus.chrome.enactor.syllabification",
                options: {
                    model: {
                        enabled: "{domEnactor}.model.syllabificationEnabled"
                    }
                }
            },
            tableOfContents: {
                type: "uioPlus.chrome.enactor.tableOfContents",
                options: {
                    model: {
                        toc: "{domEnactor}.model.tableOfContentsEnabled"
                    }
                }
            },
            wordSpace: {
                type: "uioPlus.chrome.enactor.wordSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.wordSpace"
                    }
                }
            }
        }
    });

    uioPlus.chrome.domEnactor.updateModel = function (that, model) {
        var transaction = that.applier.initiate();
        transaction.fireChangeRequest({path: "", type: "DELETE"});
        transaction.change("", model);
        transaction.commit();
    };

    fluid.defaults("uioPlus.chrome.domEnactor.simplify", {
        components: {
            simplify: {
                type: "uioPlus.chrome.enactor.simplify",
                options: {
                    model: {
                        simplify: "{domEnactor}.model.simplifiedUiEnabled"
                    }
                }
            }
        }
    });

    // High contrast
    fluid.defaults("uioPlus.chrome.enactor.contrast", {
        gradeNames: ["fluid.prefs.enactor.contrast"],
        classes: {
            "default": "",
            "bw": "fl-theme-uioPlus-bw",
            "wb": "fl-theme-uioPlus-wb",
            "by": "fl-theme-uioPlus-by",
            "yb": "fl-theme-uioPlus-yb",
            "gd": "fl-theme-uioPlus-gd",
            "gw": "fl-theme-uioPlus-gw",
            "bbr": "fl-theme-uioPlus-bbr"
        }
    });

    // fontsize map
    fluid.defaults("uioPlus.chrome.enactor.fontSizeMap", {
        fontSizeMap: {
            "xx-small": "9px",
            "x-small": "11px",
            "small": "13px",
            "medium": "15px",
            "large": "18px",
            "x-large": "23px",
            "xx-large": "30px"
        }
    });

    // Character space
    fluid.defaults("uioPlus.chrome.enactor.charSpace", {
        gradeNames: ["uioPlus.chrome.enactor.fontSizeMap", "fluid.prefs.enactor.letterSpace"]
    });

    // Line space
    fluid.defaults("uioPlus.chrome.enactor.lineSpace", {
        gradeNames: ["uioPlus.chrome.enactor.fontSizeMap", "fluid.prefs.enactor.lineSpace"]
    });

    // Word space
    fluid.defaults("uioPlus.chrome.enactor.wordSpace", {
        gradeNames: ["uioPlus.chrome.enactor.fontSizeMap", "fluid.prefs.enactor.wordSpace"]
    });

    // Inputs larger
    fluid.defaults("uioPlus.chrome.enactor.inputsLarger", {
        gradeNames: ["fluid.prefs.enactor.enhanceInputs"],
        cssClass: "uioPlus-input-enhanced"
    });

    // Selection highlight
    fluid.defaults("uioPlus.chrome.enactor.selectionHighlight", {
        gradeNames: ["fluid.prefs.enactor.classSwapper"],
        classes: {
            "default": "",
            "yellow": "uioPlus-selection-yellow",
            "green": "uioPlus-selection-green",
            "pink": "uioPlus-selection-pink"
        },
        listeners: {
            "onCreate.rightClick": {
                "this": "{that}.container",
                method: "contextmenu",
                args: ["{that}.handleRightClick"]
            }
        },
        invokers: {
            selectParagraph: "uioPlus.chrome.enactor.selectionHighlight.selectParagraph",
            handleRightClick: {
                funcName: "uioPlus.chrome.enactor.selectionHighlight.handleRightClick",
                args: ["{that}.model", "{arguments}.0", "{that}.selectParagraph"]
            }
        }
    });

    uioPlus.chrome.enactor.selectionHighlight.selectParagraph = function (node) {
        // find closest paragraph node
        node = $(node);
        var paragraphNode = node.closest("p")[0] || node[0];

        if (paragraphNode) {
            // create a range containg the paragraphNode
            var range = new Range();
            range.selectNode(paragraphNode);

            // retrieve the current selection
            var selection = window.getSelection();

            // clear all ranges in the selection
            selection.removeAllRanges();

            // add the new range based on the RIGHT-ClICKed paragraph
            selection.addRange(range);
        }
    };

    uioPlus.chrome.enactor.selectionHighlight.handleRightClick = function (model, event, handler) {
        // Check if the right mouse button was pressed so that this isn't
        // triggered by the context menu key ( https://api.jquery.com/contextmenu/ ).
        // Only trigger the handler if the appropriate model condition is met.
        if (event.button === 2 && model.selectParagraph) {
            handler(event.target);
            event.preventDefault();
        }
    };

    // Simplification
    fluid.defaults("uioPlus.chrome.enactor.simplify", {
        gradeNames: ["fluid.prefs.enactor", "uioPlus.simplify"],
        injectNavToggle: false
    });

    // Syllabification
    fluid.defaults("uioPlus.chrome.enactor.syllabification", {
        gradeNames: ["fluid.prefs.enactor.syllabification"],
        terms: {
            patternPrefix: "js/lib/syllablePatterns"
        },
        markup: {
            separator: "<span class=\"flc-syllabification-separator uioPlus-syllabification-separator\"></span>"
        },
        invokers: {
            injectScript: "uioPlus.chrome.enactor.syllabification.injectScript"
        }
    });

    uioPlus.chrome.enactor.syllabification.injectScript = function (src) {
        var promise = fluid.promise();

        chrome.runtime.sendMessage({
            type: "uioPlus.chrome.contentScriptInjectionRequest",
            src: src
        }, promise.resolve);

        return promise;
    };

    // Table of contents
    fluid.defaults("uioPlus.chrome.enactor.tableOfContents", {
        gradeNames: ["uioPlus.chrome.contentView", "fluid.prefs.enactor.tableOfContents"],
        tocTemplate: {
            // Converts the relative path to a fully-qualified URL in the extension.
            expander: {
                funcName: "chrome.runtime.getURL",
                args: ["templates/TableOfContents.html"]
            }
        },
        tocMessage: {
            // Converts the relative path to a fully-qualified URL in the extension.
            expander: {
                funcName: "chrome.runtime.getURL",
                args: ["messages/tableOfContents-enactor.json"]
            }
        },
        selectors: {
            tocContainer: ".flc-toc-tocContainer",
            article: "article, [role~='article'], .article, #article",
            main: "main, [role~='main'], .main, #main",
            genericContent: ".content, #content, .body:not('body'), #body:not('body')"
        },
        defaultContent: "{that}.container",
        // Handle the initial model value when the component creation cycle completes instead of
        // relying on model listeners. See https://issues.fluidproject.org/browse/FLUID-5519
        listeners: {
            "onCreate.handleInitialModelValue": {
                listener: "{that}.applyToc",
                args: ["{that}.model.toc"]
            },
            "onCreateTOCReady.injectToCContainer": {
                listener: "{that}.injectToCContainer",
                priority: "first"
            }
        },
        invokers: {
            injectToCContainer: {
                funcName: "uioPlus.chrome.enactor.tableOfContents.injectToCContainer",
                args: ["{that}"]
            }
        },
        markup: {
            tocContainer: "<div class=\"flc-toc-tocContainer uioPlus-toc-tocContainer\"></div>"
        },
        distributeOptions: {
            source: "{that}.options.selectors.tocContainer",
            target: "{that tableOfContents}.options.selectors.tocContainer"
        }
    });

    uioPlus.chrome.enactor.tableOfContents.injectToCContainer = function (that) {
        if (!that.locate("tocContainer").length) {
            if (that.content.length === 1) {
                that.content.prepend(that.options.markup.tocContainer);
            } else {
                that.container.prepend(that.options.markup.tocContainer);
            }
        }
    };

    // Self Voicing
    fluid.defaults("uioPlus.chrome.enactor.selfVoicing", {
        gradeNames: ["uioPlus.chrome.contentView", "fluid.prefs.enactor.selfVoicing"],
        selectors: {
            controllerParentContainer: ".flc-prefs-selfVoicingWidget",
            domReaderContent: ".flc-orator-content"
        },
        domReaderContent: ["domReaderContent", "article", "main", "genericContent"],
        controllerParentContainer: ["controllerParentContainer", "article", "main", "genericContent"],
        distributeOptions: [{
            record: {
                expander: {
                    funcName: "uioPlus.chrome.contentView.findFirstSelector",
                    args: ["{selfVoicing}.locate", "{selfVoicing}.options.controllerParentContainer", "{selfVoicing}.container"]
                }
            },
            target: "{that orator > controller}.options.parentContainer",
            namespace: "controllerParentContainer"
        }, {
            record: {
                expander: {
                    funcName: "uioPlus.chrome.contentView.findFirstSelector",
                    args: ["{selfVoicing}.locate", "{selfVoicing}.options.domReaderContent", "{selfVoicing}.container"]
                }
            },
            target: "{that orator}.options.components.domReader.container",
            namespace: "domReaderContainer"
        }]
    });

})(jQuery, fluid);
