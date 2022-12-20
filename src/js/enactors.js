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

/* global uioPlus */

"use strict";

/******************************************
 * click-to-select enactor                *
 ******************************************/

fluid.defaults("uioPlus.enactor.clickToSelect", {
    gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
    preferenceMap: {
        "uioPlus.prefs.clickToSelect": {
            "model.value": "value"
        }
    },
    listeners: {
        "onCreate.rightClick": {
            "this": "{that}.container",
            method: "contextmenu",
            args: ["{that}.handleRightClick"]
        }
    },
    invokers: {
        selectParagraph: "uioPlus.enactor.clickToSelect.selectParagraph",
        handleRightClick: {
            funcName: "uioPlus.enactor.clickToSelect.handleRightClick",
            args: ["{that}.model", "{arguments}.0", "{that}.selectParagraph"]
        }
    }
});

uioPlus.enactor.clickToSelect.selectParagraph = function (node) {
    // find closest paragraph node
    node = $(node);
    var paragraphNode = node.closest("p")[0] || node[0];

    if (paragraphNode) {
        // create a range containing the paragraphNode
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

uioPlus.enactor.clickToSelect.handleRightClick = function (model, event, handler) {
    // Check if the right mouse button was pressed so that this isn't
    // triggered by the context menu key ( https://api.jquery.com/contextmenu/ ).
    // Only trigger the handler if the appropriate model condition is met.
    if (event.button === 2 && model.value) {
        handler(event.target);
        event.preventDefault();
    }
};

/******************************************
 * selection highlight enactor            *
 ******************************************/

fluid.defaults("uioPlus.enactor.selectionHighlight", {
    gradeNames: ["fluid.prefs.enactor.classSwapper"],
    preferenceMap: {
        "uioPlus.prefs.highlight": {
            "model.value": "value"
        }
    }
});

/******************************************
 * simplify enactor                       *
 ******************************************/

/*
    * Provides the mechanism for enacting the simplification preference.
    *
    * Simplification works by setting the container's visibility to hidden and then selectively showing parts of the
    * page including: the primary content (`that.content`) and elements for the selectors mentioned in the
    * `alwaysVisible` option. For dynamic content that conforms to the `alwaysVisible` selectors, a mutation observer
    * is added to show them after they are added to the DOM, if the simplification is enabled.
    */

fluid.defaults("uioPlus.enactor.simplify", {
    gradeNames: ["fluid.prefs.enactor", "uioPlus.contentView"],
    preferenceMap: {
        "uioPlus.prefs.simplify": {
            "model.simplify": "value"
        }
    },
    selectors: {
        navToggle: ".uioPlusJS-simplify-navToggle",
        nav: "nav, [role~='navigation'], .navigation, .nav, #nav, #navigation",
        search: "[role~='search'], [type~='search']",
        visible: ".uioPlusJS-simplify-visible"
    },
    alwaysVisible: ["search", "visible"],
    markup: {
        navToggle: "<button class='uioPlusJS-simplify-navToggle'></button>"
    },
    strings: {
        navToggle: "Show/Hide Navigation"
    },
    styles: {
        navToggle: "uioPlus-simplify-navToggle"
    },
    members: {
        nav: {
            expander: {
                funcName: "{that}.locateOutOfContent",
                args: ["nav"]
            }
        }
    },
    model: {
        simplify: false,
        showNav: false
    },
    modelListeners: {
        simplify: {
            listener: "{that}.set",
            args: ["{change}.value"],
            excludeSource: ["init"]
        },
        showNav: {
            listener: "{that}.toggleNav",
            args: ["{change}.value"],
            excludeSource: "init"
        }
    },
    events: {
        onAlwaysVisibleNodeAdded: null
    },
    listeners: {
        "onCreate.toggleNav": {
            listener: "{that}.toggleNav",
            args: ["{that}.model.showNav"]
        },
        "onCreate.set": {
            listener: "{that}.set",
            args: ["{that}.model.simplify"]
        }
    },
    injectNavToggle: true,
    components: {
        observer: {
            type: "fluid.mutationObserver",
            container: "{that}.container",
            options: {
                defaultObserveConfig: {
                    attributes: false
                },
                listeners: {
                    "onNodeAdded.makeVisible": {
                        listener: "uioPlus.enactor.simplify.setVisible",
                        args: ["{simplify}", "{arguments}.0", "{arguments}.1"]
                    }
                }
            }
        }
    },
    invokers: {
        set: {
            funcName: "uioPlus.enactor.simplify.set",
            args: ["{that}", "{arguments}.0"]
        },
        toggleNav: {
            funcName: "uioPlus.enactor.simplify.toggleNav",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

uioPlus.enactor.simplify.injectToggle = function (that, content) {
    var navToggle = that.locate("navToggle");

    if (!navToggle.length && that.nav.length) {
        navToggle = $(that.options.markup.navToggle);
        navToggle.attr("aria-pressed", that.model.showNav);
        navToggle.text(that.options.strings.navToggle);
        navToggle.addClass(that.options.styles.navToggle);
        navToggle.click(function () {
            var newState = !that.model.showNav;
            that.applier.change("showNav", newState);
        });
        // prepend to first content element only
        content.eq(0).prepend(navToggle);
    }
};

uioPlus.enactor.simplify.setVisible = function (that, node, mutationRecord) {
    var elm = node.nodeType === Node.ELEMENT_NODE ? $(node) : $(mutationRecord.target);

    var makeVisible = fluid.find(that.options.alwaysVisible, function (selectorName) {
        return elm.is(that.options.selectors[selectorName]) || undefined;
    }, false);

    if (makeVisible) {
        elm.css("visibility", "visible");
    }
};

uioPlus.enactor.simplify.set = function (that, state) {
    if (state && that.content.length) {
        that.content.css("visibility", "visible");
        fluid.each(that.options.alwaysVisible, function (selector) {
            that.locate(selector).css("visibility", "visible");
        });
        that.container.css("visibility", "hidden");
        if (that.options.injectNavToggle) {
            uioPlus.enactor.simplify.injectToggle(that, that.content);
        }
        that.locate("navToggle").show();
        that.observer.observe();
    } else if (that.content.length) {
        that.locate("navToggle").hide();
        that.container.css("visibility", "");
        that.content.css("visibility", "");
        fluid.each(that.options.alwaysVisible, function (selector) {
            that.locate(selector).css("visibility", "");
        });
        that.observer.disconnect();
    }
};

uioPlus.enactor.simplify.toggleNav = function (that, state) {
    var navToggle = that.locate("navToggle");
    if (state && that.model.simplify) {
        that.nav.css("visibility", "visible");
        navToggle.attr("aria-pressed", state);
    } else {
        that.nav.css("visibility", "");
        navToggle.attr("aria-pressed", state);
    }
};

/******************************************
 * table of contents enactor              *
 ******************************************/

fluid.defaults("uioPlus.enactor.tableOfContents", {
    gradeNames: ["uioPlus.contentView", "fluid.prefs.enactor.tableOfContents"],
    selectors: {
        tocContainer: ".flc-toc-tocContainer",
        article: "article, [role~='article'], .article, #article",
        main: "main, [role~='main'], .main, #main",
        genericContent: ".content, #content, .body:not('body'), #body:not('body')"
    },
    defaultContent: "{that}.container",
    listeners: {
        "onCreateTOCReady.injectToCContainer": {
            listener: "{that}.injectToCContainer",
            priority: "first"
        }
    },
    invokers: {
        injectToCContainer: {
            funcName: "uioPlus.enactor.tableOfContents.injectToCContainer",
            args: ["{that}"]
        }
    },
    markup: {
        tocContainer: "<div class=\"flc-toc-tocContainer uioPlus-toc-tocContainer\"></div>"
    }
});

// As UIO+ runs on arbitrary sites, inject the necessary ToC container markup into the pages content,
// and this container will then be used by the ToC component.
// 1. If the ToC container already exists, do nothing;
// 2. If the ToC container is not found:
// 2.1 The first choice is to append the ToC container to the page's main content area (e.g. <main>, <article> etc.)
// 2.2 If the main content is not found, for example when a page is marked up like
// `<body><div></div><div></div></body>`, inject the ToC container to the enactor's container.
uioPlus.enactor.tableOfContents.injectToCContainer = function (that) {
    if (!that.locate("tocContainer").length) {
        if (that.content.length === 1) {
            that.content.prepend(that.options.markup.tocContainer);
        } else {
            that.container.prepend(that.options.markup.tocContainer);
        }
    }
};

/******************************************
 * text-to-speech enactor                 *
 ******************************************/

fluid.defaults("uioPlus.enactor.selfVoicing", {
    gradeNames: ["uioPlus.contentView", "fluid.prefs.enactor.selfVoicing"],
    selectors: {
        controllerParentContainer: ".flc-prefs-selfVoicingWidget",
        domReaderContent: ".flc-orator-content"
    },
    domReaderContent: ["domReaderContent", "main", "article"],
    controllerParentContainer: ["controllerParentContainer", "main", "article"],
    distributeOptions: [{
        record: {
            expander: {
                funcName: "uioPlus.contentView.findFirstSelector",
                args: ["{selfVoicing}.locate", "{selfVoicing}.options.controllerParentContainer", "{selfVoicing}.container"]
            }
        },
        target: "{that orator > controller}.options.parentContainer",
        namespace: "controllerParentContainer"
    }, {
        record: {
            expander: {
                funcName: "uioPlus.contentView.findFirstSelector",
                args: ["{selfVoicing}.locate", "{selfVoicing}.options.domReaderContent", "{selfVoicing}.container"]
            }
        },
        target: "{that orator}.options.components.domReader.container",
        namespace: "domReaderContainer"
    }]
});
