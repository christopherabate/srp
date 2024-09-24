export class ScreenReader extends EventTarget {
  /**
   * Initializes the ScreenReader with the screen object and element definitions.
   * @param {object} screen - The screen object (iframe or window).
   * @param {object} elements - Definitions for elements (default: basic HTML tags).
   */
  constructor(screen, elements = { 'html': { '*': "HTML Tag" } }) {
    super();
    this.screen = screen;
    this.elements = elements;
    this.collection = this.collect();
    this.current = 0;
    this.title = this.screen.contentWindow.document.title;
    this.live = null;
  }

  /**
   * Dispatches a custom event with the specified name and details.
   * @param {string} eventName - The name of the event.
   * @param {Object} [detail] - Additional event data.
   */
  dispatchEvent(eventName, detail) {
    super.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Sets the current index of the collection.
   * @param {number} index - New index.
   * @returns {ScreenReader} - The current instance (for chaining).
   */
  setCurrent(index, force = true) {
    const newIndex = Math.max(0, parseInt(index, 10));
    if (force || this.current !== newIndex) {
      this.current = newIndex;
      this.dispatchEvent('change', this);
    }
    
    return this;
  }

  /**
   * Collects visible elements from the DOM based on defined tags.
   * @param {string} [subset=''] - Specific subset of elements to collect.
   * @returns {HTMLElement[]} - Filtered list of visible elements.
   */
  collect(subset = '') {
    const isVisible = (element) => {
      if (!element) return true;
      const { visibility, display } = getComputedStyle(element);
      return visibility !== 'hidden' && display !== 'none' && !element.closest('[aria-hidden="true"]') && isVisible(element.parentElement);
    };

    const tags = subset ? this.elements[subset] : Object.assign({}, ...Object.values(this.elements));
    
    return [...this.screen.contentWindow.document.querySelectorAll(Object.keys(tags).join(','))].filter(isVisible);
  }

  /**
   * Moves to the next or previous element based on options.
   * @param {object} options - Options for movement.
   * @param {string} [options.list=''] - Subset of elements to navigate.
   * @param {boolean} [options.reverse=false] - Move backwards if true.
   * @returns {ScreenReader} - The current instance (for chaining).
   */
  move({ list = '', reverse = false } = {}) {
    const tags = list ? this.elements[list] : Object.assign({}, ...Object.values(this.elements));
    const direction = reverse ? 'findLast' : 'find';
    const elements = reverse ? this.collection.slice(0, this.current) : this.collection.slice(this.current + 1);

    const nextElement = elements[direction](element => element.matches(Object.keys(tags).toString()));
    this.setCurrent(nextElement ? this.collection.indexOf(nextElement) : reverse ? this.collection.length - 1 : 0);
    
    return this;
  }

  /**
   * Activates the current element by triggering a click.
   * @returns {ScreenReader} - The current instance (for chaining).
   */
  activate() {
    if (!this.collection[this.current].disabled) {
      let force = false;
      
      const currentElement = this.collection[this.current].closest('select') || this.collection[this.current];
      
      switch (currentElement.tagName.toLowerCase()) {
        case 'select':
          currentElement.value = this.collection[this.current].value;
          break;
        case 'textarea':
          currentElement.value = prompt(this.speak(currentElement).role, currentElement.value);
          force = true;
          break;
        case 'input':
          switch (currentElement.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'url':
            case 'tel':
            case 'search':
            case 'date':
            case 'month':
            case 'week':
            case 'time':
              currentElement.value = prompt(this.speak(currentElement).role, currentElement.value);
              break;
            case 'checkbox':
              currentElement.checked = !currentElement.checked;
              break;
            case 'radio':
              currentElement.checked = true;
              break;
          }
          force = true;
          break;
        default: currentElement.click();
      }
    
      this.collection = this.collect();
      
      const indexFound = ['alert', 'status', 'log']
        .map(role => this.collection.findIndex(element => element.closest(`[role="${role}"]`)))
        .find(index => index !== -1);
      
      if (indexFound && this.live !== this.collection[indexFound]) {
        this.setCurrent(indexFound);
        this.live = this.collection[this.current];
      } else {
        this.setCurrent(this.collection.indexOf(currentElement) || 0, force);
      }
      
      if (!this.collection.includes(this.live)) {
        this.live = null;
      }
    }
    
    return this;
  }

  /**
   * Generates a description of the current element.
   * @param {object} options - Options for describing the element.
   * @param {function} [options.wrapper] - Optional custom wrapper for element text.
   * @param {HTMLElement} [options.element=this.collection[this.current]] - The element to describe (defaults to the current element).
   * @returns {object} - An object containing the description of the element, including its role, name, and value.
   */
  speak({ wrapper, element = this.collection[this.current] } = {}) {
    const role = (typeof Object.assign({}, ...Object.values(this.elements))[`[role="${element.getAttribute('role')}"]`] === 'function'
      ? Object.assign({}, ...Object.values(this.elements))[`[role="${element.getAttribute('role')}"]`].call(Object.assign({}, ...Object.values(this.elements)))
      : Object.assign({}, ...Object.values(this.elements))[`[role="${element.getAttribute('role')}"]`])
      || Object.assign({}, ...Object.values(this.elements))[element.tagName]
      || '';
    
    const name = (wrapper ? wrapper(element) : element.textContent?.trim()) || '(empty)';
    
    const value = [
      element.selectedOptions ? [...element.selectedOptions].map(option => option.label).join(', ') : '',
      element.value ? element.value.trim() : '',
      element.hasAttribute('alt') ? (element.getAttribute('alt') ? '' : 'decorative') : (element.getAttribute('src') ? element.getAttribute('src').split('/').pop() : ''),
      element.getAttribute('placeholder') ? element.getAttribute('placeholder') : '',
      element.required ? '(required)' : '',
      element.checked ? '(checked)' : '',
      element.selected ? '(selected)' : '',
      element.disabled ? '(disabled)' : ''
    ];
    
    return {
      role,
      name,
      value: value.filter(Boolean).join(' ').trim()
    };
  }
}
