export class ScreenReader extends EventTarget {
  /**
   * Initializes the screen reader by collecting all elements and 
   * setting the first one as the current element.
   * @param {object} screen - The screen object.
   * @param {object} elements - An object defining elements and their descriptions.
   */
  constructor(screen, elements = { 'html': { '*': "HTML Tag" } }) {
    super(); // Call EventTarget's constructor
    this.screen = screen;
    this.elements = elements;
    this.current = 0;
    this.readable = this.collect();
  }
  
  /**
   * Dispatches a custom event on the ScreenReader instance with the given name and details.
   *
   * @param {string} eventName - The name of the event.
   * @param {Object} [detail] - Additional data to include with the event.
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    super.dispatchEvent(event);  // Dispatch event using EventTarget's dispatchEvent method
  }
  
  /**
   * Sets the current index of the readable elements.
   * @param {number} index - The new index to set.
   * @returns {ScreenReader} - The current instance for chaining.
   */
  setCurrent(index) {
    this.current = parseInt(index, 10);
    this.dispatchEvent('change', this);
    return this;
  }
  
  /**
   * Collects the elements from the DOM, based on the defined list of elements.
   * Filters out hidden or aria-hidden elements.
   * Also checks the role of elements to determine the first "live" element.
   * @param {string} [subset=''] - A subset of elements to collect, if specified.
   * @returns {HTMLElement[]} - A list of readable elements.
   */
  collect(subset = '') {
    const isVisible = (element) => {
      if (!element) return true;
      const computedStyle = getComputedStyle(element);
      if (computedStyle.visibility === 'hidden' || computedStyle.display === 'none' || element.closest('[aria-hidden="true"]')) {
        return false;
      }
      return isVisible(element.parentElement);
    };
    
    const elements = [...this.screen.contentWindow.document.querySelectorAll(Object.keys(Object.assign({}, ...Object.values(this.elements))).toString())]
      .filter(isVisible);
    
    this.setCurrent((index => index !== -1 ? index : null)(elements.findIndex(element => element.getAttribute('role') === 'alert'))
      ?? (index => index !== -1 ? index : null)(elements.findIndex(element => element.hasAttribute('autofocus')))
      ?? (index => index !== -1 ? index : null)(elements.findIndex(element => element.getAttribute('role') === 'status'))
      ?? (index => index !== -1 ? index : null)(elements.findIndex(element => element.getAttribute('role') === 'log'))
      ?? this.current);
        
    return [...this.screen.contentWindow.document.querySelectorAll(Object.keys(subset ? this.elements[subset] : Object.assign({}, ...Object.values(this.elements))).toString())]
      .filter(isVisible);
  }
  
  /**
   * Moves to the next or previous matching element.
   * Updates the current index accordingly.
   * @param {object} options - Options for movement.
   * @param {string} [options.list=''] - A subset of elements to consider.
   * @param {boolean} [options.reverse=false] - Whether to move backwards.
   * @returns {ScreenReader} - The current instance for chaining.
   */
  move({ list = '', reverse = false } = {}) {
    const listSelector = list
      ? this.elements[list]
      : Object.assign({}, ...Object.values(this.elements));

    const nextElement = (reverse ? this.readable.slice(0, this.current) : this.readable.slice(this.current + 1))[reverse ? 'findLast' : 'find'](
      element => element.matches(Object.keys(listSelector).toString())
    );
    
    this.setCurrent(nextElement
      ? this.readable.indexOf(nextElement)
      : this.readable[reverse ? 'findLastIndex' : 'findIndex'](
        element => element.matches(Object.keys(listSelector).toString())
      ));
    
    return this;
  }
  
  /**
   * Activates the current element by triggering a click.
   * Updates the readable list and sets the current index to the clicked element.
   * @returns {ScreenReader} - The current instance for chaining.
   */
  activate() {
    const currentElement = this.readable[this.current];
    
    if (currentElement) {
      currentElement.click();
      this.readable = this.collect();
      
      this.setCurrent(this.readable.indexOf(currentElement) || 0);
    }
    
    return this;
  }
  
  /**
   * Generates a string describing the current element, including its tag name, text, 
   * attributes, and state (e.g., required, checked).
   * @param {object} options - Options for speaking.
   * @param {function} [options.wrapper] - A wrapper function to format the element's text.
   * @param {HTMLElement} [options.element=this.readable[this.current]] - The element to describe.
   * @returns {string} - A description of the current element.
   */
  speak({ wrapper, element = this.readable[this.current] } = {}) {
    const speech = [
      Object.assign({}, ...Object.values(this.elements))[element.tagName] || '',
      (wrapper ? wrapper(element) : element.textContent?.trim()) || '(empty)',
      element.selectedOptions ? [...element.selectedOptions].map(option => option.label).join(', ') : '',
      element.value ? element.value.trim() : '',
      element.hasAttribute('alt') ? (element.getAttribute('alt') ? '' : 'decorative') : (element.getAttribute('src') ? element.getAttribute('src').split('/').pop() : ''),
      element.getAttribute('placeholder') ? element.getAttribute('placeholder') : '',
      element.required ? '(required)' : '',
      element.checked ? '(checked)' : '',
      element.selected ? '(selected)' : '',
      element.disabled ? '(disabled)' : ''
    ];

    return speech.filter(Boolean).join(' ');
  }
}
