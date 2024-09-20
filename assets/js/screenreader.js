export class ScreenReader {
  // Collect all elements and set the first one as current
  constructor(screen, elements = { 'html': { '*': "HTML Tag" } }) {
    this.screen = screen;
    this.elements = elements;
    this.readable = this.collect();
    this.current = 0;
  }
  
  // Setter for current index
  setCurrent(index) {
    this.current = parseInt(index);
    return this;
  }
  
  // Collect elements from all elements or a subset
  collect(subset = "") {
    return [...this.screen.contentWindow.document.querySelectorAll(Object.keys(subset ? this.elements[subset] : Object.assign({}, ...Object.values(this.elements))).toString())]
    .filter(element => {
      while (element) {
        if (getComputedStyle(element).visibility === 'hidden' || 
          getComputedStyle(element).display === 'none' || 
          element.closest('[aria-hidden="true"]')) {
          return false;
        }
        element = element.parentElement;
      }
      return true;
    });
  }
  
  // Update then return instance 
  move({ list = "", reverse = false } = {}) {
    // Find the next matching element after/before the current index
    const nextElement = (reverse ? this.readable.slice(0, this.current) : this.readable.slice(this.current + 1))[reverse ? "findLast" : "find"]((element) => element.matches(Object.keys(list ? this.elements[list] : Object.assign({}, ...Object.values(this.elements))).toString()));
    this.current = nextElement ? this.readable.indexOf(nextElement) : this.readable[reverse ? "findLastIndex" : "findIndex"]((element) => element.matches(Object.keys(list ? this.elements[list] : Object.assign({}, ...Object.values(this.elements))).toString()));
    return this;
  }
  
  // Activate current element then update readable and return instance
  activate() {
    const currentElement = this.readable[this.current];
    if (currentElement) {
      currentElement.click();
      this.readable = this.collect();
      this.current = this.readable.indexOf(currentElement) || 0;
    }
    return this;
  }
  
  // Return current element name
  speak({ wrapper, element = this.readable[this.current] } = {}) {
    return `${Object.assign({}, ...Object.values(this.elements))?.[element.tagName]} "${(wrapper ? wrapper(element) : element.textContent?.trim()) || 'vide'}"`
    + (element.selectedOptions ? ` ${[...element.selectedOptions].map(option => option.label).join(', ')}` : "")
    + (element.value ? ` : ${element.value.trim()}` : "")
    + (element.src && !element.hasAttribute("alt") ? ` (${element.src})` : "")
    + (element.getAttribute("placeholder") ? ` (${element.getAttribute("placeholder")})` : "")
    + (element.required ? " (Obligatoire)" : "")
    + (element.checked ? " (Coché)" : "")
    + (element.selected ? " (Sélectionné)" : "")
    + (element.disabled ? " (Désactivé)" : "")
  }
}
