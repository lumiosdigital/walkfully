// js/common/lib/elementResize.js
var elementResize_default = (target, callback) => {
  const ro = new ResizeObserver(() => {
    callback();
  });
  ro.observe(target);
};

// js/common/lib/break-points.js
var BreakPoints = class {
  constructor() {
    this.currentBreakpoint = this.getCurrentBreakpoint();
    elementResize_default(document.documentElement, () => {
      const breakPoint = this.getCurrentBreakpoint();
      if (this.currentBreakpoint != breakPoint) {
        document.dispatchEvent(new CustomEvent(`theme-breakpoint:change`, { detail: { breakPoint } }));
        this.currentBreakpoint = breakPoint;
      }
    });
  }
  getCurrentBreakpoint() {
    return window.getComputedStyle(document.body, ":before").getPropertyValue("content").replace(/\"/g, "");
  }
};

// js/common/components/section-popups.js
var section_popups_default = () => {
  if (!customElements.get("section-popups")) {
    customElements.define(
      "section-popups",
      class Popups extends HTMLElement {
        constructor() {
          super();
          this.wash = this.querySelector("[data-wash]");
          this.wash.addEventListener("click", () => this.deactivate());
          if (window.Shopify.designMode) {
            this.addEventListener("shopify:block:select", ({ target }) => {
              target.show();
              this.activate();
            });
            this.addEventListener("shopify:block:deselect", () => {
              this.deactivate();
            });
          }
        }
        activate() {
          this.classList.add("active");
        }
        deactivate() {
          this.classList.remove("active");
          const activePopup = this.querySelectorAll("component-popup.active");
          activePopup.forEach((popup) => popup.dismiss());
        }
      }
    );
  }
};

// node_modules/body-scroll-lock-upgrade/lib/index.esm.js
var hasPassiveEvents = false;
if (typeof window !== "undefined") {
  const passiveTestOptions = {
    get passive() {
      hasPassiveEvents = true;
      return void 0;
    }
  };
  window.addEventListener("testPassive", null, passiveTestOptions);
  window.removeEventListener("testPassive", null, passiveTestOptions);
}
var isIosDevice = typeof window !== "undefined" && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
var locks = [];
var locksIndex = /* @__PURE__ */ new Map();
var documentListenerAdded = false;
var initialClientY = -1;
var previousBodyOverflowSetting;
var htmlStyle;
var bodyStyle;
var previousBodyPaddingRight;
var allowTouchMove = (el) => locks.some((lock) => {
  if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
    return true;
  }
  return false;
});
var preventDefault = (rawEvent) => {
  const e2 = rawEvent || window.event;
  if (allowTouchMove(e2.target)) {
    return true;
  }
  if (e2.touches.length > 1)
    return true;
  if (e2.preventDefault)
    e2.preventDefault();
  return false;
};
var setOverflowHidden = (options) => {
  if (previousBodyPaddingRight === void 0) {
    const reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
    const scrollBarGap = window.innerWidth - document.documentElement.getBoundingClientRect().width;
    if (reserveScrollBarGap && scrollBarGap > 0) {
      const computedBodyPaddingRight = parseInt(
        window.getComputedStyle(document.body).getPropertyValue("padding-right"),
        10
      );
      previousBodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = `${computedBodyPaddingRight + scrollBarGap}px`;
    }
  }
  if (previousBodyOverflowSetting === void 0) {
    previousBodyOverflowSetting = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
};
var restoreOverflowSetting = () => {
  if (previousBodyPaddingRight !== void 0) {
    document.body.style.paddingRight = previousBodyPaddingRight;
    previousBodyPaddingRight = void 0;
  }
  if (previousBodyOverflowSetting !== void 0) {
    document.body.style.overflow = previousBodyOverflowSetting;
    previousBodyOverflowSetting = void 0;
  }
};
var setPositionFixed = () => window.requestAnimationFrame(() => {
  const $html = document.documentElement;
  const $body = document.body;
  if (bodyStyle === void 0) {
    htmlStyle = { ...$html.style };
    bodyStyle = { ...$body.style };
    const { scrollY, scrollX, innerHeight } = window;
    $html.style.height = "100%";
    $html.style.overflow = "hidden";
    $body.style.position = "fixed";
    $body.style.top = `${-scrollY}px`;
    $body.style.left = `${-scrollX}px`;
    $body.style.width = "100%";
    $body.style.height = "auto";
    $body.style.overflow = "hidden";
    setTimeout(
      () => window.requestAnimationFrame(() => {
        const bottomBarHeight = innerHeight - window.innerHeight;
        if (bottomBarHeight && scrollY >= innerHeight) {
          $body.style.top = -(scrollY + bottomBarHeight) + "px";
        }
      }),
      300
    );
  }
});
var restorePositionSetting = () => {
  if (bodyStyle !== void 0) {
    const y = -parseInt(document.body.style.top, 10);
    const x = -parseInt(document.body.style.left, 10);
    const $html = document.documentElement;
    const $body = document.body;
    $html.style.height = (htmlStyle == null ? void 0 : htmlStyle.height) || "";
    $html.style.overflow = (htmlStyle == null ? void 0 : htmlStyle.overflow) || "";
    $body.style.position = bodyStyle.position || "";
    $body.style.top = bodyStyle.top || "";
    $body.style.left = bodyStyle.left || "";
    $body.style.width = bodyStyle.width || "";
    $body.style.height = bodyStyle.height || "";
    $body.style.overflow = bodyStyle.overflow || "";
    window.scrollTo(x, y);
    bodyStyle = void 0;
  }
};
var isTargetElementTotallyScrolled = (targetElement) => targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
var handleScroll = (event, targetElement) => {
  const clientY = event.targetTouches[0].clientY - initialClientY;
  if (allowTouchMove(event.target)) {
    return false;
  }
  if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
    return preventDefault(event);
  }
  if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
    return preventDefault(event);
  }
  event.stopPropagation();
  return true;
};
var disableBodyScroll = (targetElement, options) => {
  if (!targetElement) {
    console.error(
      "disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices."
    );
    return;
  }
  locksIndex.set(
    targetElement,
    (locksIndex == null ? void 0 : locksIndex.get(targetElement)) ? (locksIndex == null ? void 0 : locksIndex.get(targetElement)) + 1 : 1
  );
  if (locks.some((lock2) => lock2.targetElement === targetElement)) {
    return;
  }
  const lock = {
    targetElement,
    options: options || {}
  };
  locks = [...locks, lock];
  if (isIosDevice) {
    setPositionFixed();
  } else {
    setOverflowHidden(options);
  }
  if (isIosDevice) {
    targetElement.ontouchstart = (event) => {
      if (event.targetTouches.length === 1) {
        initialClientY = event.targetTouches[0].clientY;
      }
    };
    targetElement.ontouchmove = (event) => {
      if (event.targetTouches.length === 1) {
        handleScroll(event, targetElement);
      }
    };
    if (!documentListenerAdded) {
      document.addEventListener(
        "touchmove",
        preventDefault,
        hasPassiveEvents ? { passive: false } : void 0
      );
      documentListenerAdded = true;
    }
  }
};
var enableBodyScroll = (targetElement) => {
  if (!targetElement) {
    console.error(
      "enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices."
    );
    return;
  }
  locksIndex.set(
    targetElement,
    (locksIndex == null ? void 0 : locksIndex.get(targetElement)) ? (locksIndex == null ? void 0 : locksIndex.get(targetElement)) - 1 : 0
  );
  if ((locksIndex == null ? void 0 : locksIndex.get(targetElement)) === 0) {
    locks = locks.filter((lock) => lock.targetElement !== targetElement);
    locksIndex == null ? void 0 : locksIndex.delete(targetElement);
  }
  if (isIosDevice) {
    targetElement.ontouchstart = null;
    targetElement.ontouchmove = null;
    if (documentListenerAdded && locks.length === 0) {
      document.removeEventListener(
        "touchmove",
        preventDefault,
        hasPassiveEvents ? { passive: false } : void 0
      );
      documentListenerAdded = false;
    }
  }
  if (locks.length === 0) {
    if (isIosDevice) {
      restorePositionSetting();
    } else {
      restoreOverflowSetting();
    }
  }
};

// node_modules/tabbable/dist/index.esm.js
var candidateSelectors = ["input:not([inert])", "select:not([inert])", "textarea:not([inert])", "a[href]:not([inert])", "button:not([inert])", "[tabindex]:not(slot):not([inert])", "audio[controls]:not([inert])", "video[controls]:not([inert])", '[contenteditable]:not([contenteditable="false"]):not([inert])', "details>summary:first-of-type:not([inert])", "details:not([inert])"];
var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
var NoElement = typeof Element === "undefined";
var matches = NoElement ? function() {
} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
  var _element$getRootNode;
  return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
} : function(element) {
  return element === null || element === void 0 ? void 0 : element.ownerDocument;
};
var isInert = function isInert2(node, lookUp) {
  var _node$getAttribute;
  if (lookUp === void 0) {
    lookUp = true;
  }
  var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "inert");
  var inert = inertAtt === "" || inertAtt === "true";
  var result = inert || lookUp && node && isInert2(node.parentNode);
  return result;
};
var isContentEditable = function isContentEditable2(node) {
  var _node$getAttribute2;
  var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, "contenteditable");
  return attValue === "" || attValue === "true";
};
var getCandidates = function getCandidates2(el, includeContainer, filter) {
  if (isInert(el)) {
    return [];
  }
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }
  candidates = candidates.filter(filter);
  return candidates;
};
var getCandidatesIteratively = function getCandidatesIteratively2(elements, includeContainer, options) {
  var candidates = [];
  var elementsToCheck = Array.from(elements);
  while (elementsToCheck.length) {
    var element = elementsToCheck.shift();
    if (isInert(element, false)) {
      continue;
    }
    if (element.tagName === "SLOT") {
      var assigned = element.assignedElements();
      var content = assigned.length ? assigned : element.children;
      var nestedCandidates = getCandidatesIteratively2(content, true, options);
      if (options.flatten) {
        candidates.push.apply(candidates, nestedCandidates);
      } else {
        candidates.push({
          scopeParent: element,
          candidates: nestedCandidates
        });
      }
    } else {
      var validCandidate = matches.call(element, candidateSelector);
      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
        candidates.push(element);
      }
      var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
      typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
      var validShadowRoot = !isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
      if (shadowRoot && validShadowRoot) {
        var _nestedCandidates = getCandidatesIteratively2(shadowRoot === true ? element.children : shadowRoot.children, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, _nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: _nestedCandidates
          });
        }
      } else {
        elementsToCheck.unshift.apply(elementsToCheck, element.children);
      }
    }
  }
  return candidates;
};
var hasTabIndex = function hasTabIndex2(node) {
  return !isNaN(parseInt(node.getAttribute("tabindex"), 10));
};
var getTabIndex = function getTabIndex2(node) {
  if (!node) {
    throw new Error("No node provided");
  }
  if (node.tabIndex < 0) {
    if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) {
      return 0;
    }
  }
  return node.tabIndex;
};
var getSortOrderTabIndex = function getSortOrderTabIndex2(node, isScope) {
  var tabIndex = getTabIndex(node);
  if (tabIndex < 0 && isScope && !hasTabIndex(node)) {
    return 0;
  }
  return tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables2(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput = function isInput2(node) {
  return node.tagName === "INPUT";
};
var isHiddenInput = function isHiddenInput2(node) {
  return isInput(node) && node.type === "hidden";
};
var isDetailsWithSummary = function isDetailsWithSummary2(node) {
  var r = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
    return child.tagName === "SUMMARY";
  });
  return r;
};
var getCheckedRadio = function getCheckedRadio2(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};
var isTabbableRadio = function isTabbableRadio2(node) {
  if (!node.name) {
    return true;
  }
  var radioScope = node.form || getRootNode(node);
  var queryRadios = function queryRadios2(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };
  var radioSet;
  if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
      return false;
    }
  }
  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};
var isRadio = function isRadio2(node) {
  return isInput(node) && node.type === "radio";
};
var isNonTabbableRadio = function isNonTabbableRadio2(node) {
  return isRadio(node) && !isTabbableRadio(node);
};
var isNodeAttached = function isNodeAttached2(node) {
  var _nodeRoot;
  var nodeRoot = node && getRootNode(node);
  var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;
  var attached = false;
  if (nodeRoot && nodeRoot !== node) {
    var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
    attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
    while (!attached && nodeRootHost) {
      var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
      nodeRoot = getRootNode(nodeRootHost);
      nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
      attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
    }
  }
  return attached;
};
var isZeroArea = function isZeroArea2(node) {
  var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
  return width === 0 && height === 0;
};
var isHidden = function isHidden2(node, _ref) {
  var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
  if (getComputedStyle(node).visibility === "hidden") {
    return true;
  }
  var isDirectSummary = matches.call(node, "details>summary:first-of-type");
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
  if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
    return true;
  }
  if (!displayCheck || displayCheck === "full" || displayCheck === "legacy-full") {
    if (typeof getShadowRoot === "function") {
      var originalNode = node;
      while (node) {
        var parentElement = node.parentElement;
        var rootNode = getRootNode(node);
        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          node = rootNode.host;
        } else {
          node = parentElement;
        }
      }
      node = originalNode;
    }
    if (isNodeAttached(node)) {
      return !node.getClientRects().length;
    }
    if (displayCheck !== "legacy-full") {
      return true;
    }
  } else if (displayCheck === "non-zero-area") {
    return isZeroArea(node);
  }
  return false;
};
var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    var parentNode = node.parentElement;
    while (parentNode) {
      if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i);
          if (child.tagName === "LEGEND") {
            return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
          }
        }
        return true;
      }
      parentNode = parentNode.parentElement;
    }
  }
  return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
  if (node.disabled || // we must do an inert look up to filter out any elements inside an inert ancestor
  //  because we're limited in the type of selectors we can use in JSDom (see related
  //  note related to `candidateSelectors`)
  isInert(node) || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }
  return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
  if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
    return false;
  }
  return true;
};
var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
  var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
  if (isNaN(tabIndex) || tabIndex >= 0) {
    return true;
  }
  return false;
};
var sortByOrder = function sortByOrder2(candidates) {
  var regularTabbables = [];
  var orderedTabbables = [];
  candidates.forEach(function(item, i) {
    var isScope = !!item.scopeParent;
    var element = isScope ? item.scopeParent : item;
    var candidateTabindex = getSortOrderTabIndex(element, isScope);
    var elements = isScope ? sortByOrder2(item.candidates) : element;
    if (candidateTabindex === 0) {
      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item,
        isScope,
        content: elements
      });
    }
  });
  return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
    return acc;
  }, []).concat(regularTabbables);
};
var tabbable = function tabbable2(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
      shadowRootFilter: isValidShadowRootTabbable
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  }
  return sortByOrder(candidates);
};
var focusable = function focusable2(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorFocusable.bind(null, options),
      flatten: true,
      getShadowRoot: options.getShadowRoot
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
  }
  return candidates;
};
var isTabbable = function isTabbable2(node, options) {
  options = options || {};
  if (!node) {
    throw new Error("No node provided");
  }
  if (matches.call(node, candidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorTabbable(options, node);
};
var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat("iframe").join(",");
var isFocusable = function isFocusable2(node, options) {
  options = options || {};
  if (!node) {
    throw new Error("No node provided");
  }
  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(options, node);
};

// node_modules/focus-trap/dist/focus-trap.esm.js
function ownKeys(e2, r) {
  var t2 = Object.keys(e2);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e2);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e2, r2).enumerable;
    })), t2.push.apply(t2, o);
  }
  return t2;
}
function _objectSpread2(e2) {
  for (var r = 1; r < arguments.length; r++) {
    var t2 = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t2), true).forEach(function(r2) {
      _defineProperty(e2, r2, t2[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r2) {
      Object.defineProperty(e2, r2, Object.getOwnPropertyDescriptor(t2, r2));
    });
  }
  return e2;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
var activeFocusTraps = {
  activateTrap: function activateTrap(trapStack, trap) {
    if (trapStack.length > 0) {
      var activeTrap = trapStack[trapStack.length - 1];
      if (activeTrap !== trap) {
        activeTrap.pause();
      }
    }
    var trapIndex = trapStack.indexOf(trap);
    if (trapIndex === -1) {
      trapStack.push(trap);
    } else {
      trapStack.splice(trapIndex, 1);
      trapStack.push(trap);
    }
  },
  deactivateTrap: function deactivateTrap(trapStack, trap) {
    var trapIndex = trapStack.indexOf(trap);
    if (trapIndex !== -1) {
      trapStack.splice(trapIndex, 1);
    }
    if (trapStack.length > 0) {
      trapStack[trapStack.length - 1].unpause();
    }
  }
};
var isSelectableInput = function isSelectableInput2(node) {
  return node.tagName && node.tagName.toLowerCase() === "input" && typeof node.select === "function";
};
var isEscapeEvent = function isEscapeEvent2(e2) {
  return (e2 === null || e2 === void 0 ? void 0 : e2.key) === "Escape" || (e2 === null || e2 === void 0 ? void 0 : e2.key) === "Esc" || (e2 === null || e2 === void 0 ? void 0 : e2.keyCode) === 27;
};
var isTabEvent = function isTabEvent2(e2) {
  return (e2 === null || e2 === void 0 ? void 0 : e2.key) === "Tab" || (e2 === null || e2 === void 0 ? void 0 : e2.keyCode) === 9;
};
var isKeyForward = function isKeyForward2(e2) {
  return isTabEvent(e2) && !e2.shiftKey;
};
var isKeyBackward = function isKeyBackward2(e2) {
  return isTabEvent(e2) && e2.shiftKey;
};
var delay = function delay2(fn) {
  return setTimeout(fn, 0);
};
var findIndex = function findIndex2(arr, fn) {
  var idx = -1;
  arr.every(function(value, i) {
    if (fn(value)) {
      idx = i;
      return false;
    }
    return true;
  });
  return idx;
};
var valueOrHandler = function valueOrHandler2(value) {
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }
  return typeof value === "function" ? value.apply(void 0, params) : value;
};
var getActualTarget = function getActualTarget2(event) {
  return event.target.shadowRoot && typeof event.composedPath === "function" ? event.composedPath()[0] : event.target;
};
var internalTrapStack = [];
var createFocusTrap = function createFocusTrap2(elements, userOptions) {
  var doc2 = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;
  var trapStack = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.trapStack) || internalTrapStack;
  var config = _objectSpread2({
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true,
    isKeyForward,
    isKeyBackward
  }, userOptions);
  var state = {
    // containers given to createFocusTrap()
    // @type {Array<HTMLElement>}
    containers: [],
    // list of objects identifying tabbable nodes in `containers` in the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{
    //   container: HTMLElement,
    //   tabbableNodes: Array<HTMLElement>, // empty if none
    //   focusableNodes: Array<HTMLElement>, // empty if none
    //   posTabIndexesFound: boolean,
    //   firstTabbableNode: HTMLElement|undefined,
    //   lastTabbableNode: HTMLElement|undefined,
    //   firstDomTabbableNode: HTMLElement|undefined,
    //   lastDomTabbableNode: HTMLElement|undefined,
    //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
    // }>}
    containerGroups: [],
    // same order/length as `containers` list
    // references to objects in `containerGroups`, but only those that actually have
    //  tabbable nodes in them
    // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
    //  the same length
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: void 0,
    // the most recent KeyboardEvent for the configured nav key (typically [SHIFT+]TAB), if any
    recentNavEvent: void 0
  };
  var trap;
  var getOption = function getOption2(configOverrideOptions, optionName, configOptionName) {
    return configOverrideOptions && configOverrideOptions[optionName] !== void 0 ? configOverrideOptions[optionName] : config[configOptionName || optionName];
  };
  var findContainerIndex = function findContainerIndex2(element, event) {
    var composedPath = typeof (event === null || event === void 0 ? void 0 : event.composedPath) === "function" ? event.composedPath() : void 0;
    return state.containerGroups.findIndex(function(_ref) {
      var container = _ref.container, tabbableNodes = _ref.tabbableNodes;
      return container.contains(element) || // fall back to explicit tabbable search which will take into consideration any
      //  web components if the `tabbableOptions.getShadowRoot` option was used for
      //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
      //  look inside web components even if open)
      (composedPath === null || composedPath === void 0 ? void 0 : composedPath.includes(container)) || tabbableNodes.find(function(node) {
        return node === element;
      });
    });
  };
  var getNodeForOption = function getNodeForOption2(optionName) {
    var optionValue = config[optionName];
    if (typeof optionValue === "function") {
      for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }
      optionValue = optionValue.apply(void 0, params);
    }
    if (optionValue === true) {
      optionValue = void 0;
    }
    if (!optionValue) {
      if (optionValue === void 0 || optionValue === false) {
        return optionValue;
      }
      throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
    }
    var node = optionValue;
    if (typeof optionValue === "string") {
      node = doc2.querySelector(optionValue);
      if (!node) {
        throw new Error("`".concat(optionName, "` as selector refers to no known node"));
      }
    }
    return node;
  };
  var getInitialFocusNode = function getInitialFocusNode2() {
    var node = getNodeForOption("initialFocus");
    if (node === false) {
      return false;
    }
    if (node === void 0 || !isFocusable(node, config.tabbableOptions)) {
      if (findContainerIndex(doc2.activeElement) >= 0) {
        node = doc2.activeElement;
      } else {
        var firstTabbableGroup = state.tabbableGroups[0];
        var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
        node = firstTabbableNode || getNodeForOption("fallbackFocus");
      }
    }
    if (!node) {
      throw new Error("Your focus-trap needs to have at least one focusable element");
    }
    return node;
  };
  var updateTabbableNodes = function updateTabbableNodes2() {
    state.containerGroups = state.containers.map(function(container) {
      var tabbableNodes = tabbable(container, config.tabbableOptions);
      var focusableNodes = focusable(container, config.tabbableOptions);
      var firstTabbableNode = tabbableNodes.length > 0 ? tabbableNodes[0] : void 0;
      var lastTabbableNode = tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : void 0;
      var firstDomTabbableNode = focusableNodes.find(function(node) {
        return isTabbable(node);
      });
      var lastDomTabbableNode = focusableNodes.slice().reverse().find(function(node) {
        return isTabbable(node);
      });
      var posTabIndexesFound = !!tabbableNodes.find(function(node) {
        return getTabIndex(node) > 0;
      });
      return {
        container,
        tabbableNodes,
        focusableNodes,
        /** True if at least one node with positive `tabindex` was found in this container. */
        posTabIndexesFound,
        /** First tabbable node in container, __tabindex__ order; `undefined` if none. */
        firstTabbableNode,
        /** Last tabbable node in container, __tabindex__ order; `undefined` if none. */
        lastTabbableNode,
        // NOTE: DOM order is NOT NECESSARILY "document position" order, but figuring that out
        //  would require more than just https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
        //  because that API doesn't work with Shadow DOM as well as it should (@see
        //  https://github.com/whatwg/dom/issues/320) and since this first/last is only needed, so far,
        //  to address an edge case related to positive tabindex support, this seems like a much easier,
        //  "close enough most of the time" alternative for positive tabindexes which should generally
        //  be avoided anyway...
        /** First tabbable node in container, __DOM__ order; `undefined` if none. */
        firstDomTabbableNode,
        /** Last tabbable node in container, __DOM__ order; `undefined` if none. */
        lastDomTabbableNode,
        /**
         * Finds the __tabbable__ node that follows the given node in the specified direction,
         *  in this container, if any.
         * @param {HTMLElement} node
         * @param {boolean} [forward] True if going in forward tab order; false if going
         *  in reverse.
         * @returns {HTMLElement|undefined} The next tabbable node, if any.
         */
        nextTabbableNode: function nextTabbableNode(node) {
          var forward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
          var nodeIdx = tabbableNodes.indexOf(node);
          if (nodeIdx < 0) {
            if (forward) {
              return focusableNodes.slice(focusableNodes.indexOf(node) + 1).find(function(el) {
                return isTabbable(el);
              });
            }
            return focusableNodes.slice(0, focusableNodes.indexOf(node)).reverse().find(function(el) {
              return isTabbable(el);
            });
          }
          return tabbableNodes[nodeIdx + (forward ? 1 : -1)];
        }
      };
    });
    state.tabbableGroups = state.containerGroups.filter(function(group) {
      return group.tabbableNodes.length > 0;
    });
    if (state.tabbableGroups.length <= 0 && !getNodeForOption("fallbackFocus")) {
      throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
    }
    if (state.containerGroups.find(function(g) {
      return g.posTabIndexesFound;
    }) && state.containerGroups.length > 1) {
      throw new Error("At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.");
    }
  };
  var getActiveElement = function getActiveElement2(el) {
    var activeElement = el.activeElement;
    if (!activeElement) {
      return;
    }
    if (activeElement.shadowRoot && activeElement.shadowRoot.activeElement !== null) {
      return getActiveElement2(activeElement.shadowRoot);
    }
    return activeElement;
  };
  var tryFocus = function tryFocus2(node) {
    if (node === false) {
      return;
    }
    if (node === getActiveElement(document)) {
      return;
    }
    if (!node || !node.focus) {
      tryFocus2(getInitialFocusNode());
      return;
    }
    node.focus({
      preventScroll: !!config.preventScroll
    });
    state.mostRecentlyFocusedNode = node;
    if (isSelectableInput(node)) {
      node.select();
    }
  };
  var getReturnFocusNode = function getReturnFocusNode2(previousActiveElement) {
    var node = getNodeForOption("setReturnFocus", previousActiveElement);
    return node ? node : node === false ? false : previousActiveElement;
  };
  var findNextNavNode = function findNextNavNode2(_ref2) {
    var target = _ref2.target, event = _ref2.event, _ref2$isBackward = _ref2.isBackward, isBackward = _ref2$isBackward === void 0 ? false : _ref2$isBackward;
    target = target || getActualTarget(event);
    updateTabbableNodes();
    var destinationNode = null;
    if (state.tabbableGroups.length > 0) {
      var containerIndex = findContainerIndex(target, event);
      var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : void 0;
      if (containerIndex < 0) {
        if (isBackward) {
          destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
        } else {
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (isBackward) {
        var startOfGroupIndex = findIndex(state.tabbableGroups, function(_ref3) {
          var firstTabbableNode = _ref3.firstTabbableNode;
          return target === firstTabbableNode;
        });
        if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target, false))) {
          startOfGroupIndex = containerIndex;
        }
        if (startOfGroupIndex >= 0) {
          var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
          var destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = getTabIndex(target) >= 0 ? destinationGroup.lastTabbableNode : destinationGroup.lastDomTabbableNode;
        } else if (!isTabEvent(event)) {
          destinationNode = containerGroup.nextTabbableNode(target, false);
        }
      } else {
        var lastOfGroupIndex = findIndex(state.tabbableGroups, function(_ref4) {
          var lastTabbableNode = _ref4.lastTabbableNode;
          return target === lastTabbableNode;
        });
        if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target))) {
          lastOfGroupIndex = containerIndex;
        }
        if (lastOfGroupIndex >= 0) {
          var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
          var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
          destinationNode = getTabIndex(target) >= 0 ? _destinationGroup.firstTabbableNode : _destinationGroup.firstDomTabbableNode;
        } else if (!isTabEvent(event)) {
          destinationNode = containerGroup.nextTabbableNode(target);
        }
      }
    } else {
      destinationNode = getNodeForOption("fallbackFocus");
    }
    return destinationNode;
  };
  var checkPointerDown = function checkPointerDown2(e2) {
    var target = getActualTarget(e2);
    if (findContainerIndex(target, e2) >= 0) {
      return;
    }
    if (valueOrHandler(config.clickOutsideDeactivates, e2)) {
      trap.deactivate({
        // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
        //  which will result in the outside click setting focus to the node
        //  that was clicked (and if not focusable, to "nothing"); by setting
        //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
        //  on activation (or the configured `setReturnFocus` node), whether the
        //  outside click was on a focusable node or not
        returnFocus: config.returnFocusOnDeactivate
      });
      return;
    }
    if (valueOrHandler(config.allowOutsideClick, e2)) {
      return;
    }
    e2.preventDefault();
  };
  var checkFocusIn = function checkFocusIn2(event) {
    var target = getActualTarget(event);
    var targetContained = findContainerIndex(target, event) >= 0;
    if (targetContained || target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = target;
      }
    } else {
      event.stopImmediatePropagation();
      var nextNode;
      var navAcrossContainers = true;
      if (state.mostRecentlyFocusedNode) {
        if (getTabIndex(state.mostRecentlyFocusedNode) > 0) {
          var mruContainerIdx = findContainerIndex(state.mostRecentlyFocusedNode);
          var tabbableNodes = state.containerGroups[mruContainerIdx].tabbableNodes;
          if (tabbableNodes.length > 0) {
            var mruTabIdx = tabbableNodes.findIndex(function(node) {
              return node === state.mostRecentlyFocusedNode;
            });
            if (mruTabIdx >= 0) {
              if (config.isKeyForward(state.recentNavEvent)) {
                if (mruTabIdx + 1 < tabbableNodes.length) {
                  nextNode = tabbableNodes[mruTabIdx + 1];
                  navAcrossContainers = false;
                }
              } else {
                if (mruTabIdx - 1 >= 0) {
                  nextNode = tabbableNodes[mruTabIdx - 1];
                  navAcrossContainers = false;
                }
              }
            }
          }
        } else {
          if (!state.containerGroups.some(function(g) {
            return g.tabbableNodes.some(function(n) {
              return getTabIndex(n) > 0;
            });
          })) {
            navAcrossContainers = false;
          }
        }
      } else {
        navAcrossContainers = false;
      }
      if (navAcrossContainers) {
        nextNode = findNextNavNode({
          // move FROM the MRU node, not event-related node (which will be the node that is
          //  outside the trap causing the focus escape we're trying to fix)
          target: state.mostRecentlyFocusedNode,
          isBackward: config.isKeyBackward(state.recentNavEvent)
        });
      }
      if (nextNode) {
        tryFocus(nextNode);
      } else {
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }
    }
    state.recentNavEvent = void 0;
  };
  var checkKeyNav = function checkKeyNav2(event) {
    var isBackward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    state.recentNavEvent = event;
    var destinationNode = findNextNavNode({
      event,
      isBackward
    });
    if (destinationNode) {
      if (isTabEvent(event)) {
        event.preventDefault();
      }
      tryFocus(destinationNode);
    }
  };
  var checkKey = function checkKey2(event) {
    if (isEscapeEvent(event) && valueOrHandler(config.escapeDeactivates, event) !== false) {
      event.preventDefault();
      trap.deactivate();
      return;
    }
    if (config.isKeyForward(event) || config.isKeyBackward(event)) {
      checkKeyNav(event, config.isKeyBackward(event));
    }
  };
  var checkClick = function checkClick2(e2) {
    var target = getActualTarget(e2);
    if (findContainerIndex(target, e2) >= 0) {
      return;
    }
    if (valueOrHandler(config.clickOutsideDeactivates, e2)) {
      return;
    }
    if (valueOrHandler(config.allowOutsideClick, e2)) {
      return;
    }
    e2.preventDefault();
    e2.stopImmediatePropagation();
  };
  var addListeners = function addListeners2() {
    if (!state.active) {
      return;
    }
    activeFocusTraps.activateTrap(trapStack, trap);
    state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function() {
      tryFocus(getInitialFocusNode());
    }) : tryFocus(getInitialFocusNode());
    doc2.addEventListener("focusin", checkFocusIn, true);
    doc2.addEventListener("mousedown", checkPointerDown, {
      capture: true,
      passive: false
    });
    doc2.addEventListener("touchstart", checkPointerDown, {
      capture: true,
      passive: false
    });
    doc2.addEventListener("click", checkClick, {
      capture: true,
      passive: false
    });
    doc2.addEventListener("keydown", checkKey, {
      capture: true,
      passive: false
    });
    return trap;
  };
  var removeListeners = function removeListeners2() {
    if (!state.active) {
      return;
    }
    doc2.removeEventListener("focusin", checkFocusIn, true);
    doc2.removeEventListener("mousedown", checkPointerDown, true);
    doc2.removeEventListener("touchstart", checkPointerDown, true);
    doc2.removeEventListener("click", checkClick, true);
    doc2.removeEventListener("keydown", checkKey, true);
    return trap;
  };
  var checkDomRemoval = function checkDomRemoval2(mutations) {
    var isFocusedNodeRemoved = mutations.some(function(mutation) {
      var removedNodes = Array.from(mutation.removedNodes);
      return removedNodes.some(function(node) {
        return node === state.mostRecentlyFocusedNode;
      });
    });
    if (isFocusedNodeRemoved) {
      tryFocus(getInitialFocusNode());
    }
  };
  var mutationObserver = typeof window !== "undefined" && "MutationObserver" in window ? new MutationObserver(checkDomRemoval) : void 0;
  var updateObservedNodes = function updateObservedNodes2() {
    if (!mutationObserver) {
      return;
    }
    mutationObserver.disconnect();
    if (state.active && !state.paused) {
      state.containers.map(function(container) {
        mutationObserver.observe(container, {
          subtree: true,
          childList: true
        });
      });
    }
  };
  trap = {
    get active() {
      return state.active;
    },
    get paused() {
      return state.paused;
    },
    activate: function activate(activateOptions) {
      if (state.active) {
        return this;
      }
      var onActivate = getOption(activateOptions, "onActivate");
      var onPostActivate = getOption(activateOptions, "onPostActivate");
      var checkCanFocusTrap = getOption(activateOptions, "checkCanFocusTrap");
      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }
      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = doc2.activeElement;
      onActivate === null || onActivate === void 0 || onActivate();
      var finishActivation = function finishActivation2() {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }
        addListeners();
        updateObservedNodes();
        onPostActivate === null || onPostActivate === void 0 || onPostActivate();
      };
      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
        return this;
      }
      finishActivation();
      return this;
    },
    deactivate: function deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }
      var options = _objectSpread2({
        onDeactivate: config.onDeactivate,
        onPostDeactivate: config.onPostDeactivate,
        checkCanReturnFocus: config.checkCanReturnFocus
      }, deactivateOptions);
      clearTimeout(state.delayInitialFocusTimer);
      state.delayInitialFocusTimer = void 0;
      removeListeners();
      state.active = false;
      state.paused = false;
      updateObservedNodes();
      activeFocusTraps.deactivateTrap(trapStack, trap);
      var onDeactivate = getOption(options, "onDeactivate");
      var onPostDeactivate = getOption(options, "onPostDeactivate");
      var checkCanReturnFocus = getOption(options, "checkCanReturnFocus");
      var returnFocus = getOption(options, "returnFocus", "returnFocusOnDeactivate");
      onDeactivate === null || onDeactivate === void 0 || onDeactivate();
      var finishDeactivation = function finishDeactivation2() {
        delay(function() {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }
          onPostDeactivate === null || onPostDeactivate === void 0 || onPostDeactivate();
        });
      };
      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
        return this;
      }
      finishDeactivation();
      return this;
    },
    pause: function pause(pauseOptions) {
      if (state.paused || !state.active) {
        return this;
      }
      var onPause = getOption(pauseOptions, "onPause");
      var onPostPause = getOption(pauseOptions, "onPostPause");
      state.paused = true;
      onPause === null || onPause === void 0 || onPause();
      removeListeners();
      updateObservedNodes();
      onPostPause === null || onPostPause === void 0 || onPostPause();
      return this;
    },
    unpause: function unpause(unpauseOptions) {
      if (!state.paused || !state.active) {
        return this;
      }
      var onUnpause = getOption(unpauseOptions, "onUnpause");
      var onPostUnpause = getOption(unpauseOptions, "onPostUnpause");
      state.paused = false;
      onUnpause === null || onUnpause === void 0 || onUnpause();
      updateTabbableNodes();
      addListeners();
      updateObservedNodes();
      onPostUnpause === null || onPostUnpause === void 0 || onPostUnpause();
      return this;
    },
    updateContainerElements: function updateContainerElements(containerElements) {
      var elementsAsArray = [].concat(containerElements).filter(Boolean);
      state.containers = elementsAsArray.map(function(element) {
        return typeof element === "string" ? doc2.querySelector(element) : element;
      });
      if (state.active) {
        updateTabbableNodes();
      }
      updateObservedNodes();
      return this;
    }
  };
  trap.updateContainerElements(elements);
  return trap;
};

// js/common/lib/local-storage.js
function isLocalStorageAvailable() {
  var test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e2) {
    return false;
  }
}
function getLocalStorageItem(key) {
  if (!isLocalStorageAvailable())
    return false;
  return JSON.parse(localStorage.getItem(key));
}
function setLocalStorageItem(key, val) {
  if (!isLocalStorageAvailable())
    return false;
  localStorage.setItem(key, val);
  return true;
}

// js/common/components/component-popup.js
var component_popup_default = () => {
  if (!customElements.get("component-popup")) {
    customElements.define(
      "component-popup",
      class Popup extends HTMLElement {
        constructor() {
          super();
          this.popupsWrapper = this.closest("section-popups");
          this.closeButtons = this.querySelectorAll("[data-close]");
          this.focusTrap = createFocusTrap(this, { allowOutsideClick: true });
          const { id, delay: delay3, showAgain, type } = this.dataset;
          this.key = `popup-${id}`;
          this.delaySeconds = parseInt(delay3, 10) * 1e3;
          this.showAgainHours = showAgain === "0" ? 99999 : parseInt(showAgain, 10);
          this.allowPopup = this.shouldPopup();
          this.formMessage = this.querySelector;
          this.initEvents();
          if (type === "newsletter_signup") {
            if (this.querySelector(".form__field-message") || this.querySelector(".form__message")) {
              this.show();
              return;
            }
          }
          this.checkDelay();
        }
        shouldPopup() {
          if (window.Shopify.designMode) {
            return false;
          }
          if (!getLocalStorageItem(this.key)) {
            return true;
          }
          const start = new Date(getLocalStorageItem(this.key));
          const end = /* @__PURE__ */ new Date();
          const hourDiff = (end - start) / 1e3 / 60 / 60;
          return hourDiff > this.showAgainHours;
        }
        checkDelay() {
          if (this.allowPopup) {
            setTimeout(() => {
              this.show();
            }, this.delaySeconds);
          }
        }
        initEvents() {
          this.closeButtons.forEach((button) => button.addEventListener("click", () => this.dismiss()));
          this.addEventListener("keydown", ({ key }) => {
            if (key === "Escape")
              this.dismiss();
          });
        }
        show() {
          this.popupsWrapper.activate();
          this.classList.add("active");
          this.focusTrap.activate();
          disableBodyScroll(this, {
            allowTouchMove: (el) => {
              while (el && el !== document.body) {
                if (el.getAttribute("data-scroll-lock-ignore") !== null) {
                  return true;
                }
                el = el.parentElement;
              }
            }
          });
        }
        dismiss() {
          setLocalStorageItem(this.key, JSON.stringify(/* @__PURE__ */ new Date()));
          this.classList.remove("active");
          this.popupsWrapper.deactivate();
          this.focusTrap.deactivate();
          enableBodyScroll(this);
        }
      }
    );
  }
};

// js/common/components/section-accordion-panels.js
var section_accordion_panels_default = () => {
  if (!customElements.get("section-accordion-panels")) {
    customElements.define(
      "section-accordion-panels",
      class AccordionPanels extends HTMLElement {
        constructor() {
          super();
          this.accordion = this.querySelector("component-accordion");
          if (window.Shopify.designMode) {
            this.addEventListener("shopify:block:select", ({ target }) => {
              this.accordion.openSelected(target);
            });
          }
        }
      }
    );
  }
};

// js/common/components/section-image-compare.js
var section_image_compare_default = () => {
  if (!customElements.get("section-image-compare")) {
    customElements.define(
      "section-image-compare",
      class ImageCompare extends HTMLElement {
        constructor() {
          super();
          this.imageComparison = this.querySelector("component-image-comparison");
          if (window.Shopify.designMode) {
            this.addEventListener("shopify:block:select", ({ target }) => {
              this.imageComparison.show(target.closest(".image-comparison__comparison")?.dataset?.compareSide);
            });
          }
        }
      }
    );
  }
};

// node_modules/morphdom/dist/morphdom-esm.js
var DOCUMENT_FRAGMENT_NODE = 11;
function morphAttrs(fromNode, toNode) {
  var toNodeAttrs = toNode.attributes;
  var attr;
  var attrName;
  var attrNamespaceURI;
  var attrValue;
  var fromValue;
  if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
    return;
  }
  for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
    attr = toNodeAttrs[i];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    attrValue = attr.value;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
      if (fromValue !== attrValue) {
        if (attr.prefix === "xmlns") {
          attrName = attr.name;
        }
        fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      fromValue = fromNode.getAttribute(attrName);
      if (fromValue !== attrValue) {
        fromNode.setAttribute(attrName, attrValue);
      }
    }
  }
  var fromNodeAttrs = fromNode.attributes;
  for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
    attr = fromNodeAttrs[d];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
        fromNode.removeAttributeNS(attrNamespaceURI, attrName);
      }
    } else {
      if (!toNode.hasAttribute(attrName)) {
        fromNode.removeAttribute(attrName);
      }
    }
  }
}
var range;
var NS_XHTML = "http://www.w3.org/1999/xhtml";
var doc = typeof document === "undefined" ? void 0 : document;
var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
function createFragmentFromTemplate(str) {
  var template = doc.createElement("template");
  template.innerHTML = str;
  return template.content.childNodes[0];
}
function createFragmentFromRange(str) {
  if (!range) {
    range = doc.createRange();
    range.selectNode(doc.body);
  }
  var fragment = range.createContextualFragment(str);
  return fragment.childNodes[0];
}
function createFragmentFromWrap(str) {
  var fragment = doc.createElement("body");
  fragment.innerHTML = str;
  return fragment.childNodes[0];
}
function toElement(str) {
  str = str.trim();
  if (HAS_TEMPLATE_SUPPORT) {
    return createFragmentFromTemplate(str);
  } else if (HAS_RANGE_SUPPORT) {
    return createFragmentFromRange(str);
  }
  return createFragmentFromWrap(str);
}
function compareNodeNames(fromEl, toEl) {
  var fromNodeName = fromEl.nodeName;
  var toNodeName = toEl.nodeName;
  var fromCodeStart, toCodeStart;
  if (fromNodeName === toNodeName) {
    return true;
  }
  fromCodeStart = fromNodeName.charCodeAt(0);
  toCodeStart = toNodeName.charCodeAt(0);
  if (fromCodeStart <= 90 && toCodeStart >= 97) {
    return fromNodeName === toNodeName.toUpperCase();
  } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
    return toNodeName === fromNodeName.toUpperCase();
  } else {
    return false;
  }
}
function createElementNS(name, namespaceURI) {
  return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name) : doc.createElementNS(namespaceURI, name);
}
function moveChildren(fromEl, toEl) {
  var curChild = fromEl.firstChild;
  while (curChild) {
    var nextChild = curChild.nextSibling;
    toEl.appendChild(curChild);
    curChild = nextChild;
  }
  return toEl;
}
function syncBooleanAttrProp(fromEl, toEl, name) {
  if (fromEl[name] !== toEl[name]) {
    fromEl[name] = toEl[name];
    if (fromEl[name]) {
      fromEl.setAttribute(name, "");
    } else {
      fromEl.removeAttribute(name);
    }
  }
}
var specialElHandlers = {
  OPTION: function(fromEl, toEl) {
    var parentNode = fromEl.parentNode;
    if (parentNode) {
      var parentName = parentNode.nodeName.toUpperCase();
      if (parentName === "OPTGROUP") {
        parentNode = parentNode.parentNode;
        parentName = parentNode && parentNode.nodeName.toUpperCase();
      }
      if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
        if (fromEl.hasAttribute("selected") && !toEl.selected) {
          fromEl.setAttribute("selected", "selected");
          fromEl.removeAttribute("selected");
        }
        parentNode.selectedIndex = -1;
      }
    }
    syncBooleanAttrProp(fromEl, toEl, "selected");
  },
  /**
   * The "value" attribute is special for the <input> element since it sets
   * the initial value. Changing the "value" attribute without changing the
   * "value" property will have no effect since it is only used to the set the
   * initial value.  Similar for the "checked" attribute, and "disabled".
   */
  INPUT: function(fromEl, toEl) {
    syncBooleanAttrProp(fromEl, toEl, "checked");
    syncBooleanAttrProp(fromEl, toEl, "disabled");
    if (fromEl.value !== toEl.value) {
      fromEl.value = toEl.value;
    }
    if (!toEl.hasAttribute("value")) {
      fromEl.removeAttribute("value");
    }
  },
  TEXTAREA: function(fromEl, toEl) {
    var newValue = toEl.value;
    if (fromEl.value !== newValue) {
      fromEl.value = newValue;
    }
    var firstChild = fromEl.firstChild;
    if (firstChild) {
      var oldValue = firstChild.nodeValue;
      if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
        return;
      }
      firstChild.nodeValue = newValue;
    }
  },
  SELECT: function(fromEl, toEl) {
    if (!toEl.hasAttribute("multiple")) {
      var selectedIndex = -1;
      var i = 0;
      var curChild = fromEl.firstChild;
      var optgroup;
      var nodeName;
      while (curChild) {
        nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
        if (nodeName === "OPTGROUP") {
          optgroup = curChild;
          curChild = optgroup.firstChild;
        } else {
          if (nodeName === "OPTION") {
            if (curChild.hasAttribute("selected")) {
              selectedIndex = i;
              break;
            }
            i++;
          }
          curChild = curChild.nextSibling;
          if (!curChild && optgroup) {
            curChild = optgroup.nextSibling;
            optgroup = null;
          }
        }
      }
      fromEl.selectedIndex = selectedIndex;
    }
  }
};
var ELEMENT_NODE = 1;
var DOCUMENT_FRAGMENT_NODE$1 = 11;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
function noop() {
}
function defaultGetNodeKey(node) {
  if (node) {
    return node.getAttribute && node.getAttribute("id") || node.id;
  }
}
function morphdomFactory(morphAttrs2) {
  return function morphdom2(fromNode, toNode, options) {
    if (!options) {
      options = {};
    }
    if (typeof toNode === "string") {
      if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
        var toNodeHtml = toNode;
        toNode = doc.createElement("html");
        toNode.innerHTML = toNodeHtml;
      } else {
        toNode = toElement(toNode);
      }
    } else if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
      toNode = toNode.firstElementChild;
    }
    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
    var onNodeAdded = options.onNodeAdded || noop;
    var onBeforeElUpdated = options.onBeforeElUpdated || noop;
    var onElUpdated = options.onElUpdated || noop;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
    var onNodeDiscarded = options.onNodeDiscarded || noop;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
    var skipFromChildren = options.skipFromChildren || noop;
    var addChild = options.addChild || function(parent, child) {
      return parent.appendChild(child);
    };
    var childrenOnly = options.childrenOnly === true;
    var fromNodesLookup = /* @__PURE__ */ Object.create(null);
    var keyedRemovalList = [];
    function addKeyedRemoval(key) {
      keyedRemovalList.push(key);
    }
    function walkDiscardedChildNodes(node, skipKeyedNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = void 0;
          if (skipKeyedNodes && (key = getNodeKey(curChild))) {
            addKeyedRemoval(key);
          } else {
            onNodeDiscarded(curChild);
            if (curChild.firstChild) {
              walkDiscardedChildNodes(curChild, skipKeyedNodes);
            }
          }
          curChild = curChild.nextSibling;
        }
      }
    }
    function removeNode(node, parentNode, skipKeyedNodes) {
      if (onBeforeNodeDiscarded(node) === false) {
        return;
      }
      if (parentNode) {
        parentNode.removeChild(node);
      }
      onNodeDiscarded(node);
      walkDiscardedChildNodes(node, skipKeyedNodes);
    }
    function indexTree(node) {
      if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = getNodeKey(curChild);
          if (key) {
            fromNodesLookup[key] = curChild;
          }
          indexTree(curChild);
          curChild = curChild.nextSibling;
        }
      }
    }
    indexTree(fromNode);
    function handleNodeAdded(el) {
      onNodeAdded(el);
      var curChild = el.firstChild;
      while (curChild) {
        var nextSibling = curChild.nextSibling;
        var key = getNodeKey(curChild);
        if (key) {
          var unmatchedFromEl = fromNodesLookup[key];
          if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
            curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
            morphEl(unmatchedFromEl, curChild);
          } else {
            handleNodeAdded(curChild);
          }
        } else {
          handleNodeAdded(curChild);
        }
        curChild = nextSibling;
      }
    }
    function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
      while (curFromNodeChild) {
        var fromNextSibling = curFromNodeChild.nextSibling;
        if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
          addKeyedRemoval(curFromNodeKey);
        } else {
          removeNode(
            curFromNodeChild,
            fromEl,
            true
            /* skip keyed nodes */
          );
        }
        curFromNodeChild = fromNextSibling;
      }
    }
    function morphEl(fromEl, toEl, childrenOnly2) {
      var toElKey = getNodeKey(toEl);
      if (toElKey) {
        delete fromNodesLookup[toElKey];
      }
      if (!childrenOnly2) {
        var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
        if (beforeUpdateResult === false) {
          return;
        } else if (beforeUpdateResult instanceof HTMLElement) {
          fromEl = beforeUpdateResult;
          indexTree(fromEl);
        }
        morphAttrs2(fromEl, toEl);
        onElUpdated(fromEl);
        if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
          return;
        }
      }
      if (fromEl.nodeName !== "TEXTAREA") {
        morphChildren(fromEl, toEl);
      } else {
        specialElHandlers.TEXTAREA(fromEl, toEl);
      }
    }
    function morphChildren(fromEl, toEl) {
      var skipFrom = skipFromChildren(fromEl, toEl);
      var curToNodeChild = toEl.firstChild;
      var curFromNodeChild = fromEl.firstChild;
      var curToNodeKey;
      var curFromNodeKey;
      var fromNextSibling;
      var toNextSibling;
      var matchingFromEl;
      outer:
        while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (!skipFrom && curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                        curFromNodeKey = getNodeKey(curFromNodeChild);
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
            if (!skipFrom) {
              addChild(fromEl, matchingFromEl);
            }
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
              }
              addChild(fromEl, curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
      cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
      var specialElHandler = specialElHandlers[fromEl.nodeName];
      if (specialElHandler) {
        specialElHandler(fromEl, toEl);
      }
    }
    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;
    if (!childrenOnly) {
      if (morphedNodeType === ELEMENT_NODE) {
        if (toNodeType === ELEMENT_NODE) {
          if (!compareNodeNames(fromNode, toNode)) {
            onNodeDiscarded(fromNode);
            morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
          }
        } else {
          morphedNode = toNode;
        }
      } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
        if (toNodeType === morphedNodeType) {
          if (morphedNode.nodeValue !== toNode.nodeValue) {
            morphedNode.nodeValue = toNode.nodeValue;
          }
          return morphedNode;
        } else {
          morphedNode = toNode;
        }
      }
    }
    if (morphedNode === toNode) {
      onNodeDiscarded(fromNode);
    } else {
      if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
        return;
      }
      morphEl(morphedNode, toNode, childrenOnly);
      if (keyedRemovalList) {
        for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
          var elToRemove = fromNodesLookup[keyedRemovalList[i]];
          if (elToRemove) {
            removeNode(elToRemove, elToRemove.parentNode, false);
          }
        }
      }
    }
    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
      if (morphedNode.actualize) {
        morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
      }
      fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }
    return morphedNode;
  };
}
var morphdom = morphdomFactory(morphAttrs);
var morphdom_esm_default = morphdom;

// js/common/lib/helpers.js
function morph(fromEl, toEl) {
  morphdom_esm_default(fromEl, toEl, {
    onBeforeElUpdated: function(fromEl2, toEl2) {
      if (fromEl2.isEqualNode(toEl2)) {
        return false;
      }
      return true;
    }
  });
}
function updateContent(selector, container, parsedHTML) {
  const from = container.querySelector(selector);
  const to = parsedHTML.querySelector(selector);
  if (from && to) {
    morph(from, to);
  }
}
function debounce(fn, wait) {
  let t2;
  return (...args) => {
    clearTimeout(t2);
    t2 = setTimeout(() => fn.apply(this, args), wait);
  };
}
function replaceHTMLElement(selector, newDoc, oldDoc = document) {
  const replacementElement = newDoc.querySelector(selector);
  const toBeReplacedElement = oldDoc.querySelector(selector);
  if (replacementElement && toBeReplacedElement) {
    toBeReplacedElement.parentElement.replaceChild(replacementElement, toBeReplacedElement);
  }
}
function replaceHTMLElements(selector, newDoc, oldDoc = document) {
  const replacementElements = newDoc.querySelectorAll(selector);
  const toBeReplacedElements = oldDoc.querySelectorAll(selector);
  if (replacementElements.length && toBeReplacedElements.length && replacementElements.length === toBeReplacedElements.length) {
    for (let index = 0; index < replacementElements.length; index++) {
      toBeReplacedElements[index].parentElement.replaceChild(replacementElements[index], toBeReplacedElements[index]);
    }
  }
}

// node_modules/ftdomdelegate/main.js
function Delegate(root) {
  this.listenerMap = [{}, {}];
  if (root) {
    this.root(root);
  }
  this.handle = Delegate.prototype.handle.bind(this);
  this._removedListeners = [];
}
Delegate.prototype.root = function(root) {
  const listenerMap = this.listenerMap;
  let eventType;
  if (this.rootElement) {
    for (eventType in listenerMap[1]) {
      if (listenerMap[1].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, true);
      }
    }
    for (eventType in listenerMap[0]) {
      if (listenerMap[0].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, false);
      }
    }
  }
  if (!root || !root.addEventListener) {
    if (this.rootElement) {
      delete this.rootElement;
    }
    return this;
  }
  this.rootElement = root;
  for (eventType in listenerMap[1]) {
    if (listenerMap[1].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, true);
    }
  }
  for (eventType in listenerMap[0]) {
    if (listenerMap[0].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, false);
    }
  }
  return this;
};
Delegate.prototype.captureForType = function(eventType) {
  return ["blur", "error", "focus", "load", "resize", "scroll"].indexOf(eventType) !== -1;
};
Delegate.prototype.on = function(eventType, selector, handler, useCapture) {
  let root;
  let listenerMap;
  let matcher;
  let matcherParam;
  if (!eventType) {
    throw new TypeError("Invalid event type: " + eventType);
  }
  if (typeof selector === "function") {
    useCapture = handler;
    handler = selector;
    selector = null;
  }
  if (useCapture === void 0) {
    useCapture = this.captureForType(eventType);
  }
  if (typeof handler !== "function") {
    throw new TypeError("Handler must be a type of Function");
  }
  root = this.rootElement;
  listenerMap = this.listenerMap[useCapture ? 1 : 0];
  if (!listenerMap[eventType]) {
    if (root) {
      root.addEventListener(eventType, this.handle, useCapture);
    }
    listenerMap[eventType] = [];
  }
  if (!selector) {
    matcherParam = null;
    matcher = matchesRoot.bind(this);
  } else if (/^[a-z]+$/i.test(selector)) {
    matcherParam = selector;
    matcher = matchesTag;
  } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
    matcherParam = selector.slice(1);
    matcher = matchesId;
  } else {
    matcherParam = selector;
    matcher = Element.prototype.matches;
  }
  listenerMap[eventType].push({
    selector,
    handler,
    matcher,
    matcherParam
  });
  return this;
};
Delegate.prototype.off = function(eventType, selector, handler, useCapture) {
  let i;
  let listener;
  let listenerMap;
  let listenerList;
  let singleEventType;
  if (typeof selector === "function") {
    useCapture = handler;
    handler = selector;
    selector = null;
  }
  if (useCapture === void 0) {
    this.off(eventType, selector, handler, true);
    this.off(eventType, selector, handler, false);
    return this;
  }
  listenerMap = this.listenerMap[useCapture ? 1 : 0];
  if (!eventType) {
    for (singleEventType in listenerMap) {
      if (listenerMap.hasOwnProperty(singleEventType)) {
        this.off(singleEventType, selector, handler);
      }
    }
    return this;
  }
  listenerList = listenerMap[eventType];
  if (!listenerList || !listenerList.length) {
    return this;
  }
  for (i = listenerList.length - 1; i >= 0; i--) {
    listener = listenerList[i];
    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
      this._removedListeners.push(listener);
      listenerList.splice(i, 1);
    }
  }
  if (!listenerList.length) {
    delete listenerMap[eventType];
    if (this.rootElement) {
      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
    }
  }
  return this;
};
Delegate.prototype.handle = function(event) {
  let i;
  let l;
  const type = event.type;
  let root;
  let phase;
  let listener;
  let returned;
  let listenerList = [];
  let target;
  const eventIgnore = "ftLabsDelegateIgnore";
  if (event[eventIgnore] === true) {
    return;
  }
  target = event.target;
  if (target.nodeType === 3) {
    target = target.parentNode;
  }
  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }
  root = this.rootElement;
  phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);
  switch (phase) {
    case 1:
      listenerList = this.listenerMap[1][type];
      break;
    case 2:
      if (this.listenerMap[0] && this.listenerMap[0][type]) {
        listenerList = listenerList.concat(this.listenerMap[0][type]);
      }
      if (this.listenerMap[1] && this.listenerMap[1][type]) {
        listenerList = listenerList.concat(this.listenerMap[1][type]);
      }
      break;
    case 3:
      listenerList = this.listenerMap[0][type];
      break;
  }
  let toFire = [];
  l = listenerList.length;
  while (target && l) {
    for (i = 0; i < l; i++) {
      listener = listenerList[i];
      if (!listener) {
        break;
      }
      if (target.tagName && ["button", "input", "select", "textarea"].indexOf(target.tagName.toLowerCase()) > -1 && target.hasAttribute("disabled")) {
        toFire = [];
      } else if (listener.matcher.call(target, listener.matcherParam, target)) {
        toFire.push([event, target, listener]);
      }
    }
    if (target === root) {
      break;
    }
    l = listenerList.length;
    target = target.parentElement || target.parentNode;
    if (target instanceof HTMLDocument) {
      break;
    }
  }
  let ret;
  for (i = 0; i < toFire.length; i++) {
    if (this._removedListeners.indexOf(toFire[i][2]) > -1) {
      continue;
    }
    returned = this.fire.apply(this, toFire[i]);
    if (returned === false) {
      toFire[i][0][eventIgnore] = true;
      toFire[i][0].preventDefault();
      ret = false;
      break;
    }
  }
  return ret;
};
Delegate.prototype.fire = function(event, target, listener) {
  return listener.handler.call(target, event, target);
};
function matchesTag(tagName, element) {
  return tagName.toLowerCase() === element.tagName.toLowerCase();
}
function matchesRoot(selector, element) {
  if (this.rootElement === window) {
    return (
      // Match the outer document (dispatched from document)
      element === document || // The <html> element (dispatched from document.body or document.documentElement)
      element === document.documentElement || // Or the window itself (dispatched from window)
      element === window
    );
  }
  return this.rootElement === element;
}
function matchesId(id, element) {
  return id === element.id;
}
Delegate.prototype.destroy = function() {
  this.off();
  this.root();
};
var main_default = Delegate;

// js/common/lib/sticky-offset.js
var sticky_offset_default = (node) => {
  const offsetEls = node.querySelectorAll(".sticky-offset");
  if (!offsetEls.length)
    return;
  setStickyOffsets(offsetEls);
  elementResize_default(node, () => {
    setStickyOffsets(offsetEls);
  });
  function setStickyOffsets() {
    offsetEls.forEach(setStickyOffset);
  }
  function setStickyOffset(element) {
    const elementHeight = element.offsetHeight;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const headerIsSticky = document.documentElement.classList.contains("header-is-sticky");
    const headerHeight = document.body.querySelector("section-header")?.offsetHeight || 0;
    const announcementBarHeight = document.body.querySelector("section-announcement-bar")?.offsetHeight || 0;
    let offset = "";
    if (headerIsSticky) {
      if (elementHeight - (windowHeight - (headerHeight + announcementBarHeight)) > 0) {
        offset = `${headerHeight - (elementHeight - (windowHeight - headerHeight))}px`;
      } else {
        offset = `${headerHeight - 1}px`;
      }
    } else {
      if (elementHeight - windowHeight > 0) {
        offset = `-${elementHeight - windowHeight}px`;
      } else {
        offset = `0px`;
      }
    }
    element.style.setProperty("--sticky-offset", offset);
  }
};

// js/common/components/section-product.js
var section_product_default = () => {
  if (!customElements.get("section-product")) {
    customElements.define(
      "section-product",
      class Product extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            content: ".product__details-content",
            updateUnavailable: "[data-update-unavailable]",
            quantitySelector: "[data-product-quantity-selector]",
            showDynamic: "[data-show-dynamic]",
            dynamicPaymentButton: ".shopify-payment-button",
            variantSelectors: "component-product-variant-selectors",
            mediaGallery: "component-product-media-gallery",
            quickBuyWidget: "component-product-quick-buy-widget"
          };
          const { id, productUrl, mediaLayoutMobile, mediaLayoutDesktop, shouldUpdateUrl, canAddAsRecentlyViewed } = this.dataset;
          this.id = id;
          this.productUrl = productUrl;
          this.mediaLayoutDesktop = mediaLayoutDesktop;
          this.mediaLayoutMobile = mediaLayoutMobile;
          this.shouldUpdateUrl = shouldUpdateUrl;
          this.delegate = new main_default(this);
          this.mediaGallery = this.querySelector(this.selectors.mediaGallery);
          this.quickBuyWidget = this.querySelector(this.selectors.quickBuyWidget);
          sticky_offset_default(this);
          document.addEventListener(
            ["theme-variantOption:changed"],
            (details) => {
              if (details.detail.sectionId === this.id)
                this.handleProductSelectorChange(details);
            },
            false
          );
          document.addEventListener("theme-cart:updated", () => this.handleCartChange(), false);
          this.stickyElm = this.querySelector(".product__block.sticky");
          this.stickyPlaceholder = this.querySelector(".sticky-placeholder");
          if (this.stickyElm) {
            this.initStickyPurchaseBar();
          }
          this.variantSelectors = this.querySelector(this.selectors.variantSelectors);
          if (this.variantSelectors) {
            this.selectedOptions = this.variantSelectors.selectedOptions ? this.variantSelectors.selectedOptions() : "";
          }
          if (canAddAsRecentlyViewed === "true") {
            this.addRecentlyViewed(this.dataset.productId, this.dataset.productHandle);
          }
        }
        handleCartChange() {
          const url = this.buildRequestUrlWithParams(this.productUrl, this.selectedOptions ? this.selectedOptions : {});
          fetch(url).then((response) => response.text()).then((responseText) => {
            const html = responseText;
            const parsedHTML = new DOMParser().parseFromString(html, "text/html");
            updateContent("[data-update-price]", this, parsedHTML);
            updateContent("[data-update-buy-buttons-tunneled]", this, parsedHTML);
            updateContent("[data-widget-price]", this, parsedHTML);
            updateContent("[data-update-quantity]", this, parsedHTML);
            updateContent("[data-update-buy-buttons]", this, parsedHTML);
          });
        }
        handleProductSelectorChange({ detail }) {
          if (detail.selectedOptions) {
            this.selectedOptions = detail.selectedOptions;
          }
          const url = this.buildRequestUrlWithParams(this.productUrl, this.selectedOptions ? this.selectedOptions : {});
          this.renderFromFetch(url);
        }
        renderFromFetch(url) {
          fetch(url).then((response) => response.text()).then((responseText) => {
            const html = responseText;
            let parsedHTML = new DOMParser().parseFromString(html, "text/html");
            let shouldUpdateImages = false;
            const productDetails = parsedHTML.querySelector(this.selectors.content);
            const selectedVariant = parsedHTML.querySelector("[data-selected-variant]")?.innerHTML;
            const selectedVariantData = selectedVariant ? JSON.parse(selectedVariant) : null;
            if (selectedVariantData) {
              this.updateURL(productDetails.dataset.productUrl, selectedVariantData.id);
              this.querySelector("component-pickup-availability")?.update(selectedVariantData.id);
              const galleryType = ["desktop", "desktop-wide", "desktop-x-wide"].includes(
                window.theme.breakPoints.currentBreakpoint
              ) ? this.mediaLayoutDesktop : this.mediaLayoutMobile;
              if (selectedVariantData.featured_media?.id) {
                if (this.dataset.selectionInputSource == "quick-buy") {
                  this.quickBuyWidget.updateProductImage(selectedVariantData.featured_media.id);
                } else if (galleryType == "swiper") {
                  this.mediaGallery.slideToActiveMedia(selectedVariantData.featured_media.id);
                } else if (galleryType == "thumbs") {
                  this.mediaGallery.updateActiveMedia(selectedVariantData.featured_media.id);
                  this.mediaGallery.updateActiveThumb(selectedVariantData.featured_media.id);
                } else if (galleryType == "1_column" || galleryType == "2_column") {
                  shouldUpdateImages = true;
                }
              }
            }
            if (this.querySelector(".product-quick-buy-widget.active")) {
              parsedHTML.querySelector(".product-quick-buy-widget").classList.add("active");
              parsedHTML.querySelector(".product-quick-buy-widget__trigger").setAttribute("aria-expanded", true);
            }
            if (selectedVariantData) {
              updateContent("[data-update-hidden-id]", this, parsedHTML);
              updateContent("[data-update-buy-buttons]", this, parsedHTML);
              updateContent("[data-update-price]", this, parsedHTML);
              updateContent("[data-update-quantity]", this, parsedHTML);
              updateContent("[data-update-sku]", this, parsedHTML);
              updateContent("[data-update-variant-picker]", this, parsedHTML);
              if (shouldUpdateImages) {
                updateContent("[data-update-images]", this, parsedHTML);
                this.querySelectorAll(".shimmer").forEach((el) => el.classList.remove("shimmer"));
              }
            } else {
              updateContent("[data-update-price]", this, parsedHTML);
              updateContent("[data-update-buy-buttons-tunneled]", this, parsedHTML);
              updateContent("[data-widget-price]", this, parsedHTML);
            }
            replaceHTMLElement('[data-shopify="payment-button"]', parsedHTML, this);
            window.Shopify.PaymentButton?.init();
          });
        }
        buildRequestUrlWithParams(url, optionValues) {
          const params = [];
          params.push(`section_id=${this.id}`);
          if (optionValues.length) {
            params.push(`option_values=${optionValues.join(",")}`);
          }
          return `${url}?${params.join("&")}`;
        }
        updateURL(url, variantId) {
          if (this.shouldUpdateUrl !== "true")
            return;
          window.history.replaceState({}, "", `${url}${variantId ? `?variant=${variantId}` : ""}`);
        }
        initStickyPurchaseBar() {
          const observer = new IntersectionObserver(
            ([e2]) => {
              this.stickyElm.classList.toggle("is-stuck", e2.boundingClientRect.top < 0);
              this.stickyPlaceholder.classList.toggle("active", e2.boundingClientRect.top < 0);
            },
            { threshold: [1] }
          );
          observer.observe(this.querySelector(".sticky-sentinel"));
          this.delegate.on("click", this.selectors.showDynamic, () => {
            const paymentButton = this.querySelector(this.selectors.dynamicPaymentButton);
            paymentButton?.classList.toggle("active");
          });
          elementResize_default(this, () => {
            this.setStickyPlaceholderHeight();
          });
        }
        setStickyPlaceholderHeight() {
          if (this.stickyElm.classList.contains("is-stuck")) {
            return;
          }
          this.stickyPlaceholder.style.setProperty("--placeholder-height", `${this.stickyElm.offsetHeight}px`);
        }
        addRecentlyViewed(productId, productHandle) {
          this.recentlyViewedKey = "theme-recently-viewed";
          const currentItems = getLocalStorageItem(this.recentlyViewedKey) || [];
          if (currentItems?.some((e2) => e2.id === productId))
            return;
          const requestUrl = `${window.routes.products}/${encodeURIComponent(
            productHandle
          )}?section_id=fetch-recently-viewed-item`;
          fetch(requestUrl).then((response) => response.text()).then((responseText) => {
            if (currentItems) {
              currentItems.push({ id: productId, handle: productHandle, content: responseText });
              setLocalStorageItem(this.recentlyViewedKey, JSON.stringify(currentItems));
            } else {
              const item = {
                id: productId,
                handle: productHandle,
                content: responseText
              };
              setLocalStorageItem(this.recentlyViewedKey, JSON.stringify([item]));
            }
          });
        }
      }
    );
  }
};

// js/common/components/section-quick-cart.js
var section_quick_cart_default = () => {
  if (!customElements.get("section-quick-cart")) {
    customElements.define(
      "section-quick-cart",
      class QuickCart extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            quickCartTrigger: '[data-sub-id="quickCart"]',
            quickCartFooter: "[data-quick-cart-footer]",
            quickCartError: "[data-quick-cart-error]",
            quickCartErrorProduct: "[data-quick-cart-error-product]",
            quickCartErrorDescription: "[data-quick-cart-error-description]"
          };
          const { sectionId, cartItemCount } = this.dataset;
          this.sectionId = sectionId;
          this.cartItemCount = cartItemCount;
          this.cartCounters = document.querySelectorAll("[data-cart-counter]");
          this.quickCartTrigger = document.querySelector(this.selectors.quickCartTrigger);
          this.quickCartFooter = document.querySelector(this.selectors.quickCartFooter);
          this.quickCartError = this.querySelector(this.selectors.quickCartError);
          this.quickCartErrorProduct = this.querySelector(this.selectors.quickCartErrorProduct);
          this.quickCartErrorDescription = this.querySelector(this.selectors.quickCartErrorDescription);
          this.panelWrapper = this.closest("component-panel");
          this.quickCartTrigger.addEventListener("click", (e2) => e2.preventDefault());
          this.initListners();
        }
        initListners() {
          document.addEventListener("theme-cart:updated", ({ detail }) => this.handleUpdate(detail));
        }
        handleUpdate(detail) {
          this.quickCartError.classList.remove("active");
          fetch(`${routes.cart_url}?section_id=${this.sectionId}`).then((response) => response.text()).then((responseText) => {
            const parsedHTML = new DOMParser().parseFromString(responseText, "text/html");
            const count = parsedHTML.querySelector("section-quick-cart").dataset.cartItemCount;
            this.setAttribute("data-cart-item-count", count);
            this.quickCartFooter.setAttribute("data-cart-item-count", count);
            this.cartCounters.forEach((counter) => {
              counter.classList.toggle("active", count !== "0");
              counter.querySelector("[data-cart-count]").innerHTML = count !== "0" ? count : "";
            });
            updateContent("[data-update-items]", this.panelWrapper, parsedHTML);
            updateContent("[data-update-free-shipping-bar]", this.panelWrapper, parsedHTML);
            updateContent("[data-update-discounts]", this.panelWrapper, parsedHTML);
            updateContent("[data-update-total]", this.panelWrapper, parsedHTML);
            if (detail.error) {
              this.quickCartErrorProduct.innerText = detail.productTitle;
              this.quickCartErrorDescription.innerText = detail.error;
              this.quickCartError.classList.add("active");
            }
            if (detail.shouldOpenCart) {
              document.dispatchEvent(new CustomEvent(`theme-quickCart:open`));
            }
          }).catch((e2) => {
            console.error(e2);
          });
        }
      }
    );
  }
};

// js/common/components/section-cart.js
var section_cart_default = () => {
  if (!customElements.get("section-cart")) {
    customElements.define(
      "section-cart",
      class Cart extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            updateOnChange: "[data-update-on-change]"
          };
          const { sectionId, cartItemCount } = this.dataset;
          this.sectionId = sectionId;
          this.cartItemCount = cartItemCount;
          this.cartCounters = document.querySelectorAll("[data-cart-counter]");
          this.initListeners();
        }
        initListeners() {
          document.addEventListener("theme-cart:updated", () => this.handleUpdate());
        }
        handleUpdate() {
          fetch(`${routes.cart_url}?section_id=${this.sectionId}`).then((response) => response.text()).then((responseText) => {
            const parsedHTML = new DOMParser().parseFromString(responseText, "text/html");
            const parsedSection = parsedHTML.querySelector("section-cart");
            const count = parsedSection.dataset.cartItemCount;
            this.setAttribute("data-cart-item-count", count);
            if (!document.querySelector("section-quick-cart")) {
              this.cartCounters.forEach((counter) => {
                counter.classList.toggle("active", count !== "0");
                counter.querySelector("[data-cart-count]").innerHTML = count !== "0" ? count : "";
              });
            }
            updateContent("[data-update-items]", this, parsedHTML);
            updateContent("[data-update-free-shipping-bar]", this, parsedHTML);
            updateContent("[data-update-discounts]", this, parsedHTML);
            updateContent("[data-update-total]", this, parsedHTML);
            updateContent("[data-update-tax-note]", this, parsedHTML);
          }).catch((e2) => {
            console.error(e2);
          });
        }
      }
    );
  }
};

// js/common/components/section-announcement-bar.js
import { Swiper, Navigation, Autoplay } from "vendor";

// js/common/lib/marquee.js
var InfiniteMarquee = class {
  constructor(e2 = {}) {
    this.element = e2.element, this.direction = e2.direction || "left", this.spaceBetween = e2.spaceBetween || "0px", this.gap = { vertical: e2.gap && e2.gap.vertical || "5px", horizontal: e2.gap && e2.gap.horizontal || "0px" }, this.speed = e2.speed || 1e4, this.fullContainer = e2.fullContainer || false, this.smoothEdges = e2.smoothEdges || false, this.pauseOnHover = e2.pauseOnHover || false, this.duplicateCount = e2.duplicateCount || 1, this.breakpointSize = e2.breakpointSize || 1023, this.desktopBreakpoint = this.breakpointSize + 1, this.mobileSettings = e2.mobileSettings || {}, this.destroyOnDesktop = e2.destroyOnDesktop || false, this.destroyOnMobile = e2.destroyOnMobile || false, this.elementClass = e2.elementClass || "marquee-container", this.on = {
      beforeInit: e2.on && e2.on.beforeInit || null,
      afterInit: e2.on && e2.on.afterInit || null,
      pauseAnimation: e2.on && e2.on.pauseAnimation || null,
      resumeAnimation: e2.on && e2.on.resumeAnimation || null
    }, this.scrollType = "top" === e2.direction || "bottom" === e2.direction ? "vertical" : "horizontal", this.debugging = e2.debugging || false, this.animateMotion = true, this.isMarqueeInitialized = false, !this.isMarqueeInitialized && this.init(), "undefined" != typeof window && (this.destroyOnResponsive(), (this.destroyOnMobile || this.destroyOnDesktop) && window.addEventListener("resize", this.destroyOnResponsive.bind(this)));
  }
  init() {
    if ("undefined" == typeof window && "undefined" == typeof document || !(Array.isArray(this.element) ? this.element.length > 0 : this.element))
      this.debugging && console.error("\u{1F68A} Infinite Marquee - Failed to Initialize");
    else {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && (this.animateMotion = false), "function" == typeof this.on.beforeInit && this.on.beforeInit(), Array.isArray(this.element)) {
        this.isMarqueeInitialized = true;
        for (const e2 of this.element)
          this.configureChildNodes(e2), this.configureAnimationOptions(e2);
      } else
        this.isMarqueeInitialized = true, this.configureChildNodes(this.element), this.configureAnimationOptions(this.element);
      "function" == typeof this.on.afterInit && this.on.afterInit();
    }
  }
  configureChildNodes(e2) {
    const i = document.createElement("div");
    for (i.classList.add(`${this.scrollType}-marquee-inner`); e2.firstChild; )
      i.appendChild(e2.firstChild);
    e2.classList.add(`${this.scrollType}-marquee`);
    e2.appendChild(i);
    this.duplicateOriginalNodes(i);
    this.duplicateContainer(e2);
  }
  duplicateOriginalNodes(e2) {
    const i = e2.children, t2 = [];
    for (let e3 = 0; e3 < i.length; e3++) {
      const s = i[e3].cloneNode(true);
      s.setAttribute("aria-hidden", true);
      s.setAttribute("tabindex", "-1");
      t2.push(s);
    }
    for (const i2 of t2)
      e2.appendChild(i2);
  }
  duplicateContainer(e2) {
    const i = e2.querySelector(`.${this.scrollType}-marquee-inner`), t2 = i.cloneNode(true);
    t2.setAttribute("aria-hidden", true);
    const s = t2.children;
    for (let j = 0; j < s.length; j++) {
      s[j].removeAttribute("aria-hidden");
      s[j].setAttribute("tabindex", "-1");
    }
    const n = "vertical" === this.scrollType ? this.duplicateCount + 1 : this.duplicateCount, o = Array.from({ length: n }, () => t2.cloneNode(true));
    if (e2.append(...o), "vertical" === this.scrollType) {
      const t3 = e2.clientHeight - i.clientHeight;
      e2.style.setProperty("--_containerSize", `${t3}px`);
    }
  }
  configureAnimationOptions(e2) {
    if (this.pauseOnHover) {
      e2.addEventListener("mouseenter", () => this.pause());
      e2.addEventListener("mouseleave", () => this.resume());
    }
    const i = window.matchMedia(`(max-width: ${this.breakpointSize}px)`);
    e2.setAttribute("data-animate", this.animateMotion);
    const s = () => {
      if (this.isMarqueeInitialized) {
        const s2 = this.mobileSettings.direction || this.direction, n = "right" === s2 || "bottom" === s2, o = "right" === this.direction || "bottom" === this.direction, r = i.matches ? n ? "reverse" : "forwards" : o ? "reverse" : "forwards", a = i.matches && this.mobileSettings.speed || this.speed;
        if (e2.style.setProperty("--_speed", `${a}ms`), e2.style.setProperty("--_direction", r), this.smoothEdges && e2.classList.add("smooth"), "vertical" === this.scrollType) {
          const t2 = i.matches && this.mobileSettings && this.mobileSettings.gap && this.mobileSettings.gap.horizontal || this.gap.horizontal, s3 = i.matches && this.mobileSettings && this.mobileSettings.gap && this.mobileSettings.gap.vertical || this.gap.vertical;
          this.gap.horizontal && e2.style.setProperty("--_hGap", t2), this.gap.vertical && e2.style.setProperty("--_vGap", s3);
        } else {
          const t2 = i.matches && this.mobileSettings.spaceBetween || this.spaceBetween;
          e2.style.setProperty("--_gap", t2), this.fullContainer && e2.classList.add("full");
        }
      }
    };
    s(), window.addEventListener("resize", this.debounce(s));
  }
  destroyOnResponsive() {
    const e2 = `${this.scrollType}-marquee-inner`, i = this.element;
    "undefined" != typeof window && (window.innerWidth <= this.breakpointSize && this.destroyOnMobile ? this.manageMarquee(i, e2) : window.innerWidth >= this.desktopBreakpoint && this.destroyOnDesktop ? this.manageMarquee(i, e2) : this.isMarqueeInitialized || (this.init(), this.isMarqueeInitialized = true));
  }
  manageMarquee(e2, i) {
    this.isMarqueeInitialized && (this.destroy(e2, i), this.isMarqueeInitialized = false);
  }
  removeClassesAfter(e2, i) {
    if (i && i.classList) {
      let t2 = false;
      for (let s = 0; s < i.classList.length; s++) {
        const n = i.classList[s];
        t2 && (i.classList.remove(n), s--), n === e2 && (t2 = true);
      }
    }
  }
  destroy(e2, i) {
    if (e2) {
      e2.removeAttribute("style");
      const t2 = e2.querySelectorAll(`.${i}`);
      for (let i2 = 1; i2 < t2.length; i2++)
        e2.removeChild(t2[i2]);
      const s = e2.firstElementChild;
      if (s) {
        if (s.querySelectorAll('[aria-hidden="true"]').forEach(function(e3) {
          s.removeChild(e3);
        }), s.classList.contains(i)) {
          for (; s.firstChild; )
            e2.appendChild(s.firstChild);
          e2.removeChild(s), this.removeClassesAfter(this.elementClass, e2);
        }
      }
    }
  }
  pause() {
    this.element.classList.add("paused"), "function" == typeof this.on.pauseAnimation && this.on.pauseAnimation();
  }
  resume() {
    this.element.classList.remove("paused"), "function" == typeof this.on.resumeAnimation && this.on.resumeAnimation();
  }
  debounce(e2, i = 300) {
    let t2;
    return (...s) => {
      t2 && clearTimeout(t2), t2 = setTimeout(() => {
        e2(...s);
      }, i);
    };
  }
};

// js/common/components/section-announcement-bar.js
var section_announcement_bar_default = () => {
  if (!customElements.get("section-announcement-bar")) {
    customElements.define(
      "section-announcement-bar",
      class AnnouncementBar extends HTMLElement {
        constructor() {
          super();
          const { advancementType, rotateSpeed, scrollSpeed, scrollDirection } = this.dataset;
          if (advancementType == "rotate") {
            this.initSwiper(parseInt(rotateSpeed, 10));
            if (window.Shopify.designMode) {
              this.addEventListener("shopify:block:select", ({ target }) => {
                this.swiper?.autoplay.stop();
                this.swiper?.slideToLoop(target.dataset.index, 10);
              });
              this.addEventListener("shopify:block:deselect", () => {
                this.swiper?.autoplay.start();
              });
            }
          }
          if (advancementType == "scroll") {
            this.initScrollVars(parseInt(scrollSpeed, 10), scrollDirection);
          }
          this.setAnnouncementHeightVar();
          elementResize_default(this, () => {
            this.setAnnouncementHeightVar();
          });
        }
        setAnnouncementHeightVar() {
          this.setRootVariable("--announcement-height", `${this.offsetHeight}px`);
        }
        setRootVariable(varName, value) {
          const root = document.documentElement;
          root.style.setProperty(varName, value);
        }
        initSwiper(autoPlayDelay) {
          this.swiper = new Swiper(this, {
            modules: [Navigation, Autoplay],
            loop: true,
            a11y: {
              prevSlideMessage: window.accessibilityStrings.prevSlide,
              nextSlideMessage: window.accessibilityStrings.nextSlide
            },
            autoplay: {
              delay: autoPlayDelay * 1e3
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev"
            },
            on: {
              init: () => {
                this.classList.add("initialized");
                this.setAttribute("data-active-index", this.swiper.realIndex);
              },
              slideChange: () => {
                this.setAttribute("data-active-index", this.swiper.realIndex);
              }
            }
          });
        }
        initScrollVars(scrollSpeed, scrollDirection) {
          this.marquee = new InfiniteMarquee({
            element: this.querySelector(".marquee-container"),
            speed: scrollSpeed * 2e3,
            direction: scrollDirection,
            duplicateCount: 10,
            pauseOnHover: true,
            on: {
              afterInit: () => {
                this.classList.add("initialized");
                const slides = this.querySelectorAll(".announcement-bar__slide ");
                slides.forEach((element) => {
                  const elementIsHidden = element.ariaHidden || element.parentNode.ariaHidden;
                  if (elementIsHidden) {
                    Array.from(element.getElementsByTagName("a")).forEach(function(link) {
                      link.tabIndex = -1;
                    });
                  }
                });
              }
            }
          });
        }
      }
    );
  }
};

// js/common/components/section-slideshow.js
import { Swiper as Swiper2, Pagination, Autoplay as Autoplay2, EffectFade } from "vendor";
var section_slideshow_default = () => {
  if (!customElements.get("section-slideshow")) {
    customElements.define(
      "section-slideshow",
      class Slideshow extends HTMLElement {
        constructor() {
          super();
          this.autoPlayDelay = this.dataset.rotateSpeed ? parseInt(this.dataset.rotateSpeed, 10) : null;
          this.shouldFade = this.dataset.transitionStyle === "fade";
          this.slides = this.querySelectorAll("[data-slide]");
          if (window.Shopify.designMode) {
            this.addEventListener("shopify:block:select", ({ target }) => {
              this.swiper?.autoplay.stop();
              const parentSlideBlock = target.classList.contains("slideshow__slide") ? target : target.closest(".slideshow__slide");
              const targetSlide = parentSlideBlock.querySelector("[data-slide]");
              this.swiper?.slideToLoop(targetSlide.dataset.index, 10);
            });
            this.addEventListener("shopify:block:deselect", () => {
              this.swiper?.autoplay.start();
            });
          }
          this.slides.forEach((slide, index) => {
            slide.setAttribute("data-index", index);
            const style = window.getComputedStyle(slide);
            const paginationBackground = style.getPropertyValue("--pagination-background");
            const paginationForeground = style.getPropertyValue("--pagination-foreground");
            this.style.setProperty(`--pagination-background-${index}`, paginationBackground);
            this.style.setProperty(`--pagination-foreground-${index}`, paginationForeground);
          });
          this.swiper = new Swiper2(this, {
            modules: [Pagination, Autoplay2, EffectFade],
            slidesPerView: 1,
            loop: true,
            autoHeight: true,
            ...this.shouldFade && { effect: "fade" },
            ...this.shouldFade && { fadeEffect: { crossFade: true } },
            ...this.autoPlayDelay && { autoplay: { delay: this.autoPlayDelay } },
            a11y: {
              prevSlideMessage: window.accessibilityStrings.prevSlide,
              nextSlideMessage: window.accessibilityStrings.nextSlide
            },
            pagination: {
              el: ".swiper-pagination",
              renderBullet: function(index, className) {
                return `<button type="button" aria-label="${window.accessibilityStrings.goToSlide} ${index}" class="${className}"><div><span></span></div></button>`;
              },
              clickable: true
            },
            on: {
              init: () => {
                this.setAttribute("data-active-index", this.swiper.realIndex);
              },
              slideChange: () => {
                this.setAttribute("data-active-index", this.swiper.realIndex);
              }
            }
          });
        }
      }
    );
  }
};

// js/common/components/section-testimonials.js
import { Swiper as Swiper3, Navigation as Navigation2 } from "vendor";
var section_testimonials_default = () => {
  if (!customElements.get("section-testimonials")) {
    customElements.define(
      "section-testimonials",
      class Testimonials extends HTMLElement {
        constructor() {
          super();
          this.slides = this.querySelectorAll(".testimonials__item");
          this.swiper = new Swiper3(this.querySelector(".swiper"), {
            modules: [Navigation2],
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev"
            },
            spaceBetween: 10,
            slidesPerView: 1.1,
            loop: true,
            autoHeight: true,
            initialSlide: 2,
            breakpoints: {
              768: {
                spaceBetween: 12,
                slidesPerView: 2.1
              },
              1024: {
                spaceBetween: 16,
                slidesPerView: 3.1
              }
            },
            a11y: {
              prevSlideMessage: window.accessibilityStrings.prevSlide,
              nextSlideMessage: window.accessibilityStrings.nextSlide
            }
          });
        }
      }
    );
  }
};

// js/common/components/section-header.js
var section_header_default = () => {
  if (!customElements.get("section-header")) {
    customElements.define(
      "section-header",
      class Header extends HTMLElement {
        constructor() {
          super();
          this.displayMode = this.dataset.displayMode;
          this.classes = {
            isTransparent: "header--is-transparent"
          };
          this.megaMenus = this.querySelectorAll("component-mega-menu");
          this.resetHeaderClasses();
          document.documentElement.classList.add(`header-is-${this.displayMode}`);
          this.setHeaderHeightVar();
          elementResize_default(this, () => {
            this.setHeaderHeightVar();
          });
          if (this.displayMode === "sticky-on-scroll") {
            this.initStickyScroll();
          }
          this.setRootVariable("--header-offset", `${this.displayMode !== "static" ? this.offsetHeight : 0}px`);
          if (this.classList.contains(this.classes.isTransparent) && this.displayMode !== "static") {
            this.initTransparentScroll();
          }
          if (window.Shopify.designMode) {
            this.addEventListener("shopify:block:select", ({ target }) => {
              target.open();
            });
            this.addEventListener("shopify:block:deselect", () => {
              this.megaMenus.forEach((menu) => menu.close());
            });
          }
        }
        setHeaderHeightVar() {
          this.setRootVariable("--header-height", `${this.offsetHeight}px`);
        }
        setRootVariable(varName, value) {
          const root = document.documentElement;
          root.style.setProperty(varName, value);
        }
        initTransparentScroll() {
          this.didTransparentScroll;
          window.addEventListener("scroll", () => {
            this.didTransparentScroll = true;
          });
          setInterval(() => {
            if (this.didTransparentScroll) {
              const announcementBarHeight = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue("--announcement-height") || 0,
                0
              );
              this.classList.toggle(
                this.classes.isTransparent,
                this.offsetHeight > document.documentElement.scrollTop - announcementBarHeight
              );
              this.didTransparentScroll = false;
            }
          }, 250);
        }
        initStickyScroll() {
          this.didScroll;
          this.lastScrollTop = 0;
          this.delta = 5;
          window.addEventListener("scroll", () => {
            this.didScroll = true;
          });
          setInterval(() => {
            if (this.didScroll) {
              this.hasScrolled();
              this.didScroll = false;
            }
          }, 250);
        }
        hasScrolled() {
          const st = document.documentElement.scrollTop;
          const announcementBarHeight = getComputedStyle(document.documentElement).getPropertyValue("--announcement-height") || 0;
          const offset = this.offsetHeight + parseInt(announcementBarHeight, 10);
          if (Math.abs(this.lastScrollTop - st) <= this.delta)
            return;
          if (st > this.lastScrollTop && st > offset) {
            document.documentElement.classList.remove("header-is-sticky-on-scroll--down");
            document.documentElement.classList.add("header-is-sticky-on-scroll--up");
            document.documentElement.classList.remove("header-is-stuck");
            this.setRootVariable("--header-offset", "0px");
          } else {
            if (st + window.innerHeight < document.documentElement.scrollHeight) {
              document.documentElement.classList.remove("header-is-sticky-on-scroll--up");
              document.documentElement.classList.add("header-is-sticky-on-scroll--down");
              document.documentElement.classList.add("header-is-stuck");
              this.setRootVariable("--header-offset", `${this.offsetHeight}px`);
            }
          }
          this.lastScrollTop = st;
        }
        resetHeaderClasses() {
          document.documentElement.classList.remove("header-is-static");
          document.documentElement.classList.remove("header-is-sticky");
          document.documentElement.classList.remove("header-is-sticky-on-scroll");
          document.documentElement.classList.remove("header-is-sticky-on-scroll--up");
          document.documentElement.classList.remove("header-is-sticky-on-scroll--down");
          document.documentElement.classList.remove("header-is-stuck");
        }
      }
    );
  }
};

// js/common/components/section-logos-marquee.js
var section_logos_marquee_default = () => {
  if (!customElements.get("section-logos-marquee")) {
    customElements.define(
      "section-logos-marquee",
      class MarqueeLogos extends HTMLElement {
        constructor() {
          super();
          this.scrollSpeed = this.dataset.scrollSpeed;
          this.logoMaxWidth = this.dataset.logoMaxWidth;
          this.scrollDirection = this.dataset.scrollDirection;
          this.blocksCount = this.dataset.blocksSize === "0" ? 5 : this.dataset.blocksSize;
          this.initMarquee();
        }
        initMarquee() {
          this.marquee = new InfiniteMarquee({
            element: this.querySelector(".marquee-container"),
            speed: this.scrollSpeed * this.blocksCount * 5e3,
            direction: this.scrollDirection,
            spaceBetween: "var(--space-xs-s)",
            duplicateCount: this.getDuplicateCount(),
            pauseOnHover: true
          });
        }
        getDuplicateCount() {
          const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
          const logosWidth = this.logoMaxWidth * this.blocksCount;
          return Math.floor(windowWidth / logosWidth + 1);
        }
      }
    );
  }
};

// js/common/components/section-banner-marquee.js
var section_banner_marquee_default = () => {
  if (!customElements.get("section-banner-marquee")) {
    customElements.define(
      "section-banner-marquee",
      class MarqueeLogos extends HTMLElement {
        constructor() {
          super();
          this.scrollSpeed = parseFloat(this.dataset.scrollSpeed, 10);
          this.logoMaxWidth = this.dataset.logoMaxWidth;
          this.scrollDirection = this.dataset.scrollDirection;
          this.scrollElements = this.querySelectorAll(".banner-marquee__text-wrap");
          this.textWrapSize = [...this.scrollElements].reduce((acc, cur) => acc + cur.offsetWidth, 0);
          if (this.textWrapSize) {
            this.duplicateCount = this.getDuplicateCount();
            this.initMarquee();
          }
        }
        initMarquee() {
          this.marquee = new InfiniteMarquee({
            element: this.querySelector(".marquee-container"),
            speed: this.scrollSpeed * 1e4 / (this.duplicateCount + 1),
            direction: this.scrollDirection,
            duplicateCount: this.getDuplicateCount(),
            pauseOnHover: true
          });
        }
        getDuplicateCount() {
          const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
          return Math.floor(windowWidth / this.textWrapSize + 1);
        }
      }
    );
  }
};

// js/common/components/section-collection-banner.js
var section_collection_banner_default = () => {
  if (!customElements.get("section-collection-banner")) {
    customElements.define(
      "section-collection-banner",
      class CollectionBanner extends HTMLElement {
        constructor() {
          super();
          const description = this.querySelector("[data-collection-description]");
          if (description) {
            const readMoreButton = this.querySelector("[data-read-more]");
            const descriptionTemplate = this.querySelector("[data-collection-description-full]");
            if (description.clientHeight !== description.scrollHeight) {
              readMoreButton.classList.remove("hidden");
            }
            readMoreButton.addEventListener("click", () => {
              document.dispatchEvent(
                new CustomEvent("theme-modal:open", {
                  detail: { template: descriptionTemplate, heading: descriptionTemplate.dataset.modalHeader }
                })
              );
            });
          }
        }
      }
    );
  }
};

// js/common/components/section-search.js
var section_search_default = () => {
  if (!customElements.get("section-search")) {
    customElements.define(
      "section-search",
      class Search extends HTMLElement {
        constructor() {
          super();
          this.searchData = [];
          this.selectors = {
            searchInput: "[data-search-input]",
            resetButton: "[data-search-reset]"
          };
          this.searchInput = this.querySelector(this.selectors.searchInput);
          this.resetButton = this.querySelector(this.selectors.resetButton);
          this.initListeners();
        }
        initListeners() {
          this.searchInput.addEventListener("input", (e2) => {
            if (e2.target.value) {
              this.resetButton.classList.add("visible");
            } else {
              this.resetButton.click();
            }
          });
          this.resetButton.addEventListener("click", () => {
            this.reset();
          });
        }
        reset() {
          this.resetButton.classList.remove("visible");
          this.searchInput.setAttribute("value", "");
          this.searchInput.focus();
        }
      }
    );
  }
};

// js/common/components/section-video-hero.js
var section_video_hero_default = () => {
  if (!customElements.get("section-video-hero")) {
    customElements.define(
      "section-video-hero",
      class VideoHero extends HTMLElement {
        constructor() {
          super();
          this.template = this.querySelector("template");
          this.posterImage = this.querySelector(".video-hero__image");
          this.playButton = this.querySelector(".video-hero__play-button");
          this.hasLocalVid = this.dataset.hasLocalVideo === "true";
          if (!this.hasLocalVid)
            return;
          this.setAttribute("data-animate-paused", true);
          document.addEventListener("theme-delayed-video:loaded", ({ detail }) => {
            if (this.template === detail.template) {
              this.videos = this.querySelectorAll("video");
              this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
                rootMargin: "0px 0px 0px 0px"
              });
              this.observer.observe(this);
            }
          });
          this.addEventListener("click", this.showVideo, { once: true });
        }
        onIntersection(elements, observer) {
          elements.forEach((element) => {
            if (element.isIntersecting) {
              this.showVideo();
            }
          });
        }
        showVideo() {
          this.posterImage?.classList.add("hidden");
          this.playButton?.classList.add("hidden");
          this.removeAttribute("data-animate-paused");
          this.videos.forEach((video) => {
            video.play();
          });
        }
      }
    );
  }
};

// js/common/components/section-facet-grid.js
var section_facet_grid_default = () => {
  if (!customElements.get("section-facet-grid")) {
    customElements.define(
      "section-facet-grid",
      class FacetGrid extends HTMLElement {
        constructor() {
          super();
          this.template = this.querySelector("template");
          document.addEventListener("theme-delayed-video:loaded", ({ detail }) => {
            if (this.template === detail.template) {
              this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
                rootMargin: "0px 0px 0px 0px"
              });
              this.observer.observe(this);
            }
          });
        }
        onIntersection(elements, observer) {
          elements.forEach((element) => {
            if (element.isIntersecting) {
              this.querySelectorAll("video").forEach((video) => video.play());
              observer.unobserve(this);
            }
          });
        }
      }
    );
  }
};

// js/common/global-events.js
var global_events_default = (target = document) => {
  target.querySelectorAll(".rte table").forEach((table) => {
    const div = document.createElement("div");
    div.classList.add("rte-table-wrap");
    table.parentNode.insertBefore(div, table);
    div.appendChild(table);
  });
  if (target === document) {
    document.addEventListener("theme-videos:pause", () => {
      document.querySelectorAll(".js-youtube").forEach((video) => {
        video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
      });
      document.querySelectorAll(".js-vimeo").forEach((video) => {
        video.contentWindow.postMessage('{"method":"pause"}', "*");
      });
      document.querySelectorAll("video").forEach((video) => video.pause());
      document.querySelectorAll("product-model").forEach((model) => {
        if (model.modelViewerUI)
          model.modelViewerUI.pause();
      });
    });
  }
};

// js/common/components/component-modal.js
var component_modal_default = () => {
  if (!customElements.get("component-modal")) {
    customElements.define(
      "component-modal",
      class Modal extends HTMLElement {
        constructor() {
          super();
          this.innerContent = this.querySelector(".modal__content");
          this.modalHeader = this.querySelector(".modal__header");
          this.focusTrap = createFocusTrap(this, { allowOutsideClick: true });
          document.addEventListener("theme-modal:open", (e2) => this.openModal(e2), false);
          document.addEventListener("theme-modal:close", () => this.closeModal(), false);
          this.addEventListener("keydown", ({ key }) => {
            if (key === "Escape")
              this.closeModal();
          });
        }
        openModal(e2) {
          const content = e2.detail.template.tagName.toLowerCase() === "template" ? e2.detail.template.content.cloneNode(true) : e2.detail.template;
          const header = e2.detail.heading ? e2.detail.heading : "";
          const hasPageContent = e2.detail.hasPageContent ? e2.detail.hasPageContent : "";
          this.innerContent.innerHTML = "";
          this.modalHeader.innerHTML = "";
          this.innerContent.classList.remove("rte");
          this.modalHeader.innerHTML = header;
          this.innerContent.appendChild(content);
          if (hasPageContent) {
            this.innerContent.classList.add("rte");
            global_events_default(this.innerContent);
          }
          this.classList.add("active");
          disableBodyScroll(this, {
            allowTouchMove: (el) => {
              while (el && el !== document.body) {
                if (el.getAttribute("data-scroll-lock-ignore") !== null) {
                  return true;
                }
                el = el.parentElement;
              }
            }
          });
          this.focusTrap.activate();
          e2.detail.callback && e2.detail.callback();
        }
        closeModal() {
          this.classList.remove("active");
          enableBodyScroll(this);
          this.focusTrap.deactivate();
        }
      }
    );
  }
};

// js/common/components/component-modal-full-content.js
var component_modal_full_content_default = () => {
  if (!customElements.get("component-modal-full-content")) {
    customElements.define(
      "component-modal-full-content",
      class ModalFullContent extends HTMLElement {
        constructor() {
          super();
          this.innerContent = this.querySelector(".modal-full-content__content");
          this.focusTrap = createFocusTrap(this, { allowOutsideClick: true });
          this.colorSchemeKey = "color-scheme-";
          document.addEventListener("theme-modal-full-content:open", (e2) => this.openModal(e2), false);
          document.addEventListener("theme-modal-full-content:close", () => this.closeModal(), false);
          this.addEventListener("keydown", ({ key }) => {
            if (key === "Escape")
              this.closeModal();
          });
        }
        openModal(e2) {
          const content = e2.detail.template.tagName.toLowerCase() === "template" ? e2.detail.template.content.cloneNode(true) : e2.detail.template;
          this.innerContent.innerHTML = "";
          this.classList.remove(this.getColorSchemeClass(this));
          this.classList.add(this.getColorSchemeClass(content.querySelector(`[class*="${this.colorSchemeKey}"]`)));
          this.innerContent.appendChild(content);
          this.classList.add("active");
          disableBodyScroll(this, {
            allowTouchMove: (el) => {
              while (el && el !== document.body) {
                if (el.getAttribute("data-scroll-lock-ignore") !== null) {
                  return true;
                }
                el = el.parentElement;
              }
            }
          });
          this.focusTrap.activate();
          e2.detail.callback && e2.detail.callback();
        }
        closeModal() {
          this.classList.remove("active");
          enableBodyScroll(this);
          this.focusTrap.deactivate();
        }
        getColorSchemeClass(el) {
          for (let index = 0; index < el.classList.length; index++) {
            if (el.classList[index].includes(this.colorSchemeKey)) {
              return el.classList[index];
            }
          }
        }
      }
    );
  }
};

// js/common/components/component-nav-menu.js
var component_nav_menu_default = () => {
  if (!customElements.get("component-nav-menu")) {
    customElements.define(
      "component-nav-menu",
      class NavMenu extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            parentContainer: ".nav-menu__dropdown-container",
            submenuTriggers: "button[aria-controls]",
            submenu: ".nav-menu__submenu",
            submenuTier2: ".nav-menu__submenu--tier-2"
          };
          this.submenuParentButtons = this.querySelectorAll(this.selectors.submenuTriggers);
          this.submenu = this.querySelector(`${this.selectors.submenu}:not(${this.selectors.submenuTier2})`);
          this.initListeners();
          this.handleOffScreen();
          elementResize_default(this, () => {
            this.handleOffScreen();
          });
        }
        initListeners() {
          this.submenuParentButtons.forEach((button) => {
            button.addEventListener("click", (e2) => this.toggleSubMenu(e2));
          });
          this.submenu.addEventListener("focusout", (e2) => {
            if (e2.target.closest(this.selectors.submenuTier2) && !e2.relatedTarget.closest(this.selectors.submenuTier2)) {
              this.closeMenu(e2.target.closest(this.selectors.submenuTier2));
            }
            if (e2.relatedTarget) {
              if (!this.contains(e2.relatedTarget) || e2.relatedTarget.classList.contains("nav-menu__submenu-trigger--tier-1"))
                this.closeAllMenus();
            }
          });
          document.addEventListener("theme-doc-clicked", ({ detail }) => {
            if (!this.contains(detail.target)) {
              this.closeAllMenus();
            }
          });
          this.addEventListener("keydown", ({ key }) => {
            if (key === "Escape")
              this.closeAllMenus();
          });
        }
        toggleSubMenu(e2) {
          const currentState = e2.target.getAttribute("aria-expanded");
          if (e2.target.classList.contains("nav-menu__submenu-trigger--tier-2")) {
            this.closeSubmenus(e2.target.closest(".nav-menu__submenu"));
          }
          e2.target.setAttribute("aria-expanded", currentState !== "true");
        }
        closeSubmenus(parent) {
          const submenus = parent.querySelectorAll(".nav-menu__submenu-trigger");
          submenus.forEach((menu) => {
            menu.setAttribute("aria-expanded", false);
          });
        }
        closeAllMenus() {
          this.submenuParentButtons.forEach((button) => {
            button.setAttribute("aria-expanded", false);
          });
        }
        closeMenu(node) {
          node.previousElementSibling.setAttribute("aria-expanded", false);
        }
        handleOffScreen() {
          this.setMenuPosition(this.submenu);
          this.submenu.querySelectorAll(this.selectors.submenuTier2).forEach((menu) => this.setMenuPosition(menu));
        }
        setMenuPosition(menu) {
          const viewportWidth = window.innerWidth;
          const submenuRightPosition = menu.getBoundingClientRect().right;
          const submenuWidth = menu.offsetWidth;
          const availableSpace = viewportWidth - submenuRightPosition;
          availableSpace < submenuWidth ? menu.dataset.position = "left" : menu.dataset.position = "right";
        }
      }
    );
  }
};

// js/common/components/component-filters-and-sort-form.js
var component_filters_and_sort_form_default = () => {
  if (!customElements.get("component-filters-and-sort-form")) {
    customElements.define(
      "component-filters-and-sort-form",
      class FiltersAndSortForm extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            activeFilters: "#activeFilters",
            resultContainer: "#resultsContainer",
            productCount: "#productCount",
            resetButton: "[data-filter-reset-button]",
            closeButton: "[data-close-filters]",
            productLoader: "[data-loader-container]",
            inputWrappers: ".filters__list"
          };
          const { hasActiveFilters, formType } = this.dataset;
          this.hasActiveFilters = hasActiveFilters === "true";
          this.formType = formType;
          this.filterData = [];
          this.currentlySelectedFilterGroup = null;
          this.parentSection = this.closest(".shopify-section").firstElementChild;
          this.filterForm = this.querySelector("form");
          this.resetButton = document.querySelector(this.selectors.resetButton);
          this.closebutton = document.querySelector(this.selectors.closeButton);
          this.debouncedOnSubmit = debounce((event) => {
            this.onSubmitHandler(event);
          }, 150);
          this.initListeners();
        }
        initListeners() {
          this.filterForm.addEventListener("input", this.handleEvent.bind(this));
          if (this.resetButton && this.formType === "filters") {
            this.resetButton.addEventListener("click", () => this.handleReset());
          }
        }
        handleEvent = (e2) => {
          this.parentSection.querySelector(this.selectors.productLoader)?.classList.add("active");
          this.currentlySelectedFilterGroup = e2.target.name;
          this.debouncedOnSubmit(e2);
        };
        handleReset = () => {
          this.currentlySelectedFilterGroup = null;
          this.filterForm.querySelectorAll("input:checked").forEach((input) => input.checked = false);
          this.querySelector("component-price-range")?.reset();
          this.onSubmitHandler();
          this.closebutton.focus();
        };
        onSubmitHandler(event = null) {
          event?.preventDefault();
          this.setActiveFilters();
          const searchParams = [...document.querySelectorAll("component-filters-and-sort-form form")].map(
            (form) => this.createSearchParams(form)
          );
          this.onSubmitForm(searchParams.join("&"));
        }
        setActiveFilters() {
          const hasActiveCheckInputs = this.querySelectorAll("input:checked").length > 0;
          const hasActiveRangeInputs = this.querySelectorAll('input[type="text"]:placeholder-shown').length < 2;
          this.setAttribute("data-has-active-filters", hasActiveCheckInputs || hasActiveRangeInputs);
        }
        onSubmitForm(searchParams) {
          this.renderPage(searchParams);
        }
        createSearchParams(form) {
          const formData = new FormData(form);
          return new URLSearchParams(formData).toString();
        }
        renderPage(searchParams, updateURLHash = true) {
          this.searchParamsPrev = searchParams;
          const sectionId = this.parentSection.dataset.id;
          const url = `${window.location.pathname}?section_id=${sectionId}&${searchParams}`;
          const filterDataUrl = (element) => element.url === url;
          this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl) : this.renderSectionFromFetch(url);
          if (updateURLHash)
            this.updateURLHash(searchParams);
        }
        updateURLHash(searchParams) {
          history.pushState(
            { searchParams },
            "",
            `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
          );
        }
        renderSectionFromFetch(url) {
          fetch(url).then((response) => response.text()).then((responseText) => {
            const html = responseText;
            this.filterData = [...this.filterData, { html, url }];
            this.renderActiveFilters(html);
            this.renderFilterResults(html);
            this.renderProductCount(html);
            this.updateForm(html);
          });
        }
        renderSectionFromCache(filterDataUrl) {
          const html = this.filterData.find(filterDataUrl).html;
          this.renderActiveFilters(html);
          this.renderFilterResults(html);
          this.renderProductCount(html);
          this.updateForm(html);
        }
        renderActiveFilters(html) {
          const parsedHTML = new DOMParser().parseFromString(html, "text/html");
          replaceHTMLElement(this.selectors.activeFilters, parsedHTML, this.parentSection);
        }
        renderFilterResults(html) {
          const parsedHTML = new DOMParser().parseFromString(html, "text/html");
          replaceHTMLElement(this.selectors.resultContainer, parsedHTML, this.parentSection);
        }
        renderProductCount(html) {
          const parsedHTML = new DOMParser().parseFromString(html, "text/html");
          replaceHTMLElement(this.selectors.productCount, parsedHTML, this.parentSection);
        }
        updateForm(html) {
          const parsedHTML = new DOMParser().parseFromString(html, "text/html");
          replaceHTMLElements("[data-active-filters]", parsedHTML, this.parentSection);
          const oldList = this.querySelectorAll(this.selectors.inputWrappers);
          const newList = parsedHTML.querySelectorAll(this.selectors.inputWrappers);
          for (let index = 0; index < oldList.length; index++) {
            if (oldList[index].dataset.filterGroup !== this.currentlySelectedFilterGroup) {
              oldList[index].parentElement.replaceChild(newList[index], oldList[index]);
            }
          }
        }
        static observedAttributes = ["data-has-active-filters"];
        attributeChangedCallback(name, oldValue, newValue) {
          if (name === "data-has-active-filters") {
            if (this.resetButton && oldValue !== newValue) {
              this.resetButton.disabled = newValue !== "true";
            }
          }
        }
      }
    );
  }
};

// js/common/lib/dropdownEvents.js
var dropdownEvents_default = ({ container, trigger, content, onOpen = null, onClose = null, overlay, disableScroll = false }) => {
  const focusTrap = createFocusTrap(content, { allowOutsideClick: true });
  content.addEventListener("keydown", ({ key }) => {
    if (key === "Escape")
      close();
  });
  trigger.addEventListener("click", () => {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  });
  document.addEventListener("theme-doc-clicked", ({ detail }) => {
    if (!isOpen() || detail.target === trigger)
      return;
    if (!content.contains(detail.target))
      close();
  });
  function open() {
    container?.classList.add("active");
    overlay?.classList.add("active");
    trigger.setAttribute("aria-expanded", "true");
    focusTrap.activate();
    if (disableScroll) {
      disableBodyScroll(content, {
        allowTouchMove: (el) => {
          while (el && el !== document.body) {
            if (el.getAttribute("data-scroll-lock-ignore") !== null) {
              return true;
            }
            el = el.parentElement;
          }
        }
      });
    }
    if (onOpen) {
      onOpen();
    }
  }
  function close() {
    container?.classList.remove("active");
    overlay?.classList.remove("active");
    trigger.setAttribute("aria-expanded", "false");
    focusTrap.deactivate();
    if (disableScroll) {
      enableBodyScroll(content);
    }
    if (onClose) {
      onClose();
    }
  }
  function isOpen() {
    return trigger.getAttribute("aria-expanded") === "true";
  }
  return {
    open,
    close,
    isOpen
  };
};

// js/common/components/component-mega-menu.js
var component_mega_menu_default = () => {
  if (!customElements.get("component-mega-menu")) {
    customElements.define(
      "component-mega-menu",
      class MegaMenu extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            megaMenuTrigger: "[data-open-mega-menu]",
            innerContainer: ".mega-menu__mega-container",
            subMenuTier2Container: ".mega-menu__submenu-tier-2",
            overlay: ".header__overlay",
            closeButton: "[data-close-mega-menu]"
          };
          this.megaMenuTrigger = this.querySelector(this.selectors.megaMenuTrigger);
          this.innerContainer = this.querySelector(this.selectors.innerContainer);
          this.subMenuTier2Container = this.querySelector(this.selectors.subMenuTier2Container);
          this.overlay = this.querySelector(this.selectors.overlay);
          this.closeButton = this.querySelector(this.selectors.closeButton);
          this.initEvents();
        }
        initEvents() {
          this.dropdownEvents = dropdownEvents_default({
            trigger: this.megaMenuTrigger,
            content: this.innerContainer,
            overlay: this.overlay,
            disableScroll: true
          });
          this.closeButton.addEventListener("click", () => this.dropdownEvents.close());
        }
        open() {
          this.dropdownEvents.open();
        }
        close() {
          this.dropdownEvents.close();
        }
      }
    );
  }
};

// js/common/components/component-product-grid.js
import { Ajaxinate } from "vendor";
var component_product_grid_default = () => {
  if (!customElements.get("component-product-grid")) {
    customElements.define(
      "component-product-grid",
      class ProductGrid extends HTMLElement {
        constructor() {
          super();
          this.paginationStyle = this.dataset.paginationStyle;
          if (this.paginationStyle !== "paginated") {
            this.initAjaxinate();
          }
        }
        disconnectedCallback() {
          this.ajaxinate?.destroy();
        }
        initAjaxinate() {
          const { loadingMoreText } = this.dataset;
          this.ajaxinate = new Ajaxinate({
            container: ".ajaxinate",
            pagination: ".product-grid__show-more",
            loadingText: loadingMoreText ? loadingMoreText : "Loading",
            method: this.paginationStyle
          });
        }
      }
    );
  }
};

// js/common/components/component-panel.js
var component_panel_default = () => {
  if (!customElements.get("component-panel")) {
    customElements.define(
      "component-panel",
      class Panel extends HTMLElement {
        constructor() {
          super();
          const { subId, openOnEditorSelect } = this.dataset;
          this.subId = subId;
          this.openOnEditorSelect = openOnEditorSelect;
          this.panelFooter = this.querySelector(".panel__footer");
          if (this.panelFooter) {
            this.setFooterHeightVar();
            elementResize_default(this, () => {
              this.setFooterHeightVar();
            });
          }
          this.focusTrap = createFocusTrap(this, { allowOutsideClick: true });
          this.initListerners();
        }
        setFooterHeightVar() {
          this.setStyleVariable("--panel-footer-height", `${this.panelFooter.offsetHeight}px`);
        }
        setStyleVariable(varName, value) {
          this.style.setProperty(varName, value);
        }
        initListerners() {
          document.addEventListener(`theme-${this.subId}:open`, () => this.open(), false);
          document.addEventListener(`theme-${this.subId}:close`, () => this.close(), false);
          this.addEventListener("keydown", ({ key }) => {
            if (key === "Escape")
              this.close();
          });
          if (this.openOnEditorSelect && window.Shopify.designMode) {
            this.closest(".shopify-section").addEventListener("shopify:section:select", () => this.open());
          }
        }
        open() {
          if (this.panelFooter) {
            this.setFooterHeightVar();
          }
          if (this.classList.contains("active"))
            return;
          this.classList.add("active");
          this.focusTrap.activate();
          disableBodyScroll(this, {
            allowTouchMove: (el) => {
              while (el && el !== document.body) {
                if (el.getAttribute("data-scroll-lock-ignore") !== null) {
                  return true;
                }
                el = el.parentElement;
              }
            }
          });
        }
        close() {
          this.classList.remove("active");
          this.focusTrap.deactivate();
          enableBodyScroll(this);
        }
      }
    );
  }
};

// js/common/components/component-custom-select.js
var component_custom_select_default = () => {
  if (!customElements.get("component-custom-select")) {
    customElements.define(
      "component-custom-select",
      class CustomSelect extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            button: ".custom-select__button",
            selectedValue: "[data-selected-value]",
            optionsList: ".custom-select__dropdown"
          };
          this.radios = Array.from(this.querySelectorAll('input[type="radio"]'));
          this.hasRadios = this.radios.length;
          this.options = Array.from(this.querySelectorAll("li"));
          this.focusedIndex = this.radios.findIndex((r) => r.checked) || 0;
          this.selectBtn = this.querySelector(this.selectors.button);
          this.selectedValue = this.querySelector(this.selectors.selectedValue);
          this.optionsList = this.querySelector(this.selectors.optionsList);
          this.isOpen = false;
          if (this.dataset.dynamicWidth === "true") {
            if (window.Shopify.designMode) {
              this.setDynamicWidth();
            } else {
              window.addEventListener("load", () => {
                this.setDynamicWidth();
              });
            }
          }
          this.initListeners();
        }
        initListeners() {
          document.addEventListener("theme-doc-clicked", ({ detail }) => {
            if (!this.isOpen || detail.target === this.selectBtn)
              return;
            if (!this.optionsList.contains(detail.target))
              this.closeList();
          });
          this.selectBtn.addEventListener("click", () => {
            if (this.isOpen) {
              this.closeList();
            } else {
              this.openList();
            }
          });
          if (this.hasRadios) {
            this.radios.forEach((radio, index) => {
              radio.addEventListener("click", () => {
                this.focusedIndex = index;
                this.updateSelection(index);
                this.closeList();
              });
              radio.addEventListener("keydown", (e2) => {
                if (["ArrowDown", "ArrowUp"].includes(e2.key)) {
                  e2.preventDefault();
                  this.focusedIndex = e2.key === "ArrowDown" ? (this.focusedIndex + 1) % this.radios.length : (this.focusedIndex - 1 + this.radios.length) % this.radios.length;
                  this.setFocusedIndex(this.focusedIndex);
                  this.radios[this.focusedIndex].focus();
                }
                if (["Enter", " "].includes(e2.key)) {
                  e2.preventDefault();
                  this.updateSelection(this.focusedIndex);
                  this.radios[this.focusedIndex].checked = true;
                  this.radios[this.focusedIndex].dispatchEvent(new Event("input", { bubbles: true }));
                  this.radios[this.focusedIndex].dispatchEvent(new Event("change", { bubbles: true }));
                  this.closeList();
                }
                if (e2.key === "Escape") {
                  this.closeList();
                }
              });
            });
          }
        }
        openList() {
          this.isOpen = true;
          this.selectBtn.setAttribute("aria-expanded", "true");
          this.optionsList.setAttribute("aria-hidden", "false");
          if (this.hasRadios) {
            this.radios[this.focusedIndex].focus();
            this.setFocusedIndex(this.focusedIndex);
          }
        }
        closeList() {
          this.isOpen = false;
          this.selectBtn.setAttribute("aria-expanded", "false");
          this.optionsList.setAttribute("aria-hidden", "true");
          this.selectBtn.focus();
        }
        setFocusedIndex(index) {
          this.options.forEach((opt, i) => {
            opt.classList.toggle("focused", i === index);
          });
        }
        updateSelection(index) {
          this.selectBtn.textContent = this.options[index].textContent;
        }
        setDynamicWidth() {
          const largestOptionWidth = Math.max(...[...this.options].map((op) => op.scrollWidth));
          this.style.width = `${largestOptionWidth + 10}px`;
        }
        close() {
          this.closeList();
        }
      }
    );
  }
};

// js/common/components/component-accordion.js
var component_accordion_default = () => {
  if (!customElements.get("component-accordion")) {
    customElements.define(
      "component-accordion",
      class Accordion extends HTMLElement {
        constructor() {
          super();
          const { exclusive } = this.dataset;
          this.exclusive = exclusive ? exclusive === "true" : false;
          this.tabs = [];
          this.buttons = this.querySelectorAll("[data-accordion-trigger]");
          this.buttons.forEach((button) => {
            const controlsId = button.getAttribute("aria-controls");
            const content = document.getElementById(controlsId);
            content.style.setProperty("--content-height", `${content.scrollHeight}px`);
            const tab = {
              button,
              content,
              open: button.getAttribute("aria-expanded") === "true",
              event: button.addEventListener("click", this.onButtonClick.bind(this))
            };
            this.tabs.push(tab);
          });
          elementResize_default(this, () => {
            this.tabs.forEach(
              ({ content }) => content.style.setProperty("--content-height", `${content.scrollHeight}px`)
            );
          });
          if (this.querySelector("component-recommended-products")) {
            document.addEventListener("theme-recommended-products:loaded", () => {
              this.tabs.forEach(
                ({ content }) => content.style.setProperty("--content-height", `${content.scrollHeight}px`)
              );
            });
          }
        }
        onButtonClick(e2) {
          const currentTab = this.tabs.find((x) => x.button === e2.currentTarget);
          this.toggle(currentTab);
          if (this.exclusive) {
            this.closeAllOthers(currentTab);
          }
        }
        toggle(item) {
          item.open = !item.open;
          this.updateAttributes(item, item.open);
        }
        updateAttributes(item, open) {
          item.button.setAttribute("aria-expanded", `${open}`);
        }
        closeAllOthers(currentTab) {
          this.tabs.forEach((item) => {
            if (currentTab === item)
              return;
            item.open = false;
            this.updateAttributes(item, item.open);
          });
        }
        openSelected(item) {
          const tab = this.tabs.find((x) => x.button === item);
          this.updateAttributes(tab, true);
          if (this.exclusive) {
            this.closeAllOthers(tab);
          }
        }
      }
    );
  }
};

// js/common/components/component-price-range.js
import { noUiSlider } from "vendor";
var component_price_range_default = () => {
  if (!customElements.get("component-price-range")) {
    customElements.define(
      "component-price-range",
      class PriceRange extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            rangeSlider: ".range-slider",
            minInput: "[data-min-field]",
            maxInput: "[data-max-field]"
          };
          const { minRange, maxRange, minValue, maxValue, rangeLowerString, rangeUpperString } = this.dataset;
          this.minRange = parseInt(minRange, 10);
          this.maxRange = parseInt(maxRange, 10);
          this.minValue = parseInt(minValue, 10);
          this.maxValue = parseInt(maxValue, 10) ? parseInt(maxValue, 10) : this.maxRange;
          this.minInput = this.querySelector(this.selectors.minInput);
          this.maxInput = this.querySelector(this.selectors.maxInput);
          this.rangeLowerString = rangeLowerString;
          this.rangeUpperString = rangeUpperString;
          this.noUiSlider = noUiSlider.create(this.querySelector(this.selectors.rangeSlider), {
            start: [this.minValue, this.maxValue],
            handleAttributes: [{ "aria-label": this.rangeLowerString }, { "aria-label": this.rangeUpperString }],
            connect: true,
            range: {
              min: this.minRange,
              max: this.maxRange
            }
          });
          this.initListeners();
        }
        initListeners() {
          this.minInput.addEventListener("change", (event) => {
            this.noUiSlider.set([parseInt(event.target.value, 10), null]);
          });
          this.maxInput.addEventListener("change", (event) => {
            this.noUiSlider.set([null, parseInt(event.target.value, 10)]);
          });
          this.noUiSlider.on("change", (values, handle) => {
            const value = values[handle];
            if (handle) {
              this.debouncedInputUpdate(this.maxInput, value);
            } else {
              this.debouncedInputUpdate(this.minInput, value);
            }
          });
        }
        reset(shouldBubble = false) {
          this.noUiSlider.set([this.minRange, this.maxRange]);
          this.minInput.value = null;
          this.maxInput.value = null;
          if (shouldBubble) {
            this.minInput.dispatchEvent(
              new Event("input", {
                bubbles: true
              })
            );
          }
        }
        debouncedInputUpdate = debounce((target, value) => {
          target.value = value;
          target.dispatchEvent(
            new Event("input", {
              bubbles: true
            })
          );
        }, 150);
      }
    );
  }
};

// js/common/components/component-product-media-gallery.js
import { PhotoSwipeLightbox, PhotoSwipe } from "vendor";
var component_product_media_gallery_default = () => {
  if (!customElements.get("component-product-media-gallery")) {
    customElements.define(
      "component-product-media-gallery",
      class ProductMediaGallery extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            media: "[data-media-id]",
            mediaTarget: (id) => `[data-media-id="${id}"]`,
            thumbTarget: (id) => `[data-thumb-id="${id}"]`,
            thumbButtons: "[data-thumb-id]",
            slider: "component-slider"
          };
          this.media = this.querySelectorAll(this.selectors.media);
          this.thumbButtons = this.querySelectorAll(this.selectors.thumbButtons);
          this.slider = this.querySelector(this.selectors.slider);
          this.videosAutoplay = this.dataset.autoplayVideos === "true";
          if (this.thumbButtons.length) {
            this.thumbButtons.forEach((button) => {
              button.addEventListener("click", (e2) => {
                this.updateActiveThumb(e2.currentTarget.dataset.thumbId);
                this.updateActiveMedia(e2.currentTarget.dataset.thumbId);
              });
            });
          }
          this.initLightboxes();
        }
        initLightboxes() {
          const lightboxConfig = {
            arrowPrevSVG: window.icons.chevronLeft,
            arrowNextSVG: window.icons.chevronRight,
            closeSVG: window.icons.close,
            zoomSVG: window.icons.zoom,
            mainClass: "pswp--custom-styling",
            pswpModule: PhotoSwipe,
            closeOnVerticalDrag: true
          };
          this.imageLightbox = new PhotoSwipeLightbox({
            ...lightboxConfig,
            gallery: "[data-lightbox]",
            children: "a"
          });
          this.imageLightbox.addFilter("itemData", this.addMediaId);
          this.imageLightbox.on("contentLoad", (e2) => {
            const { content } = e2;
            if (content.type !== "image") {
              e2.preventDefault();
              content.element = document.createElement("div");
              content.element.className = "pswp__media-container";
              const template = this.querySelector(`[data-template-id="${content.data.mediaId}"]`);
              const templateClone = template.content.cloneNode(true);
              content.element.appendChild(templateClone);
              if (content.type === "video") {
                const videoElement = content.element.querySelector("video");
                videoElement.muted = false;
                videoElement.load();
                videoElement.onloadeddata = function() {
                  videoElement.currentTime = 0;
                };
              }
            }
          });
          this.imageLightbox.on("afterInit", () => {
            if (this.imageLightbox.pswp.currSlide.data.type === "video") {
              const videoElement = this.imageLightbox.pswp.currSlide.content.element.querySelector("video");
              videoElement.onloadeddata = function() {
                videoElement.play();
              };
            } else if (this.imageLightbox.pswp.currSlide.data.type === "external_video") {
              const iframe = this.imageLightbox.pswp.currSlide.content.element.querySelector(".js-youtube") || this.imageLightbox.pswp.currSlide.content.element.querySelector(".js-vimeo");
              iframe.addEventListener("load", () => {
                if (iframe.classList.contains("js-youtube")) {
                  iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
                } else {
                  iframe.contentWindow.postMessage('{"method":"play"}', "*");
                }
              });
            }
          });
          this.imageLightbox.on("pointerDown", (e2) => {
            if (this.imageLightbox.pswp.currSlide.data.type === "model") {
              e2.preventDefault();
            }
          });
          this.imageLightbox.on("change", () => {
            if (this.imageLightbox.pswp.currSlide.data.type === "model") {
              this.imageLightbox.options.closeOnVerticalDrag = false;
            } else {
              this.imageLightbox.options.closeOnVerticalDrag = true;
            }
            document.dispatchEvent(new CustomEvent("theme-videos:pause"));
          });
          this.imageLightbox.init();
        }
        addMediaId(data) {
          data.mediaId = data.element.dataset.mediaId;
          return data;
        }
        updateActiveMedia(id) {
          document.dispatchEvent(new CustomEvent("theme-videos:pause"));
          this.hideAllMedia();
          const mediaId = this.selectors.mediaTarget(id);
          const mediaTarget = this.querySelector(mediaId);
          mediaTarget?.classList.remove("hidden");
          if (this.videosAutoplay && mediaTarget) {
            const video = mediaTarget.querySelector("video");
            video?.play();
          }
        }
        hideAllMedia() {
          this.media.forEach((item) => item.classList.add("hidden"));
        }
        updateActiveThumb(id) {
          const thumbId = this.selectors.thumbTarget(id);
          this.thumbButtons.forEach((button) => button.classList.remove("active"));
          this.querySelector(thumbId)?.classList.add("active");
        }
        updateProductImage(id) {
          const mediaId = this.selectors.mediaTarget(id);
          const mediaTarget = this.querySelector(mediaId);
          const mediaTargetParent = mediaTarget.parentNode;
          const firstMedia = this.querySelector(this.selectors.media);
          mediaTargetParent.insertBefore(mediaTarget, firstMedia);
        }
        // scrollIntoView(id) {
        //   const activeMedia = this.querySelector(this.selectors.mediaTarget(id));
        //   const activeMediaRect = activeMedia.getBoundingClientRect();
        //   const headerOffset = getComputedStyle(document.documentElement).getPropertyValue('--header-offset') || 0;
        //   const paddingOffset = 10;
        //   let top = activeMediaRect.top + window.scrollY - parseInt(headerOffset, 0) - paddingOffset;
        //   if (top > window.scrollY && document.documentElement.classList.contains('header-is-sticky-on-scroll')) {
        //     top = top + parseInt(headerOffset, 0);
        //   }
        //   window.scrollTo({ top: top, behavior: 'smooth' });
        // }
        slideToActiveMedia(id) {
          document.dispatchEvent(new CustomEvent("theme-videos:pause"));
          const activeMedia = this.querySelector(this.selectors.mediaTarget(id));
          const activeMediaIndex = Array.prototype.indexOf.call(this.media, activeMedia);
          this.slider.goToSlide(activeMediaIndex);
        }
      }
    );
  }
};

// js/common/components/component-product-form.js
var component_product_form_default = () => {
  if (!customElements.get("component-product-form")) {
    customElements.define(
      "component-product-form",
      class ProductForm extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            submit: ".product-form__submit",
            errorContainer: ".product-form__error-message",
            errorMessage: ".product-form__error-message-text"
          };
          this.form = this.querySelector("form");
          this.submitButton = this.querySelector(this.selectors.submit);
          this.errorContainer = this.querySelector(this.selectors.errorContainer);
          this.errorMessage = this.querySelector(this.selectors.errorMessage);
          this.quickCart = document.querySelector("section-quick-cart");
          if (this.form) {
            this.form.addEventListener("submit", (e2) => this.handleFormSubmit(e2));
          }
        }
        handleFormSubmit(event) {
          event.preventDefault();
          if (this.submitButton.classList.contains("active"))
            return;
          this.submitButton.classList.add("active");
          if (this.errorContainer.classList.contains("active"))
            this.errorContainer.classList.remove("active");
          const config = {
            method: "POST",
            headers: { Accept: `application/javascript`, "X-Requested-With": "XMLHttpRequest" },
            body: new FormData(this.form)
          };
          fetch(`${routes.cart_add_url}`, config).then((response) => response.json()).then((response) => {
            if (response.status) {
              const giftCardError = this.querySelector(".gc-recipient-form__fields.visible");
              if (giftCardError) {
                this.querySelector("component-gc-recipient-form").showError(response.errors);
                return;
              }
              this.errorContainer.classList.add("active");
              this.errorMessage.innerText = response.description;
              document.dispatchEvent(new CustomEvent("theme-cart:updated", { detail: { shouldOpenCart: false } }));
              return;
            } else if (!this.quickCart) {
              const wrappingProduct = this.closest("section-product");
              if (wrappingProduct.classList.contains("product-quick-add")) {
                document.dispatchEvent(new CustomEvent("theme-cart:updated", { detail: { shouldOpenCart: false } }));
                document.dispatchEvent(new CustomEvent("theme-modal:close"));
              } else {
                window.location = window.routes.cart_url;
              }
              return;
            }
            document.dispatchEvent(new CustomEvent("theme-cart:updated", { detail: { shouldOpenCart: true } }));
            document.dispatchEvent(new CustomEvent("theme-modal:close"));
          }).catch((e2) => {
            console.error(e2);
          }).finally(() => {
            this.submitButton.classList.remove("active");
          });
        }
      }
    );
  }
};

// js/common/components/component-product-variant-selectors.js
var component_product_variant_selectors_default = () => {
  if (!customElements.get("component-product-variant-selectors")) {
    customElements.define(
      "component-product-variant-selectors",
      class ProductVariantSelectors extends HTMLElement {
        constructor() {
          super();
          this.productSection = this.closest("section-product");
          this.addEventListener("input", () => this.handleVariantSelector("product-form"));
          document.addEventListener("theme-quick-buy-select:change", () => this.handleVariantSelector("quick-buy"));
        }
        handleVariantSelector(inputSource) {
          this.productSection.setAttribute("data-selection-input-source", inputSource);
          const selectedOptions = this.selectedOptions();
          document.dispatchEvent(
            new CustomEvent("theme-variantOption:changed", {
              detail: {
                selectedOptions,
                sectionId: this.productSection.dataset.section
              }
            })
          );
        }
        selectedOptions() {
          return [...this.querySelectorAll("input:checked")].map(({ dataset }) => dataset.optionId);
        }
      }
    );
  }
};

// js/common/components/component-quantity-button.js
var component_quantity_button_default = () => {
  if (!customElements.get("component-quantity-button")) {
    customElements.define(
      "component-quantity-button",
      class QuantityButton extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            button: ".quantity-button",
            container: "[data-quantity-button-container]",
            errorMessage: "[data-error-message]"
          };
          this.container = this.closest(this.selectors.container);
          this.errorMessage = this.container.querySelector(this.selectors.errorMessage);
          this.button = this.querySelector(this.selectors.button);
          this.button.addEventListener("click", () => this.handleClick());
        }
        handleClick() {
          if (this.container.classList.contains("updating") || this.button.classList.contains("active"))
            return;
          this.button.classList.add("active");
          this.container.classList.add("updating");
          this.currentQuantity = parseInt(this.dataset.currentQuantity, 10) || 0;
          this[`${this.dataset.type}Product`](this.currentQuantity);
        }
        addProduct(currentQuantity) {
          this.updateProductQuantity(currentQuantity + 1);
        }
        subtractProduct(currentQuantity) {
          this.updateProductQuantity(currentQuantity - 1);
        }
        removeProduct() {
          this.updateProductQuantity(0);
        }
        updateProductQuantity(quantity) {
          const config = {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: `application/json` },
            body: JSON.stringify({
              line: this.dataset.index,
              quantity
            })
          };
          fetch(routes.cart_change_url, config).then((response) => response.json()).then((response) => {
            if (response.errors) {
              this.errorMessage.textContent = response.errors;
              return;
            }
            document.dispatchEvent(
              new CustomEvent("theme-cart:updated", {
                detail: {
                  shouldOpenCart: false
                }
              })
            );
          }).catch(() => {
          }).finally(() => {
            this.button.classList.remove("active");
            this.container.classList.remove("updating");
          });
        }
      }
    );
  }
};

// js/common/components/component-quick-search.js
var component_quick_search_default = () => {
  if (!customElements.get("component-quick-search")) {
    customElements.define(
      "component-quick-search",
      class QuickSearch extends HTMLElement {
        constructor() {
          super();
          this.searchData = [];
          this.selectors = {
            trigger: "[data-open-quick-search]",
            innerContainer: ".quick-search__container",
            searchInput: "[data-quick-search-input]",
            resetButton: "[data-quick-search-reset]",
            results: ".quick-search__results",
            overlay: ".header__overlay"
          };
          this.trigger = this.querySelector(this.selectors.trigger);
          this.innerContainer = this.querySelector(this.selectors.innerContainer);
          this.searchInput = this.querySelector(this.selectors.searchInput);
          this.resetButton = this.querySelector(this.selectors.resetButton);
          this.resultsContainer = this.querySelector(this.selectors.results);
          this.overlay = this.querySelector(this.selectors.overlay);
          this.initListeners();
        }
        initListeners() {
          this.dropdownEvents = dropdownEvents_default({
            trigger: this.trigger,
            content: this.innerContainer,
            overlay: this.overlay,
            disableScroll: true
          });
          this.resetButton.addEventListener("click", () => {
            this.reset();
          });
          this.searchInput.addEventListener("input", (e2) => {
            if (e2.target.value) {
              this.innerContainer.classList.add("results-active");
              this.searchData.some((data) => data.searchTerm === e2.target.value) ? this.getResultsFromCache(e2.target.value) : this.getResultsFromFetch(e2.target.value);
            } else {
              this.resetButton.click();
            }
          });
        }
        getResultsFromFetch(searchTerm) {
          const params = new URLSearchParams();
          params.set("section_id", "fetch-quick-search-results");
          params.set("q", searchTerm);
          params.set("resources[limit_scope]", "each");
          params.set("resources[limit]", this.dataset.resultsLimit);
          const url = `${routes.predictive_search_url}?${params.toString()}`;
          fetch(url).then((response) => response.text()).then((html) => {
            this.searchData = [...this.searchData, { html, searchTerm }];
            this.showResults(html);
          }).catch((error) => {
            throw error;
          });
        }
        getResultsFromCache(searchTerm) {
          const html = this.searchData.find((data) => data.searchTerm === searchTerm).html;
          this.showResults(html);
        }
        showResults(html) {
          const parsedHTML = new DOMParser().parseFromString(html, "text/html");
          const oldResults = this.querySelector(this.selectors.results);
          const newResults = parsedHTML.querySelector(this.selectors.results);
          morph(oldResults, newResults);
        }
        reset() {
          this.innerContainer.classList.remove("results-active");
          this.resultsContainer.innerHTML = "";
          this.searchInput.focus();
        }
      }
    );
  }
};

// js/common/components/component-drawer-menu.js
var component_drawer_menu_default = () => {
  if (!customElements.get("component-drawer-menu")) {
    customElements.define(
      "component-drawer-menu",
      class DrawerMenu extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            drawerFooter: ".drawer-menu__footer"
          };
          this.initDrawerFooter();
        }
        initDrawerFooter() {
          this.drawerFooter = this.querySelector(this.selectors.drawerFooter);
          if (!this.drawerFooter)
            return;
          this.setFooterOffset();
          elementResize_default(this, () => {
            this.setFooterOffset();
          });
        }
        setFooterOffset() {
          this.style.setProperty("--drawer-menu-footer-offset", `${this.drawerFooter.offsetHeight}px`);
        }
      }
    );
  }
};

// js/common/components/component-product-quick-buy-widget.js
var component_product_quick_buy_widget_default = () => {
  if (!customElements.get("component-product-quick-buy-widget")) {
    customElements.define(
      "component-product-quick-buy-widget",
      class ProductQuickBuyWidget extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            container: ".product-quick-buy-widget",
            button: ".product-quick-buy-widget__trigger",
            optionsList: ".product-quick-buy-widget__dropdown",
            media: "[data-media-id]",
            mediaTarget: (id) => `[data-media-id="${id}"]`
          };
          this.addEventListener("input", (e2) => this.handleVariantSelector(e2));
          this.selectBtn = this.querySelector(this.selectors.button);
          this.optionsList = this.querySelector(this.selectors.optionsList);
          this.media = this.querySelectorAll(this.selectors.media);
          this.initListeners();
        }
        initListeners() {
          this.dropdownEvents = dropdownEvents_default({
            container: this,
            trigger: this.selectBtn,
            content: this.optionsList
          });
        }
        handleVariantSelector(e2) {
          const productOption = e2.target.closest("[data-product-option]");
          const { syncId, syncOptionName } = productOption.dataset;
          const sectionId = this.closest("section-product").id;
          const syncedInput = document.getElementById(`${syncOptionName}-${e2.target.value}-${syncId}-${sectionId}`);
          if (syncedInput) {
            syncedInput.checked = true;
            const variantSelectors = syncedInput.closest("component-product-variant-selectors");
            if (variantSelectors) {
              document.dispatchEvent(new CustomEvent("theme-quick-buy-select:change"));
            }
          }
        }
        updateProductImage(id) {
          this.media.forEach((item) => item.classList.add("hidden"));
          const mediaId = this.selectors.mediaTarget(id);
          this.querySelector(mediaId)?.classList.remove("hidden");
        }
      }
    );
  }
};

// js/common/components/component-quantity.js
var component_quantity_default = () => {
  if (!customElements.get("component-quantity")) {
    customElements.define(
      "component-quantity",
      class QuantityInput extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            syncedQuantityInput: (id) => `quantity-${id}`
          };
          this.syncId = this.dataset.syncId;
          this.QuantityInput = this.querySelector("input");
          this.querySelectorAll(".quantity__button").forEach(
            (button) => button.addEventListener("click", (e2) => {
              this[e2.target.name]();
            })
          );
          if (this.syncId) {
            const sectionId = this.closest("section-product").id;
            this.syncedQuantityInput = this.closest("section-product").querySelector(
              `#quantity-${this.syncId}-${sectionId}`
            );
            this.QuantityInput.addEventListener("input", () => this.syncInputs());
          }
        }
        syncInputs() {
          this.syncedQuantityInput.value = this.QuantityInput.value;
        }
        plus() {
          if (this.QuantityInput.max && parseInt(this.QuantityInput.value, 10) + 1 > this.QuantityInput.max)
            return;
          this.QuantityInput.value++;
          if (this.syncedQuantityInput)
            this.syncInputs();
        }
        minus() {
          if (parseInt(this.QuantityInput.value, 10) - 1 < this.QuantityInput.min)
            return;
          this.QuantityInput.value--;
          if (this.syncedQuantityInput)
            this.syncInputs();
        }
      }
    );
  }
};

// js/common/components/component-pickup-availability.js
var component_pickup_availability_default = () => {
  if (!customElements.get("component-pickup-availability")) {
    customElements.define(
      "component-pickup-availability",
      class PickupAvailability extends HTMLElement {
        constructor() {
          super();
          this.variantId = this.dataset.variantId;
          this.rootUrl = this.dataset.rootUrl;
          this.section = this.closest(".shopify-section");
          if (!this.classList.contains("active"))
            return;
          this.renderContent(this.variantId);
        }
        renderContent(variantId) {
          if (!variantId)
            return;
          let rootUrl = this.rootUrl;
          if (!rootUrl.endsWith("/")) {
            rootUrl = rootUrl + "/";
          }
          const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=fetch-pickup-availability`;
          fetch(variantSectionUrl).then((response) => response.text()).then((responseText) => {
            const html = responseText;
            const parsedHTML = new DOMParser().parseFromString(html, "text/html");
            const sectionInnerHTML = parsedHTML.querySelector(".shopify-section");
            this.renderPreview(sectionInnerHTML);
          });
        }
        update(variantId) {
          this.renderContent(variantId);
        }
        renderPreview(sectionInnerHTML) {
          const panel = this.section.querySelector('component-panel[data-sub-id^="pickupAvailabilityPanel"]');
          if (panel)
            panel.remove();
          if (!sectionInnerHTML.querySelector(".pickup-availability")) {
            this.innerHTML = "";
            this.classList.remove("active");
            return;
          }
          this.section.appendChild(sectionInnerHTML.querySelector("component-panel"));
          this.innerHTML = sectionInnerHTML.querySelector(".pickup-availability").outerHTML;
          this.classList.add("active");
        }
      }
    );
  }
};

// js/common/components/component-recommended-products.js
var component_recommended_products_default = () => {
  if (!customElements.get("component-recommended-products")) {
    customElements.define(
      "component-recommended-products",
      class RecommendedProducts extends HTMLElement {
        constructor() {
          super();
          this.url = this.dataset.url;
          this.productId = this.dataset.productId;
          this.sectionId = this.dataset.sectionId;
          this.parentSelector = this.dataset.parentSelector;
          this.loadRecommendations();
        }
        loadRecommendations() {
          fetch(`${this.url}&product_id=${this.productId}&section_id=${this.sectionId}`).then((response) => response.text()).then((responseText) => {
            const html = responseText;
            const parsedHTML = new DOMParser().parseFromString(html, "text/html");
            const recommendations = parsedHTML.querySelector("component-recommended-products");
            if (recommendations?.innerHTML.trim().length) {
              this.closest(this.parentSelector)?.classList.remove("hidden");
              this.innerHTML = recommendations.innerHTML;
              document.dispatchEvent(new CustomEvent("theme-recommended-products:loaded"));
            }
          }).catch((e2) => {
            console.error(e2);
          });
        }
      }
    );
  }
};

// js/common/components/component-recently-viewed.js
var component_recently_viewed_default = () => {
  if (!customElements.get("component-recently-viewed")) {
    customElements.define(
      "component-recently-viewed",
      class RecentlyViewed extends HTMLElement {
        constructor() {
          super();
          this.maxProducts = parseInt(this.dataset.maxProducts, 10);
          this.recentlyViewedKey = "theme-recently-viewed";
          this.recentlyViewedItems = getLocalStorageItem(this.recentlyViewedKey) || [];
          if (this.recentlyViewedItems.length) {
            const items = this.recentlyViewedItems.map((item) => {
              const parsedHTML = new DOMParser().parseFromString(item.content, "text/html");
              const card = parsedHTML.querySelector(".product-card");
              this.dataset.productClass.replace(/^\s+|\s+$/gm, "").split("\n").forEach((className) => card.classList.add(className));
              return card;
            });
            const itemContainer = this.querySelector(".recently-viewed__items");
            items.reverse().slice(0, this.maxProducts).forEach((item) => itemContainer.appendChild(item));
            this.closest(".shopify-section").classList.remove("hidden");
          }
        }
      }
    );
  }
};

// js/common/components/component-slider.js
import { Swiper as Swiper4, Navigation as Navigation3, Pagination as Pagination2 } from "vendor";
var component_slider_default = () => {
  if (!customElements.get("component-slider")) {
    customElements.define(
      "component-slider",
      class Slider extends HTMLElement {
        constructor() {
          super();
          this.initOnly = this.dataset.initOnly?.split(" ");
          if (this.initOnly) {
            if (this.initOnly.includes(window.theme.breakPoints.currentBreakpoint)) {
              this.initSwiper();
            }
            this.initBreakpointListener();
          } else {
            this.initSwiper();
          }
        }
        initSwiper() {
          const config = {
            loop: false,
            modules: [],
            slidesPerView: this.dataset.mobileColumns,
            spaceBetween: 10,
            a11y: {
              prevSlideMessage: window.accessibilityStrings.prevSlide,
              nextSlideMessage: window.accessibilityStrings.nextSlide
            },
            on: {
              slideChange: function(e2) {
                document.dispatchEvent(
                  new CustomEvent(`theme-slider:change`, { detail: { element: this.el, event: e2 } })
                );
              }
            }
          };
          if (this.dataset.autoSpaceSlides === "true") {
            config.slidesPerView = "auto";
          }
          if (this.dataset.autoHeight === "true") {
            config.autoHeight = true;
          }
          if (this.dataset.disableBreakpoints !== "true") {
            config.breakpoints = {
              768: {
                spaceBetween: 12
              },
              1024: {
                spaceBetween: 16
              },
              1400: {
                spaceBetween: 16
              }
            };
          }
          if (this.dataset.tabletColumns && this.dataset.disableBreakpoints !== "true") {
            config.breakpoints["768"].slidesPerView = this.dataset.tabletColumns;
          }
          if (this.dataset.desktopColumns && this.dataset.disableBreakpoints !== "true") {
            config.breakpoints["1024"].slidesPerView = this.dataset.desktopColumns;
            if (!this.dataset.desktopWideColumns) {
              config.breakpoints["1400"].slidesPerView = this.dataset.desktopColumns;
            }
          }
          if (this.dataset.desktopWideColumns && this.dataset.disableBreakpoints !== "true") {
            config.breakpoints["1400"].slidesPerView = this.dataset.desktopWideColumns;
          }
          if (this.dataset.disableNav !== "true") {
            config.modules.push(Navigation3);
            config.navigation = {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev"
            };
          }
          if (this.dataset.enableLoop === "true") {
            config.loop = true;
          }
          if (this.dataset.showPagination === "true") {
            config.modules.push(Pagination2);
            config.pagination = {
              el: ".swiper-pagination",
              renderBullet: function(index, className) {
                return `<button type="button" aria-label="${window.accessibilityStrings.goToProductImage} ${index}" class="${className}"><div><span></span></div></button>`;
              },
              clickable: true
            };
          }
          this.swiper = new Swiper4(this, config);
          this.swipe;
        }
        initBreakpointListener() {
          document.addEventListener("theme-breakpoint:change", ({ detail: { breakPoint } }) => {
            if (this.initOnly.includes(breakPoint)) {
              !this.swiper && this.initSwiper();
            } else {
              this.swiper?.destroy(true, true);
              this.swiper = null;
            }
          });
        }
        goToSlide(index) {
          this.swiper?.slideTo(index);
        }
      }
    );
  }
};

// js/common/components/component-panel-swipe.js
var component_panel_swipe_default = () => {
  if (!customElements.get("component-panel-swipe")) {
    customElements.define(
      "component-panel-swipe",
      class PanelSwipe extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            panelTriggers: "[data-panel-swipe-trigger]",
            panels: "[data-panel]",
            panelContent: ".panel-swipe__content",
            panelContentId: (id) => `.panel-swipe__content[data-id="${id}"]`,
            panelPreviousTrigger: "[data-previous-panel-trigger]"
          };
          this.activePanelLevel = 0;
          this.panels = this.querySelectorAll(this.selectors.panels);
          this.panelContent = this.querySelectorAll(this.selectors.panelContent);
          this.initEvents();
        }
        initEvents() {
          this.querySelectorAll(this.selectors.panelTriggers).forEach(
            (button) => button.addEventListener("click", (e2) => this.handlePanelSlide(e2.currentTarget))
          );
          this.querySelectorAll(this.selectors.panelPreviousTrigger).forEach(
            (button) => button.addEventListener("click", (e2) => this.handlePreviousTrigger(e2.currentTarget))
          );
        }
        dispatchEvent(action, targetPanel, targetId) {
          document.dispatchEvent(
            new CustomEvent(`theme-${this.dataset.id}-panel:${action}`, { detail: { targetPanel, targetId } })
          );
        }
        handlePanelSlide(el) {
          const targetPanel = el.dataset.panelTarget;
          const targetId = el.dataset.targetId;
          el.setAttribute("aria-expanded", true);
          this.hidePreviousContent();
          this.showPanel(parseInt(targetPanel, 10));
          this.showContent(targetPanel, targetId);
          this.dispatchEvent("changed", targetPanel, targetId);
        }
        handlePreviousTrigger(el) {
          const targetPanel = el.dataset.previousPanelLevel;
          const targetFocus = el.dataset.previousTriggerFocus;
          this.hidePreviousContent();
          this.showPanel(parseInt(targetPanel, 10));
          const previousFocus = this.panels[targetPanel].querySelector(
            `[data-panel-swipe-trigger][data-target-id="${targetFocus}"]`
          );
          previousFocus.closest(this.selectors.panelContent).classList.add("active");
          previousFocus?.focus();
        }
        showPanel(index) {
          this.panels.forEach((panel, i) => {
            if (index === i) {
              panel.classList.toggle("animation-forward", this.activePanelLevel < index);
              panel.classList.toggle("animation-reverse", this.activePanelLevel > index);
              setTimeout(() => {
                panel.classList.add("active");
              }, 0);
            } else {
              panel.classList.add("animation-reverse");
              panel.classList.remove("animation-forward");
              panel.classList.remove("active");
              this.panels[index].querySelectorAll('button[aria-expanded="true"').forEach((btn) => btn.setAttribute("aria-expanded", false));
            }
          });
          this.activePanelLevel = index;
        }
        showContent(index, targetId) {
          this.panels[index].querySelectorAll(this.selectors.panelContent).forEach((el) => el.classList.remove("active"));
          this.panels[index].querySelector(this.selectors.panelContentId(targetId)).classList.add("active");
          this.panels[index].querySelector(`[data-previous-trigger-focus="${targetId}"]`)?.focus();
        }
        hidePreviousContent() {
          this.panels[this.activePanelLevel].querySelectorAll(this.selectors.panelContent).forEach((content) => content.classList.remove("active"));
        }
      }
    );
  }
};

// js/common/components/component-disclosure-form.js
var component_disclosure_form_default = () => {
  if (!customElements.get("component-disclosure-form")) {
    customElements.define(
      "component-disclosure-form",
      class DisclosureForm extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            searchInput: "[data-disclosure-search]",
            searchReset: "[data-disclosure-search-reset]",
            item: ".disclosure__list-item",
            labelText: ".disclosure__label-text",
            wash: ".disclosure__wash"
          };
          this.form = this.querySelector("form");
          this.searchInput = this.querySelector(this.selectors.searchInput);
          this.searchReset = this.querySelector(this.selectors.searchReset);
          this.wash = this.querySelector(this.selectors.wash);
          this.items = this.querySelectorAll(this.selectors.item);
          this.initEvents();
        }
        initEvents() {
          this.querySelectorAll('input[type="checkbox"]').forEach(
            (input) => input.addEventListener("change", (e2) => this.handleChange(e2))
          );
          if (this.searchInput) {
            this.searchInput.addEventListener("input", (e2) => {
              this.searchReset.classList.toggle("active", e2.target.value);
              if (e2.target.value) {
                this.filterResults(this.normalizeString(e2.target.value));
              } else {
                this.reset();
              }
            });
            this.searchReset.addEventListener("click", () => {
              this.reset();
            });
          }
        }
        handleChange(e2) {
          this.wash.classList.add("active");
          this.querySelectorAll('input[type="checkbox"]:checked').forEach((input) => {
            if (input !== e2.currentTarget) {
              input.checked = false;
            }
          });
          this.form.submit();
        }
        normalizeString(str) {
          return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        }
        filterResults(searchValue) {
          this.items.forEach((el) => {
            const countryName = this.normalizeString(el.querySelector(this.selectors.labelText).textContent);
            if (countryName.indexOf(searchValue) > -1) {
              el.classList.remove("hidden");
            } else {
              el.classList.add("hidden");
            }
          });
        }
        reset() {
          this.items.forEach((el) => el.classList.remove("hidden"));
          this.searchInput.value = "";
          this.searchInput.focus();
          this.searchReset.classList.remove("active");
        }
      }
    );
  }
};

// js/common/components/component-image-comparison.js
var component_image_comparison_default = () => {
  if (!customElements.get("component-image-comparison")) {
    customElements.define(
      "component-image-comparison",
      class ImageCompare extends HTMLElement {
        constructor() {
          super();
          this.leftRevealThreshold = this.dataset.leftRevealThreshold;
          this.rightRevealThreshold = this.dataset.rightRevealThreshold;
          this.contentLeft = this.querySelector(".image-comparison__content--left");
          this.contentRight = this.querySelector(".image-comparison__content--right");
          this.querySelector(".handle").addEventListener("input", (e2) => {
            this.classList.add("image-comparison--has-user-input");
            const valuePercentage = e2.target.value / 10;
            this.style.setProperty("--compare-width", valuePercentage + "%");
            this.showContent(valuePercentage);
          });
        }
        showContent(valuePercentage) {
          this.contentLeft.classList.toggle("active", valuePercentage >= this.leftRevealThreshold);
          this.contentRight.classList.toggle("active", valuePercentage <= this.rightRevealThreshold);
        }
        show(side) {
          const sideThreshold = side === "left" ? this.leftRevealThreshold : this.rightRevealThreshold;
          this.classList.add("image-comparison--has-user-input");
          this.style.setProperty("--compare-width", sideThreshold + "%");
          this.showContent(sideThreshold);
        }
      }
    );
  }
};

// js/common/components/component-delayed-video.js
var component_delayed_video_default = () => {
  if (!customElements.get("component-delayed-video")) {
    customElements.define(
      "component-delayed-video",
      class DelayedVideo extends HTMLElement {
        constructor() {
          super();
          const { parentWrapper } = this.dataset;
          const template = this.querySelector("template");
          const section = this.closest(".shopify-section");
          const templateClone = template.content.cloneNode(true);
          const externalVideoiFrame = templateClone.querySelector("iframe");
          template.setAttribute("data-active", true);
          if (parentWrapper) {
            const wrapper = section.querySelector(parentWrapper);
            wrapper.append(templateClone);
            wrapper?.classList.add(
              "delayed-video-loaded",
              externalVideoiFrame ? externalVideoiFrame.dataset.type : "shopify-video"
            );
          } else {
            template.after(templateClone);
          }
          document.dispatchEvent(new CustomEvent(`theme-delayed-video:loaded`, { detail: { template } }));
        }
      }
    );
  }
};

// js/common/components/component-share-button.js
var component_share_button_default = () => {
  if (!customElements.get("component-share-button")) {
    customElements.define(
      "component-share-button",
      class ShareButton extends HTMLElement {
        constructor() {
          super();
          this.shareButtons = this.querySelectorAll("[data-copy-to-clipboard]");
          this.customSelect = this.querySelector("component-custom-select");
          this.successMessage = this.querySelector(".share-button__success-message");
          this.shareButtons.forEach((button) => {
            button.addEventListener("click", (e2) => {
              const url = e2.currentTarget.dataset.url;
              if (url) {
                navigator.clipboard.writeText(url).then(() => {
                  this.handleCopy();
                }).catch(() => {
                  this.handleCopy();
                });
              }
            });
          });
        }
        handleCopy() {
          this.customSelect.close();
          this.successMessage.classList.toggle("active");
          setTimeout(() => {
            this.successMessage.classList.toggle("active");
          }, 100);
        }
      }
    );
  }
};

// js/common/components/component-customer-login.js
var component_customer_login_default = () => {
  if (!customElements.get("component-customer-login")) {
    customElements.define(
      "component-customer-login",
      class CustomerLogin extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            loginForm: "[data-login-form]",
            resetForm: "[data-reset-form]",
            toggleTrigger: "[data-toggle-forms]"
          };
          this.loginForm = this.querySelector(this.selectors.loginForm);
          this.resetForm = this.querySelector(this.selectors.resetForm);
          this.toggleTriggers = this.querySelectorAll(this.selectors.toggleTrigger);
          this.toggleTriggers.forEach((trigger) => {
            trigger.addEventListener("click", () => this.toggleForms());
          });
          if (location.hash === "#recover") {
            this.toggleForms();
          }
        }
        toggleForms() {
          this.loginForm.classList.toggle("hidden");
          this.resetForm.classList.toggle("hidden");
        }
      }
    );
  }
};

// js/common/components/component-cart-note.js
var component_cart_note_default = () => {
  if (!customElements.get("component-cart-note")) {
    customElements.define(
      "component-cart-note",
      class CartNote extends HTMLElement {
        constructor() {
          super();
          const triggerButton = this.querySelector("[data-trigger-button]");
          const field = this.querySelector("[data-content-field]");
          const input = this.querySelector("[data-input]");
          this.updateTextEl = this.querySelector("[data-update-text]");
          this.inputHasValue = !!input.value;
          this.addText = this.dataset.addNoteText;
          this.editText = this.dataset.editNoteText;
          triggerButton.addEventListener("click", () => {
            field.style.setProperty("--content-height", `${field.scrollHeight + input.scrollHeight}px`);
            triggerButton.setAttribute("aria-expanded", triggerButton.getAttribute("aria-expanded") !== "true");
          });
          input.addEventListener(
            "input",
            debounce((event) => {
              if (this.inputHasValue !== !!event.target.value) {
                this.updateText(!!event.target.value);
              }
              const config = {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: `application/json` },
                body: JSON.stringify({
                  note: event.target.value
                })
              };
              fetch(routes.cart_update_url, config);
            }, 250)
          );
        }
        updateText(hasValue) {
          this.inputHasValue = hasValue;
          this.updateTextEl.innerHTML = hasValue ? this.editText : this.addText;
        }
      }
    );
  }
};

// js/common/components/section-addresses.js
var section_addresses_default = () => {
  if (!customElements.get("section-addresses")) {
    customElements.define(
      "section-addresses",
      class Addresses extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            openAddressFormButton: "[data-open-address-form]",
            deleteAddressButton: "[data-delete-address]",
            templateForm: (id) => `[data-address-form-id="${id}"]`,
            formWrapper: (id) => `[data-address-form-wrapper-id="${id}"]`,
            addressCountrySelect: "[data-address-country-select]",
            closeFormButton: "[data-close-form]"
          };
          this.openAddressFormButtons = this.querySelectorAll(this.selectors.openAddressFormButton);
          this.deleteAddressButtons = this.querySelectorAll(this.selectors.deleteAddressButton);
          this.initEvents();
        }
        initEvents() {
          this.openAddressFormButtons.forEach((button) => {
            button.addEventListener("click", ({ currentTarget }) => {
              this.handleEdit(currentTarget);
            });
          });
          this.deleteAddressButtons.forEach((button) => {
            button.addEventListener("click", ({ currentTarget }) => {
              this.deleteAddress(currentTarget);
            });
          });
        }
        handleEdit(target) {
          const { addressId, formHeading } = target.dataset;
          const template = this.querySelector(this.selectors.templateForm(addressId));
          document.dispatchEvent(
            new CustomEvent("theme-modal:open", {
              detail: { template, heading: formHeading, callback: () => this.initForm(addressId) }
            })
          );
        }
        initForm(addressId) {
          const activeForm = document.querySelector(this.selectors.formWrapper(addressId));
          const closeFormButton = activeForm.querySelector(this.selectors.closeFormButton);
          closeFormButton.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("theme-modal:close"));
          });
          this.initializeCountries(activeForm);
        }
        initializeCountries(activeForm) {
          if (Shopify && Shopify.CountryProvinceSelector) {
            const countrySelect = activeForm.querySelector(this.selectors.addressCountrySelect);
            const formId = countrySelect.dataset.formId;
            new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
              hideElement: `AddressProvinceContainer_${formId}`
            });
          }
        }
        deleteAddress = (currentTarget) => {
          const { confirmMessage, target } = currentTarget.dataset;
          if (confirm(confirmMessage)) {
            window.Shopify.postLink(target, {
              parameters: { _method: "delete" }
            });
          }
        };
      }
    );
  }
};

// js/common/components/section-password-header.js
var section_password_header_default = () => {
  if (!customElements.get("section-password-header")) {
    customElements.define(
      "section-password-header",
      class PasswordHeader extends HTMLElement {
        constructor() {
          super();
          const passwordButton = this.querySelector("[data-password-modal-trigger]");
          const passwordTemplate = this.querySelector("[data-password-template]");
          const templateClone = passwordTemplate.content.cloneNode(true);
          if (templateClone.querySelector("#PasswordLoginForm-password-error")) {
            document.dispatchEvent(
              new CustomEvent("theme-modal:open", {
                detail: { template: passwordTemplate, heading: passwordTemplate.dataset.modalHeader }
              })
            );
          }
          passwordButton.addEventListener("click", () => {
            document.dispatchEvent(
              new CustomEvent("theme-modal:open", {
                detail: { template: passwordTemplate, heading: passwordTemplate.dataset.modalHeader }
              })
            );
          });
        }
      }
    );
  }
};

// js/common/components/component-gc-recipient-form.js
var component_gc_recipient_form_default = () => {
  if (!customElements.get("component-gc-recipient-form")) {
    customElements.define(
      "component-gc-recipient-form",
      class GCRecipientForm extends HTMLElement {
        constructor() {
          super();
          this.showFormCheckbox = this.querySelector("[data-show-form-checkbox]");
          this.showFormCheckbox.disabled = false;
          this.hiddenControlField = this.querySelector("[data-control-input]");
          this.hiddenControlField.disabled = true;
          this.formFields = this.querySelector("[data-form-fields]");
          this.emailInput = this.querySelector("[data-email-input]");
          this.nameInput = this.querySelector("[data-name-input]");
          this.messageInput = this.querySelector("[data-message-input]");
          this.sendonInput = this.querySelector("[data-send-on-date-input]");
          this.offsetProperty = this.querySelector(`[data-timezone-offset]`);
          if (this.offsetProperty)
            this.offsetProperty.value = (/* @__PURE__ */ new Date()).getTimezoneOffset().toString();
          this.errorMessageWrapper = this.querySelector(".product-form__recipient-error-message-wrapper");
          this.errorMessageList = this.errorMessageWrapper?.querySelector("ul");
          this.errorMessage = this.errorMessageWrapper?.querySelector(".error-message");
          this.defaultErrorHeader = this.errorMessage?.innerText;
          this.addEventListener("change", this.onChange.bind(this));
          this.onChange();
        }
        onChange() {
          this.toggleFields(this.showFormCheckbox.checked);
          if (this.showFormCheckbox.checked) {
            this.enableInputFields();
          } else {
            this.clearInputFields();
            this.disableInputFields();
            this.clearErrorMessage();
          }
        }
        inputFields() {
          return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput];
        }
        disableableFields() {
          return [...this.inputFields(), this.offsetProperty];
        }
        clearInputFields() {
          this.inputFields().forEach((field) => field.value = "");
        }
        enableInputFields() {
          this.disableableFields().forEach((field) => field.disabled = false);
        }
        disableInputFields() {
          this.disableableFields().forEach((field) => field.disabled = true);
        }
        toggleFields(shouldOpen) {
          this.formFields.classList.toggle("visible", !!shouldOpen);
        }
        showError(body) {
          this.clearErrorMessage();
          this.errorMessageWrapper.hidden = false;
          if (typeof body === "object") {
            this.errorMessage.innerText = this.defaultErrorHeader;
            return Object.entries(body).forEach(([key, value]) => {
              const errorMessageId = `RecipientForm-${key}-error-${this.dataset.sectionId}`;
              const fieldSelector = `#Recipient-${key}-${this.dataset.sectionId}`;
              const message = `${value.join(", ")}`;
              const errorMessageElement = this.querySelector(`#${errorMessageId}`);
              const errorTextElement = errorMessageElement?.querySelector(".error-message");
              if (!errorTextElement)
                return;
              if (this.errorMessageList) {
                this.errorMessageList.appendChild(this.createErrorListItem(fieldSelector, message));
              }
              errorTextElement.innerText = `${message}.`;
              errorMessageElement.classList.remove("hidden");
              const inputElement = this[`${key}Input`];
              if (!inputElement)
                return;
              inputElement.setAttribute("aria-invalid", true);
              inputElement.setAttribute("aria-describedby", errorMessageId);
            });
          }
          this.errorMessage.innerText = body;
        }
        createErrorListItem(target, message) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.setAttribute("href", target);
          a.innerText = message;
          li.appendChild(a);
          li.className = "error-message";
          return li;
        }
        clearErrorMessage() {
          this.errorMessageWrapper.hidden = true;
          if (this.errorMessageList)
            this.errorMessageList.innerHTML = "";
          this.querySelectorAll(".form__field-message").forEach((field) => {
            field.classList.add("hidden");
            const textField = field.querySelector(".error-message");
            if (textField)
              textField.innerText = "";
          });
          [this.emailInput, this.messageInput, this.nameInput, this.sendonInput].forEach((inputElement) => {
            inputElement.setAttribute("aria-invalid", false);
            inputElement.removeAttribute("aria-describedby");
          });
        }
        resetRecipientForm() {
          if (this.showFormCheckbox.checked) {
            this.showFormCheckbox.checked = false;
            this.clearInputFields();
            this.clearErrorMessage();
          }
        }
      }
    );
  }
};

// js/common/components/section-shop-the-look.js
var section_shop_the_look_default = () => {
  if (!customElements.get("section-shop-the-look")) {
    customElements.define(
      "section-shop-the-look",
      class ShopTheLook extends HTMLElement {
        constructor() {
          super();
          this.selectors = {
            content: "[data-text-content]",
            hotspotsContainer: "[data-hotspots-container]",
            hotspots: "[data-hotspot]",
            hotspotProductsContainer: "[data-products]",
            hotspotProduct: (id) => `[data-hotspot-product="${id}"]`,
            hotspotProducts: ".shop-the-look__product-wrapper",
            slider: ".shop-the-look__product-wrapper",
            flyup: ".shop-the-look__flyup",
            flyupCloseTrigger: "[data-close-flyup]"
          };
          this.aboveTabletSizes = ["tablet", "desktop", "desktop-wide", "desktop-x-wide"];
          this.belowTabletSizes = ["mobile", "mobile-landscape"];
          this.isAboveTabletSizes = this.aboveTabletSizes.includes(window.theme.breakPoints.currentBreakpoint);
          this.content = this.querySelector(this.selectors.content);
          this.hotspotsContainer = this.querySelector(this.selectors.hotspotsContainer);
          this.hotspots = this.querySelectorAll(this.selectors.hotspots);
          this.hotspotProductsContainer = this.querySelector(this.selectors.hotspotProductsContainer);
          this.hotspotProducts = this.querySelector(this.selectors.hotspotProducts);
          this.slider = this.querySelector(this.selectors.slider);
          this.flyup = this.querySelector(this.selectors.flyup);
          this.focusTrap = createFocusTrap(this.flyup, { allowOutsideClick: true });
          this.flyupCloseTriggers = this.querySelectorAll(this.selectors.flyupCloseTrigger);
          this.initEvents();
          if (this.dataset.hasIntroContent === "false") {
            if (this.aboveTabletSizes.includes(window.theme.breakPoints.currentBreakpoint)) {
              this.activateFirstHotspot();
            }
          }
        }
        initEvents() {
          this.hotspots.forEach((hotspot) => {
            hotspot.addEventListener("click", (e2) => {
              const index = e2.currentTarget.dataset.index;
              this.handleHotspot(e2.currentTarget, index);
            });
          });
          document.addEventListener("theme-slider:change", ({ detail }) => {
            if (detail.element === this.slider) {
              this.handleSlideChange(detail.event);
            }
          });
          if (this.dataset.hasIntroContent === "true") {
            document.addEventListener("theme-doc-clicked", ({ detail }) => {
              let shouldReset = true;
              if (this.hotspotsContainer.contains(detail.target) || this.hotspotProductsContainer.contains(detail.target) || this.flyup.contains(detail.target)) {
                shouldReset = false;
              }
              if (shouldReset) {
                this.hotspotProducts.classList.remove("active");
                this.resetHotspots();
                this.content?.classList.remove("hidden");
              }
            });
            this.addEventListener("keydown", ({ key }) => {
              if (key === "Escape") {
                if (this.content?.classList.contains("hidden")) {
                  this.hotspotProducts.classList.remove("active");
                  this.toggleContent();
                  this.resetHotspots();
                }
                this.closeFlyup();
              }
            });
          }
          this.flyupCloseTriggers.forEach((trigger) => trigger.addEventListener("click", () => this.closeFlyup()));
          document.addEventListener("theme-breakpoint:change", ({ detail: { breakPoint } }) => {
            if (this.isAboveTabletSizes !== this.aboveTabletSizes.includes(breakPoint)) {
              this.isAboveTabletSizes = this.aboveTabletSizes.includes(breakPoint);
              if (this.isAboveTabletSizes) {
                this.closeFlyup();
                if (this.dataset.hasIntroContent === "false") {
                  this.activateFirstHotspot();
                  this.slider?.goToSlide(0);
                } else {
                  this.hotspotProducts.classList.remove("active");
                  this.content.classList.remove("hidden");
                }
              } else {
                this.resetHotspots();
              }
            }
          });
        }
        activateFirstHotspot() {
          this.hotspots[0].setAttribute("aria-expanded", true);
        }
        toggleContent() {
          this.content.classList.toggle("hidden");
        }
        resetHotspots() {
          this.hotspots.forEach((hotspot) => hotspot.setAttribute("aria-expanded", false));
        }
        handleSlideChange(e2) {
          this.resetHotspots();
          this.hotspots[e2.activeIndex].setAttribute("aria-expanded", true);
        }
        handleHotspot(hotspot, index) {
          if (hotspot.getAttribute("aria-expanded") === "true" && this.dataset.hasIntroContent === "true" && this.aboveTabletSizes.includes(window.theme.breakPoints.currentBreakpoint)) {
            this.resetHotspots();
            this.toggleContent();
            this.hotspotProducts.classList.remove("active");
            return;
          }
          if (this.belowTabletSizes.includes(window.theme.breakPoints.currentBreakpoint)) {
            this.openFlyup();
          }
          this.resetHotspots();
          this.hotspotProducts.classList.add("active");
          hotspot.setAttribute("aria-expanded", true);
          this.slider?.goToSlide(index);
          if (!this.content.classList.contains("hidden")) {
            this.content.classList.add("hidden");
          }
        }
        openFlyup(e2) {
          this.flyup.classList.add("active");
          disableBodyScroll(this.flyup, {
            allowTouchMove: (el) => {
              while (el && el !== document.body) {
                if (el.getAttribute("data-scroll-lock-ignore") !== null) {
                  return true;
                }
                el = el.parentElement;
              }
            }
          });
          this.focusTrap.activate();
        }
        closeFlyup() {
          this.flyup.classList.remove("active");
          enableBodyScroll(this.flyup);
          this.focusTrap.deactivate();
          this.resetHotspots();
        }
      }
    );
  }
};

// js/common/components/section-image-with-products.js
var section_image_with_products_default = () => {
  if (!customElements.get("section-image-with-products")) {
    customElements.define(
      "section-image-with-products",
      class ImageWithProducts extends HTMLElement {
        constructor() {
          super();
          this.products = this.querySelectorAll(".image-with-products__product");
          this.revealButton = this.querySelector("[data-reveal-button]");
          this.belowTabletSizes = ["mobile", "mobile-landscape"];
          sticky_offset_default(this);
          if (!this.products.length)
            return;
          this.style.setProperty("--mobile-reveal-height", `${this.products[0].offsetHeight * 1.55}px`);
          this.initBreakpointListener();
          if (this.belowTabletSizes.includes(window.theme.breakPoints.currentBreakpoint)) {
            this.disableFocasables();
          }
          if (this.revealButton) {
            this.revealButton.addEventListener("click", () => {
              this.revealButton.classList.add("hidden");
              this.classList.add("image-with-product--products-revealed");
              this.enableFocusables();
            });
          }
        }
        initBreakpointListener() {
          document.addEventListener("theme-breakpoint:change", ({ detail: { breakPoint } }) => {
            this.style.setProperty("--mobile-reveal-height", `${this.products[0].offsetHeight * 1.55}px`);
            if (this.belowTabletSizes.includes(breakPoint)) {
              this.disableFocasables();
            } else {
              this.enableFocusables();
            }
          });
        }
        disableFocasables() {
          if (this.classList.contains("image-with-product--products-revealed"))
            return;
          this.products.forEach((prod, index) => {
            if (index >= 2) {
              const focusables = prod.querySelectorAll(
                "a[href]:not([tabindex^='-']), button:enabled, [tabindex]:not([tabindex^='-'])"
              );
              focusables.forEach((el) => {
                el.classList.add("focusable");
                el.tabIndex = -1;
              });
            }
          });
        }
        enableFocusables() {
          this.products.forEach((prod) => {
            prod.querySelectorAll(".focusable").forEach((el) => el.removeAttribute("tabindex"));
          });
        }
      }
    );
  }
};

// node_modules/sticky-sidebar/src/sticky-sidebar.js
var StickySidebar = (() => {
  const EVENT_KEY = ".stickySidebar";
  const VERSION = "3.3.1";
  const DEFAULTS = {
    /**
     * Additional top spacing of the element when it becomes sticky.
     * @type {Numeric|Function}
     */
    topSpacing: 0,
    /**
     * Additional bottom spacing of the element when it becomes sticky.
     * @type {Numeric|Function}
     */
    bottomSpacing: 0,
    /**
     * Container sidebar selector to know what the beginning and end of sticky element.
     * @type {String|False}
     */
    containerSelector: false,
    /**
     * Inner wrapper selector.
     * @type {String}
     */
    innerWrapperSelector: ".inner-wrapper-sticky",
    /**
     * The name of CSS class to apply to elements when they have become stuck.
     * @type {String|False}
     */
    stickyClass: "is-affixed",
    /**
     * Detect when sidebar and its container change height so re-calculate their dimensions.
     * @type {Boolean}
     */
    resizeSensor: true,
    /**
     * The sidebar returns to its normal position if its width below this value.
     * @type {Numeric}
     */
    minWidth: false
  };
  class StickySidebar2 {
    /**
     * Sticky Sidebar Constructor.
     * @constructor
     * @param {HTMLElement|String} sidebar - The sidebar element or sidebar selector.
     * @param {Object} options - The options of sticky sidebar.
     */
    constructor(sidebar, options = {}) {
      this.options = StickySidebar2.extend(DEFAULTS, options);
      this.sidebar = "string" === typeof sidebar ? document.querySelector(sidebar) : sidebar;
      if ("undefined" === typeof this.sidebar)
        throw new Error("There is no specific sidebar element.");
      this.sidebarInner = false;
      this.container = this.sidebar.parentElement;
      this.affixedType = "STATIC";
      this.direction = "down";
      this.support = {
        transform: false,
        transform3d: false
      };
      this._initialized = false;
      this._reStyle = false;
      this._breakpoint = false;
      this._resizeListeners = [];
      this.dimensions = {
        translateY: 0,
        topSpacing: 0,
        lastTopSpacing: 0,
        bottomSpacing: 0,
        lastBottomSpacing: 0,
        sidebarHeight: 0,
        sidebarWidth: 0,
        containerTop: 0,
        containerHeight: 0,
        viewportHeight: 0,
        viewportTop: 0,
        lastViewportTop: 0
      };
      ["handleEvent"].forEach((method) => {
        this[method] = this[method].bind(this);
      });
      this.initialize();
    }
    /**
     * Initializes the sticky sidebar by adding inner wrapper, define its container, 
     * min-width breakpoint, calculating dimensions, adding helper classes and inline style.
     * @private
     */
    initialize() {
      this._setSupportFeatures();
      if (this.options.innerWrapperSelector) {
        this.sidebarInner = this.sidebar.querySelector(this.options.innerWrapperSelector);
        if (null === this.sidebarInner)
          this.sidebarInner = false;
      }
      if (!this.sidebarInner) {
        let wrapper = document.createElement("div");
        wrapper.setAttribute("class", "inner-wrapper-sticky");
        this.sidebar.appendChild(wrapper);
        while (this.sidebar.firstChild != wrapper)
          wrapper.appendChild(this.sidebar.firstChild);
        this.sidebarInner = this.sidebar.querySelector(".inner-wrapper-sticky");
      }
      if (this.options.containerSelector) {
        let containers = document.querySelectorAll(this.options.containerSelector);
        containers = Array.prototype.slice.call(containers);
        containers.forEach((container, item) => {
          if (!container.contains(this.sidebar))
            return;
          this.container = container;
        });
        if (!containers.length)
          throw new Error("The container does not contains on the sidebar.");
      }
      if ("function" !== typeof this.options.topSpacing)
        this.options.topSpacing = parseInt(this.options.topSpacing) || 0;
      if ("function" !== typeof this.options.bottomSpacing)
        this.options.bottomSpacing = parseInt(this.options.bottomSpacing) || 0;
      this._widthBreakpoint();
      this.calcDimensions();
      this.stickyPosition();
      this.bindEvents();
      this._initialized = true;
    }
    /**
     * Bind all events of sticky sidebar plugin.
     * @protected
     */
    bindEvents() {
      window.addEventListener("resize", this, { passive: true, capture: false });
      window.addEventListener("scroll", this, { passive: true, capture: false });
      this.sidebar.addEventListener("update" + EVENT_KEY, this);
      if (this.options.resizeSensor && "undefined" !== typeof ResizeSensor) {
        new ResizeSensor(this.sidebarInner, this.handleEvent);
        new ResizeSensor(this.container, this.handleEvent);
      }
    }
    /**
     * Handles all events of the plugin.
     * @param {Object} event - Event object passed from listener.
     */
    handleEvent(event) {
      this.updateSticky(event);
    }
    /**
     * Calculates dimensions of sidebar, container and screen viewpoint
     * @public
     */
    calcDimensions() {
      if (this._breakpoint)
        return;
      var dims = this.dimensions;
      dims.containerTop = StickySidebar2.offsetRelative(this.container).top;
      dims.containerHeight = this.container.clientHeight;
      dims.containerBottom = dims.containerTop + dims.containerHeight;
      dims.sidebarHeight = this.sidebarInner.offsetHeight;
      dims.sidebarWidth = this.sidebar.offsetWidth;
      dims.viewportHeight = window.innerHeight;
      this._calcDimensionsWithScroll();
    }
    /**
     * Some dimensions values need to be up-to-date when scrolling the page.
     * @private
     */
    _calcDimensionsWithScroll() {
      var dims = this.dimensions;
      dims.sidebarLeft = StickySidebar2.offsetRelative(this.sidebar).left;
      dims.viewportTop = document.documentElement.scrollTop || document.body.scrollTop;
      dims.viewportBottom = dims.viewportTop + dims.viewportHeight;
      dims.viewportLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
      dims.topSpacing = this.options.topSpacing;
      dims.bottomSpacing = this.options.bottomSpacing;
      if ("function" === typeof dims.topSpacing)
        dims.topSpacing = parseInt(dims.topSpacing(this.sidebar)) || 0;
      if ("function" === typeof dims.bottomSpacing)
        dims.bottomSpacing = parseInt(dims.bottomSpacing(this.sidebar)) || 0;
      if ("VIEWPORT-TOP" === this.affixedType) {
        if (dims.topSpacing < dims.lastTopSpacing) {
          dims.translateY += dims.lastTopSpacing - dims.topSpacing;
          this._reStyle = true;
        }
      } else if ("VIEWPORT-BOTTOM" === this.affixedType) {
        if (dims.bottomSpacing < dims.lastBottomSpacing) {
          dims.translateY += dims.lastBottomSpacing - dims.bottomSpacing;
          this._reStyle = true;
        }
      }
      dims.lastTopSpacing = dims.topSpacing;
      dims.lastBottomSpacing = dims.bottomSpacing;
    }
    /**
     * Determine whether the sidebar is bigger than viewport.
     * @public
     * @return {Boolean}
     */
    isSidebarFitsViewport() {
      return this.dimensions.sidebarHeight < this.dimensions.viewportHeight;
    }
    /**
     * Observe browser scrolling direction top and down.
     */
    observeScrollDir() {
      var dims = this.dimensions;
      if (dims.lastViewportTop === dims.viewportTop)
        return;
      var furthest = "down" === this.direction ? Math.min : Math.max;
      if (dims.viewportTop === furthest(dims.viewportTop, dims.lastViewportTop))
        this.direction = "down" === this.direction ? "up" : "down";
    }
    /**
     * Gets affix type of sidebar according to current scrollTop and scrollLeft.
     * Holds all logical affix of the sidebar when scrolling up and down and when sidebar 
     * is bigger than viewport and vice versa.
     * @public
     * @return {String|False} - Proper affix type.
     */
    getAffixType() {
      var dims = this.dimensions, affixType = false;
      this._calcDimensionsWithScroll();
      var sidebarBottom = dims.sidebarHeight + dims.containerTop;
      var colliderTop = dims.viewportTop + dims.topSpacing;
      var colliderBottom = dims.viewportBottom - dims.bottomSpacing;
      if ("up" === this.direction) {
        if (colliderTop <= dims.containerTop) {
          dims.translateY = 0;
          affixType = "STATIC";
        } else if (colliderTop <= dims.translateY + dims.containerTop) {
          dims.translateY = colliderTop - dims.containerTop;
          affixType = "VIEWPORT-TOP";
        } else if (!this.isSidebarFitsViewport() && dims.containerTop <= colliderTop) {
          affixType = "VIEWPORT-UNBOTTOM";
        }
      } else {
        if (this.isSidebarFitsViewport()) {
          if (dims.sidebarHeight + colliderTop >= dims.containerBottom) {
            dims.translateY = dims.containerBottom - sidebarBottom;
            affixType = "CONTAINER-BOTTOM";
          } else if (colliderTop >= dims.containerTop) {
            dims.translateY = colliderTop - dims.containerTop;
            affixType = "VIEWPORT-TOP";
          }
        } else {
          if (dims.containerBottom <= colliderBottom) {
            dims.translateY = dims.containerBottom - sidebarBottom;
            affixType = "CONTAINER-BOTTOM";
          } else if (sidebarBottom + dims.translateY <= colliderBottom) {
            dims.translateY = colliderBottom - sidebarBottom;
            affixType = "VIEWPORT-BOTTOM";
          } else if (dims.containerTop + dims.translateY <= colliderTop) {
            affixType = "VIEWPORT-UNBOTTOM";
          }
        }
      }
      dims.translateY = Math.max(0, dims.translateY);
      dims.translateY = Math.min(dims.containerHeight, dims.translateY);
      dims.lastViewportTop = dims.viewportTop;
      return affixType;
    }
    /**
     * Gets inline style of sticky sidebar wrapper and inner wrapper according 
     * to its affix type.
     * @private
     * @param {String} affixType - Affix type of sticky sidebar.
     * @return {Object}
     */
    _getStyle(affixType) {
      if ("undefined" === typeof affixType)
        return;
      var style = { inner: {}, outer: {} };
      var dims = this.dimensions;
      switch (affixType) {
        case "VIEWPORT-TOP":
          style.inner = {
            position: "fixed",
            top: dims.topSpacing,
            left: dims.sidebarLeft - dims.viewportLeft,
            width: dims.sidebarWidth
          };
          break;
        case "VIEWPORT-BOTTOM":
          style.inner = {
            position: "fixed",
            top: "auto",
            left: dims.sidebarLeft,
            bottom: dims.bottomSpacing,
            width: dims.sidebarWidth
          };
          break;
        case "CONTAINER-BOTTOM":
        case "VIEWPORT-UNBOTTOM":
          let translate = this._getTranslate(0, dims.translateY + "px");
          if (translate)
            style.inner = { transform: translate };
          else
            style.inner = { position: "absolute", top: dims.translateY, width: dims.sidebarWidth };
          break;
      }
      switch (affixType) {
        case "VIEWPORT-TOP":
        case "VIEWPORT-BOTTOM":
        case "VIEWPORT-UNBOTTOM":
        case "CONTAINER-BOTTOM":
          style.outer = { height: dims.sidebarHeight, position: "relative" };
          break;
      }
      style.outer = StickySidebar2.extend({ height: "", position: "" }, style.outer);
      style.inner = StickySidebar2.extend({
        position: "relative",
        top: "",
        left: "",
        bottom: "",
        width: "",
        transform: this._getTranslate()
      }, style.inner);
      return style;
    }
    /**
     * Cause the sidebar to be sticky according to affix type by adding inline
     * style, adding helper class and trigger events.
     * @function
     * @protected
     * @param {string} force - Update sticky sidebar position by force.
     */
    stickyPosition(force) {
      if (this._breakpoint)
        return;
      force = this._reStyle || force || false;
      var offsetTop = this.options.topSpacing;
      var offsetBottom = this.options.bottomSpacing;
      var affixType = this.getAffixType();
      var style = this._getStyle(affixType);
      if ((this.affixedType != affixType || force) && affixType) {
        let affixEvent = "affix." + affixType.toLowerCase().replace("viewport-", "") + EVENT_KEY;
        StickySidebar2.eventTrigger(this.sidebar, affixEvent);
        if ("STATIC" === affixType)
          StickySidebar2.removeClass(this.sidebar, this.options.stickyClass);
        else
          StickySidebar2.addClass(this.sidebar, this.options.stickyClass);
        for (let key in style.outer) {
          let _unit = "number" === typeof style.outer[key] ? "px" : "";
          this.sidebar.style[key] = style.outer[key];
        }
        for (let key in style.inner) {
          let _unit = "number" === typeof style.inner[key] ? "px" : "";
          this.sidebarInner.style[key] = style.inner[key] + _unit;
        }
        let affixedEvent = "affixed." + affixType.toLowerCase().replace("viewport-", "") + EVENT_KEY;
        StickySidebar2.eventTrigger(this.sidebar, affixedEvent);
      } else {
        if (this._initialized)
          this.sidebarInner.style.left = style.inner.left;
      }
      this.affixedType = affixType;
    }
    /**
     * Breakdown sticky sidebar when window width is below `options.minWidth` value.
     * @protected
     */
    _widthBreakpoint() {
      if (window.innerWidth <= this.options.minWidth) {
        this._breakpoint = true;
        this.affixedType = "STATIC";
        this.sidebar.removeAttribute("style");
        StickySidebar2.removeClass(this.sidebar, this.options.stickyClass);
        this.sidebarInner.removeAttribute("style");
      } else {
        this._breakpoint = false;
      }
    }
    /**
     * Switches between functions stack for each event type, if there's no 
     * event, it will re-initialize sticky sidebar.
     * @public
     */
    updateSticky(event = {}) {
      if (this._running)
        return;
      this._running = true;
      ((eventType) => {
        requestAnimationFrame(() => {
          switch (eventType) {
            case "scroll":
              this._calcDimensionsWithScroll();
              this.observeScrollDir();
              this.stickyPosition();
              break;
            case "resize":
            default:
              this._widthBreakpoint();
              this.calcDimensions();
              this.stickyPosition(true);
              break;
          }
          this._running = false;
        });
      })(event.type);
    }
    /**
     * Set browser support features to the public property.
     * @private
     */
    _setSupportFeatures() {
      var support = this.support;
      support.transform = StickySidebar2.supportTransform();
      support.transform3d = StickySidebar2.supportTransform(true);
    }
    /**
     * Get translate value, if the browser supports transfrom3d, it will adopt it.
     * and the same with translate. if browser doesn't support both return false.
     * @param {Number} y - Value of Y-axis.
     * @param {Number} x - Value of X-axis.
     * @param {Number} z - Value of Z-axis.
     * @return {String|False}
     */
    _getTranslate(y = 0, x = 0, z = 0) {
      if (this.support.transform3d)
        return "translate3d(" + y + ", " + x + ", " + z + ")";
      else if (this.support.translate)
        return "translate(" + y + ", " + x + ")";
      else
        return false;
    }
    /**
     * Destroy sticky sidebar plugin.
     * @public
     */
    destroy() {
      window.removeEventListener("resize", this, { caption: false });
      window.removeEventListener("scroll", this, { caption: false });
      this.sidebar.classList.remove(this.options.stickyClass);
      this.sidebar.style.minHeight = "";
      this.sidebar.removeEventListener("update" + EVENT_KEY, this);
      var styleReset = { inner: {}, outer: {} };
      styleReset.inner = { position: "", top: "", left: "", bottom: "", width: "", transform: "" };
      styleReset.outer = { height: "", position: "" };
      for (let key in styleReset.outer)
        this.sidebar.style[key] = styleReset.outer[key];
      for (let key in styleReset.inner)
        this.sidebarInner.style[key] = styleReset.inner[key];
      if (this.options.resizeSensor && "undefined" !== typeof ResizeSensor) {
        ResizeSensor.detach(this.sidebarInner, this.handleEvent);
        ResizeSensor.detach(this.container, this.handleEvent);
      }
    }
    /**
     * Determine if the browser supports CSS transform feature.
     * @function
     * @static
     * @param {Boolean} transform3d - Detect transform with translate3d.
     * @return {String}
     */
    static supportTransform(transform3d) {
      var result = false, property = transform3d ? "perspective" : "transform", upper = property.charAt(0).toUpperCase() + property.slice(1), prefixes = ["Webkit", "Moz", "O", "ms"], support = document.createElement("support"), style = support.style;
      (property + " " + prefixes.join(upper + " ") + upper).split(" ").forEach(function(property2, i) {
        if (style[property2] !== void 0) {
          result = property2;
          return false;
        }
      });
      return result;
    }
    /**
     * Trigger custom event.
     * @static
     * @param {DOMObject} element - Target element on the DOM.
     * @param {String} eventName - Event name.
     * @param {Object} data - 
     */
    static eventTrigger(element, eventName, data) {
      try {
        var event = new CustomEvent(eventName, { detail: data });
      } catch (e2) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, data);
      }
      element.dispatchEvent(event);
    }
    /**
     * Extend options object with defaults.
     * @function
     * @static
     */
    static extend(defaults, options) {
      var results = {};
      for (let key in defaults) {
        if ("undefined" !== typeof options[key])
          results[key] = options[key];
        else
          results[key] = defaults[key];
      }
      return results;
    }
    /**
     * Get current coordinates left and top of specific element.
     * @static
     */
    static offsetRelative(element) {
      var result = { left: 0, top: 0 };
      do {
        let offsetTop = element.offsetTop;
        let offsetLeft = element.offsetLeft;
        if (!isNaN(offsetTop))
          result.top += offsetTop;
        if (!isNaN(offsetLeft))
          result.left += offsetLeft;
        element = "BODY" === element.tagName ? element.parentElement : element.offsetParent;
      } while (element);
      return result;
    }
    /**
     * Add specific class name to specific element.
     * @static 
     * @param {ObjectDOM} element 
     * @param {String} className 
     */
    static addClass(element, className) {
      if (!StickySidebar2.hasClass(element, className)) {
        if (element.classList)
          element.classList.add(className);
        else
          element.className += " " + className;
      }
    }
    /**
     * Remove specific class name to specific element
     * @static
     * @param {ObjectDOM} element 
     * @param {String} className 
     */
    static removeClass(element, className) {
      if (StickySidebar2.hasClass(element, className)) {
        if (element.classList)
          element.classList.remove(className);
        else
          element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
      }
    }
    /**
     * Determine weather the element has specific class name.
     * @static
     * @param {ObjectDOM} element 
     * @param {String} className 
     */
    static hasClass(element, className) {
      if (element.classList)
        return element.classList.contains(className);
      else
        return new RegExp("(^| )" + className + "( |$)", "gi").test(element.className);
    }
  }
  return StickySidebar2;
})();
var sticky_sidebar_default = StickySidebar;
window.StickySidebar = StickySidebar;

// js/common/components/component-overflow-scroller.js
var component_overflow_scroller_default = () => {
  if (!customElements.get("component-overflow-scroller")) {
    customElements.define(
      "component-overflow-scroller",
      class OverflowScroller extends HTMLElement {
        constructor() {
          super();
          this.overflowScroller = null;
          this.aboveDesktopSizes = ["desktop", "desktop-wide", "desktop-x-wide"];
          this.belowDesktopSizes = ["mobile", "mobile-landscape", "tablet"];
          this.isAboveDesktopSizes = this.aboveDesktopSizes.includes(window.theme.breakPoints.currentBreakpoint);
          elementResize_default(this, () => {
            this.overflowScroller?.updateSticky();
          });
          if (this.isAboveDesktopSizes) {
            this.initScroller();
          }
          document.addEventListener("theme-breakpoint:change", ({ detail: { breakPoint } }) => {
            if (this.isAboveDesktopSizes !== this.aboveDesktopSizes.includes(breakPoint)) {
              this.isAboveDesktopSizes = this.aboveDesktopSizes.includes(breakPoint);
              if (this.isAboveDesktopSizes) {
                this.initScroller();
              } else {
                this.destroyScroller();
              }
            }
          });
        }
        initScroller() {
          const headerIsStatic = document.documentElement.classList.contains("header-is-static");
          const topSpace = headerIsStatic ? 0 : getComputedStyle(document.documentElement).getPropertyValue("--header-height");
          this.overflowScroller = new sticky_sidebar_default(this, {
            containerSelector: "#overflow-scroller-wrapper",
            innerWrapperSelector: ".product__details-content-inner",
            topSpacing: parseInt(topSpace, 0),
            bottomSpacing: 0
          });
        }
        destroyScroller() {
          this.overflowScroller.destroy();
          this.overflowScroller = null;
        }
      }
    );
  }
};

// js/common/components/section-featured-collection-with-text.js
var section_featured_collection_with_text_default = () => {
  if (!customElements.get("section-featured-collection-with-text")) {
    customElements.define(
      "section-featured-collection-with-text",
      class FeaturedCollectionWithText extends HTMLElement {
        constructor() {
          super();
          sticky_offset_default(this);
        }
      }
    );
  }
};

// js/common/components/section-image-with-text.js
var section_image_with_text_default = () => {
  if (!customElements.get("section-image-with-text")) {
    customElements.define(
      "section-image-with-text",
      class ImageWithText extends HTMLElement {
        constructor() {
          super();
          sticky_offset_default(this);
        }
      }
    );
  }
};

// js/common/components/section-blog-posts.js
var section_blog_posts_default = () => {
  if (!customElements.get("section-blog-posts")) {
    customElements.define(
      "section-blog-posts",
      class BlogPosts extends HTMLElement {
        constructor() {
          super();
          sticky_offset_default(this);
        }
      }
    );
  }
};

// js/common/web-components.js
var web_components_default = () => {
  component_slider_default();
  component_modal_default();
  component_modal_full_content_default();
  section_announcement_bar_default();
  section_header_default();
  component_panel_default();
  section_popups_default();
  component_popup_default();
  section_quick_cart_default();
  section_cart_default();
  section_slideshow_default();
  section_testimonials_default();
  section_logos_marquee_default();
  section_banner_marquee_default();
  section_accordion_panels_default();
  section_image_compare_default();
  component_recently_viewed_default();
  section_collection_banner_default();
  section_password_header_default();
  section_shop_the_look_default();
  section_image_with_products_default();
  section_video_hero_default();
  section_facet_grid_default();
  section_featured_collection_with_text_default();
  section_image_with_text_default();
  section_blog_posts_default();
  section_search_default();
  component_product_form_default();
  component_product_variant_selectors_default();
  component_product_media_gallery_default();
  component_product_quick_buy_widget_default();
  section_product_default();
  section_addresses_default();
  component_nav_menu_default();
  component_mega_menu_default();
  component_product_grid_default();
  component_filters_and_sort_form_default();
  component_custom_select_default();
  component_accordion_default();
  component_price_range_default();
  component_quantity_button_default();
  component_quick_search_default();
  component_drawer_menu_default();
  component_quantity_default();
  component_pickup_availability_default();
  component_recommended_products_default();
  component_panel_swipe_default();
  component_disclosure_form_default();
  component_image_comparison_default();
  component_delayed_video_default();
  component_share_button_default();
  component_customer_login_default();
  component_cart_note_default();
  component_gc_recipient_form_default();
  component_overflow_scroller_default();
};

// js/common/delegates.js
var delegates_default = () => {
  let delegate = new main_default(document.body);
  delegate.on("click", "", docClicked);
  delegate.on("click", "[data-close-overlay]", closeOverlay);
  delegate.on("click", "[data-open-overlay]", openOverlay);
  delegate.on("click", "[data-remove-filter]", removeActiveFilter, false);
  delegate.on("click", "[data-add-product]", addProduct, false);
  delegate.on("click", "[data-add-product-with-variant]", addProductWithVariant, false);
  function docClicked(event) {
    document.dispatchEvent(new CustomEvent("theme-doc-clicked", { detail: event }));
  }
  function closeOverlay(event) {
    const container = event.target.closest("[data-sub-id]");
    const subId = container.dataset.subId;
    document.dispatchEvent(new CustomEvent(`theme-${subId}:close`));
  }
  function openOverlay(event) {
    const { subId, overlayTemplateId, overlayHeading, hasPageContent } = event.target.dataset;
    const overlayContent = event.target.parentNode.querySelector(`[data-template-id="${overlayTemplateId}"]`);
    const detail = {
      template: overlayContent
    };
    if (overlayHeading) {
      detail.heading = overlayHeading;
    }
    if (hasPageContent === "true") {
      detail.hasPageContent = true;
    }
    document.dispatchEvent(new CustomEvent(`theme-${subId}:open`, { detail }));
  }
  function removeActiveFilter(event) {
    event.preventDefault();
    const removeButton = event.target.dataset.removeTarget || event.target.closest("[data-remove-filter]");
    const { paramName, value, type } = removeButton.dataset;
    if (type === "price") {
      document.querySelector("component-price-range")?.reset(true);
      return;
    }
    const formInput = document.querySelector(
      `[name="${paramName.replaceAll('"', '\\"')}"][value="${value.replaceAll('"', '\\"')}"]`
    );
    formInput?.click();
  }
  function addProduct(event) {
    const { productTitle } = event.target.dataset;
    let addToCartForm = event.target.parentNode.querySelector('form[action$="/cart/add"]');
    let formData = new FormData(addToCartForm);
    const config = {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest", Accept: `application/javascript` },
      body: formData
    };
    fetch(`${routes.cart_add_url}.js`, config).then((response) => response.json()).then((response) => {
      if (response.status) {
        document.dispatchEvent(
          new CustomEvent("theme-cart:updated", {
            detail: {
              cart: response,
              shouldOpenCart: true,
              error: response.description,
              productTitle
            }
          })
        );
      }
      document.dispatchEvent(
        new CustomEvent("theme-cart:updated", {
          detail: {
            cart: response,
            shouldOpenCart: true
          }
        })
      );
    }).catch(() => {
    });
  }
  function addProductWithVariant(event) {
    const { productHandle } = event.target.dataset;
    const requestUrl = `${window.routes.products}/${encodeURIComponent(
      productHandle
    )}?section_id=fetch-quick-add-product`;
    fetch(requestUrl).then((response) => response.text()).then((responseText) => {
      const parsedHTML = new DOMParser().parseFromString(responseText, "text/html");
      const template = parsedHTML.querySelector("section-product");
      document.dispatchEvent(
        new CustomEvent("theme-modal:open", {
          detail: { template }
        })
      );
    });
  }
};

// js/common/animations.js
var animations_default = () => {
  const classes = {
    animateElementsOnScroll: "[data-animate-elements-on-scroll]",
    animationTarget: "animate"
  };
  function initializeSectionScrollAnimations(rootEl = document, isDesignModeEvent = false) {
    const animateOnScrollSections = rootEl.querySelectorAll(classes.animateElementsOnScroll);
    animateOnScrollSections.forEach((section) => {
      const { animateDelay } = section.dataset;
      if (isDesignModeEvent) {
        section.setAttribute("data-design-mode", true);
      }
      const animationTriggerElements = Array.from(section.getElementsByClassName(classes.animationTarget));
      if (animationTriggerElements.length === 0)
        return;
      if (animateDelay) {
        animationTriggerElements.forEach((el, index) => {
          el.style.setProperty("--animation-delay", `${index * animateDelay}ms`);
        });
      }
      const observer = new IntersectionObserver(onIntersection, {
        rootMargin: "0px 0px -100px 0px"
      });
      section.setAttribute("data-should-animate", false);
      observer.observe(section);
    });
  }
  function onIntersection(elements, observer) {
    elements.forEach((element, index) => {
      if (element.isIntersecting) {
        const elementTarget = element.target;
        if (elementTarget.getAttribute("data-should-animate") === "false") {
          elementTarget.setAttribute("data-should-animate", true);
        }
        observer.unobserve(elementTarget);
      }
    });
  }
  window.addEventListener("DOMContentLoaded", () => {
    initializeSectionScrollAnimations();
  });
  if (Shopify.designMode) {
    document.addEventListener("shopify:section:load", (event) => initializeSectionScrollAnimations(event.target, true));
    document.addEventListener("shopify:section:reorder", () => initializeSectionScrollAnimations(document, true));
  }
};

// js/theme.js
window.theme = {};
window.theme.breakPoints = new BreakPoints();
web_components_default();
delegates_default();
global_events_default();
animations_default();
var e = `
  display: inline-block;
  font-size: 12px;
  background: linear-gradient(to right, #3bcfd4, #fc9305, #f20094);
  color: white;
  padding: 4px;
  border-radius: 4px;
`;
var t = "\n";
t += "Theme version: v1.0.4\n", t += "Theme documentation: https://support.hexswitch.com\n", t += "Get help: https://support.hexswitch.com/contact", console.group("%cHaven by Hex Switch Studios.", e), console.log(`%c${t}`, "font-size: 11px;"), console.groupEnd();
/*! Bundled license information:

tabbable/dist/index.esm.js:
  (*!
  * tabbable 6.2.0
  * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
  *)

focus-trap/dist/focus-trap.esm.js:
  (*!
  * focus-trap 7.5.4
  * @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
  *)

sticky-sidebar/src/sticky-sidebar.js:
  (**
   * Sticky Sidebar JavaScript Plugin.
   * @version 3.3.1
   * @author Ahmed Bouhuolia <a.bouhuolia@gmail.com>
   * @license The MIT License (MIT)
   *)
*/
