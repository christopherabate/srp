export class ScreenReader {
  // Collect all elements and set the first one as current
  constructor(screen, elements) {
    this.screen = screen;
    this.elements = elements || { 'html': { '*': "HTML Tag" }};
    this.readable = this.collect();
    this.current = 0;
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
  
  // Find element in readable, make it current and return instance
  find(target) {
    //find target in this.readable
    let foundElement = this.readable.find((element) => element === target);
    //this.current = this.readable INDEX
    this.current = foundElement ? this.readable.indexOf(foundElement) : 0;
    return this;
  }
  
  // Return current element name
  speak(wrapper) {
    return `${Object.assign({}, ...Object.values(this.elements))?.[this.readable[this.current].tagName]} "${(wrapper ? wrapper(this.readable[this.current]) : this.readable[this.current].textContent?.trim()) || 'vide'}"`
    + (this.readable[this.current].selectedOptions ? ` ${[...this.readable[this.current].selectedOptions].map(option => option.label).join(', ')}` : "")
    + (this.readable[this.current].value ? ` : ${this.readable[this.current].value.trim()}` : "")
    + (this.readable[this.current].src && !this.readable[this.current].hasAttribute("alt") ? ` (${this.readable[this.current].src})` : "")
    + (this.readable[this.current].getAttribute("placeholder") ? ` (${this.readable[this.current].getAttribute("placeholder")})` : "")
    + (this.readable[this.current].required ? " (Obligatoire)" : "")
    + (this.readable[this.current].checked ? " (Coché)" : "")
    + (this.readable[this.current].selected ? " (Sélectionné)" : "")
    + (this.readable[this.current].disabled ? " (Désactivé)" : "")
  }
}