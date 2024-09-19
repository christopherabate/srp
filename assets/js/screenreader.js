export class ScreenReader {
  // Collect all elements and set the first one as current
  constructor(screen, elements) {
    this.screen = screen;
    this.elements = elements || { 'html': { '*': "HTML Tag" }};
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
    .filter(element =>
      getComputedStyle(element).visibility !== "hidden" // Exlude hidden elements
      && getComputedStyle(element).display !== "none" // Exlude display: none elements
      && !element.closest('[aria-hidden="true"]') // Exlude aria-hidden elements
    );
  }
  
  // Update then return instance 
  move(options = {}) {
    const { list = "", reverse = false } = options;
    
    // Find the next matching element after/before the current index
    let nextElement = (reverse ? this.readable.slice(0, this.current) : this.readable.slice(this.current + 1))[reverse ? "findLast" : "find"]((element) => element.matches(Object.keys(list ? this.elements[list] : Object.assign({}, ...Object.values(this.elements))).toString()));
    this.current = nextElement ? this.readable.indexOf(nextElement) : this.readable[reverse ? "findLastIndex" : "findIndex"]((element) => element.matches(Object.keys(list ? this.elements[list] : Object.assign({}, ...Object.values(this.elements))).toString()));
    return this;
  }
  
  // Activate current element then update readable and return instance
  activate() {
    let currentElement = this.readable[this.current];
    //currentElement.click();
    // Update readable list and replace current
    this.readable = this.collect();
    return this;
  }
  
  // Return current element name
  speak(options = {}) {
    const { wrapper, element = this.readable[this.current] } = options;
    
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