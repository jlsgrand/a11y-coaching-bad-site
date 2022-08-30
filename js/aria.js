/*
 * Constants & global vars
 */
const DIALOG_OPEN_CLASS = 'has-dialog';
const ESC_KEYCODE = 27;
let ignoreFocusChanges = false;

/*
 * Util functions
 */
function isFocusable(element) {
    if (element.tabIndex < 0) {
        return false;
    }

    if (element.disabled) {
        return false;
    }

    switch (element.nodeName) {
        case 'A':
            return !!element.href && element.rel !== 'ignore';
        case 'INPUT':
            return element.type !== 'hidden';
        case 'BUTTON':
        case 'SELECT':
        case 'TEXTAREA':
            return true;
        default:
            return false;
    }
}

function remove(item) {
    if (item.remove && typeof item.remove === 'function') {
        return item.remove();
    }
    if (item.parentNode && item.parentNode.removeChild && typeof item.parentNode.removeChild === 'function') {
        return item.parentNode.removeChild(item);
    }
    return false;
}

/**
 * @description Set Attempt to set focus on the current node.
 * @param element
 *          The node to attempt to focus on.
 * @returns {boolean}
 *  true if element is focused.
 */
function attemptFocus(element) {
    if (!isFocusable(element)) {
        return false;
    }

    ignoreFocusChanges = true;
    try {
        element.focus();
    } catch (e) {
        // continue regardless of error
    }
    ignoreFocusChanges = false;
    return document.activeElement === element;
}

/**
 * @description Set focus on descendant nodes until the first focusable element is
 *       found.
 * @param element
 *          DOM node for which to find the first focusable descendant.
 * @returns {boolean}
 *  true if a focusable element is found and focus is set.
 */
function focusFirstDescendant(element) {
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        if (attemptFocus(child) || focusFirstDescendant(child)) {
            return true;
        }
    }
    return false;
}

/**
 * @description Find the last descendant node that is focusable.
 * @param element
 *          DOM node for which to find the last focusable descendant.
 * @returns {boolean}
 *  true if a focusable element is found and focus is set.
 */
function focusLastDescendant(element) {
    for (let i = element.childNodes.length - 1; i >= 0; i--) {
        const child = element.childNodes[i];
        if (attemptFocus(child) || focusLastDescendant(child)) {
            return true;
        }
    }
    return false;
}

/**
 * @class
 * @description Dialog object providing modal focus management.
 *
 * Assumptions: The element serving as the dialog container is present in the
 * DOM and hidden. The dialog container has role='dialog'.
 * @param dialogId
 *          The ID of the element serving as the dialog container.
 * @param focusAfterClosed
 *          Either the DOM node or the ID of the DOM node to focus when the
 *          dialog closes.
 * @param focusFirst
 *          Optional parameter containing either the DOM node or the ID of the
 *          DOM node to focus when the dialog opens. If not specified, the
 *          first focusable element in the dialog will receive focus.
 */
class Dialog {
    constructor(dialogId, focusAfterClosed, focusFirst) {
        this.dialogNode = document.getElementById(dialogId);

        // Wrap in an individual backdrop element if one doesn't exist
        // Native <dialog> elements use the ::backdrop pseudo-element, which
        // works similarly.
        const backdropClass = 'dialog-backdrop';
        if (this.dialogNode.parentNode.classList.contains(backdropClass)) {
            this.backdropNode = this.dialogNode.parentNode;
        } else {
            this.backdropNode = document.createElement('div');
            this.backdropNode.className = backdropClass;
            this.dialogNode.parentNode.insertBefore(this.backdropNode, this.dialogNode);
            this.backdropNode.appendChild(this.dialogNode);
        }
        this.backdropNode.classList.add('active');

        // Disable scroll on the body element
        document.body.classList.add(DIALOG_OPEN_CLASS);

        if (typeof focusAfterClosed === 'string') {
            this.focusAfterClosed = document.getElementById(focusAfterClosed);
        } else if (typeof focusAfterClosed === 'object') {
            this.focusAfterClosed = focusAfterClosed;
        } else {
            throw new Error('Le paramètre focusAfterClosed est requis !');
        }

        if (typeof focusFirst === 'string') {
            this.focusFirst = document.getElementById(focusFirst);
        } else if (typeof focusFirst === 'object') {
            this.focusFirst = focusFirst;
        } else {
            this.focusFirst = null;
        }

        // Bracket the dialog node with two invisible, focusable nodes.
        // While this dialog is open, we use these to make sure that focus never
        // leaves the document even if dialogNode is the first or last node.
        const preDiv = document.createElement('div');
        this.preNode = this.dialogNode.parentNode.insertBefore(preDiv, this.dialogNode);
        this.preNode.tabIndex = 0;
        const postDiv = document.createElement('div');
        this.postNode = this.dialogNode.parentNode.insertBefore(postDiv, this.dialogNode.nextSibling);
        this.postNode.tabIndex = 0;

        this.dialogNode.classList.remove('hidden');

        this.trapFocusListener = this.trapFocus.bind(this);
        this.addListeners();

        if (this.focusFirst) {
            this.focusFirst.focus();
        } else {
            focusFirstDescendant(this.dialogNode);
        }

        this.lastFocus = document.activeElement;
    }

    close() {
        this.removeListeners();
        remove(this.preNode);
        remove(this.postNode);
        this.dialogNode.classList.add('hidden');
        this.backdropNode.classList.remove('active');
        this.focusAfterClosed.focus();
        document.body.classList.remove(DIALOG_OPEN_CLASS);
    }

    addListeners() {
        document.addEventListener('focus', this.trapFocusListener, true);
    }

    removeListeners() {
        document.removeEventListener('focus', this.trapFocusListener, true);
    }

    trapFocus(event) {
        if (ignoreFocusChanges) {
            return;
        }

        if (this.dialogNode.contains(event.target)) {
            this.lastFocus = event.target;
        } else {
            focusFirstDescendant(this.dialogNode);
            if (this.lastFocus === document.activeElement) {
                focusLastDescendant(this.dialogNode);
            }
            this.lastFocus = document.activeElement;
        }
    }
}

// Disclosure
class DisclosureButton {
    constructor(buttonNode) {
        this.buttonNode = buttonNode;
        this.controlledNode = false;

        var id = this.buttonNode.getAttribute('aria-controls');

        if (id) {
            this.controlledNode = document.getElementById(id);
        }

        this.buttonNode.setAttribute('aria-expanded', 'false');
        this.hideContent();

        this.buttonNode.addEventListener('click', this.onClick.bind(this));
        this.buttonNode.addEventListener('focus', this.onFocus.bind(this));
        this.buttonNode.addEventListener('blur', this.onBlur.bind(this));
    }

    showContent() {
        if (this.controlledNode) {
            this.controlledNode.style.display = 'block';
        }
    }

    hideContent() {
        if (this.controlledNode) {
            this.controlledNode.style.display = 'none';
        }
    }

    toggleExpand() {
        if (this.buttonNode.getAttribute('aria-expanded') === 'true') {
            this.buttonNode.setAttribute('aria-expanded', 'false');
            this.hideContent();
        } else {
            this.buttonNode.setAttribute('aria-expanded', 'true');
            this.showContent();
        }
    }

    /* EVENT HANDLERS */

    onClick() {
        this.toggleExpand();
    }

    onFocus() {
        this.buttonNode.classList.add('focus');
    }

    onBlur() {
        this.buttonNode.classList.remove('focus');
    }
}