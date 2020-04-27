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

/* global fluid */
"use strict";

(function ($, fluid) {
    var uioPlus = fluid.registerNamespace("uioPlus");

    /*
     * Provides the mechanism for enacting the simplification preference.
     *
     * Simplification works by setting the container's visibility to hidden and then selectively showing parts of the
     * page including: the primary content (`that.content`) and elements for the selectors mentioned in the
     * `alwaysVisible` option. For dynamic content that conforms to the `alwaysVisible` selectors, a mutation observer
     * is added to show them after they are added to the DOM, if the simplification is enabled.
     */

    fluid.defaults("uioPlus.simplify", {
        gradeNames: ["uioPlus.chrome.contentView"],
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
                            listener: "uioPlus.simplify.setVisible",
                            args: ["{simplify}", "{arguments}.0", "{arguments}.1"]
                        }
                    }
                }
            }
        },
        invokers: {
            set: {
                funcName: "uioPlus.simplify.set",
                args: ["{that}", "{arguments}.0"]
            },
            toggleNav: {
                funcName: "uioPlus.simplify.toggleNav",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    uioPlus.simplify.injectToggle = function (that, content) {
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

    uioPlus.simplify.setVisible = function (that, node, mutationRecord) {
        var elm = node.nodeType === Node.ELEMENT_NODE ? $(node) : $(mutationRecord.target);

        var makeVisible = fluid.find(that.options.alwaysVisible, function (selectorName) {
            return elm.is(that.options.selectors[selectorName]) || undefined;
        }, false);

        if (makeVisible) {
            elm.css("visibility", "visible");
        }
    };

    uioPlus.simplify.set = function (that, state) {
        if (state && that.content.length) {
            that.content.css("visibility", "visible");
            fluid.each(that.options.alwaysVisible, function (selector) {
                that.locate(selector).css("visibility", "visible");
            });
            that.container.css("visibility", "hidden");
            if (that.options.injectNavToggle) {
                uioPlus.simplify.injectToggle(that, that.content);
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

    uioPlus.simplify.toggleNav = function (that, state) {
        var navToggle = that.locate("navToggle");
        if (state && that.model.simplify) {
            that.nav.css("visibility", "visible");
            navToggle.attr("aria-pressed", state);
        } else {
            that.nav.css("visibility", "");
            navToggle.attr("aria-pressed", state);
        }
    };
})(jQuery, fluid);
