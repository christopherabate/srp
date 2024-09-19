import { ScreenReader } from './screenreader.js';
import { ELEMENTS } from './elements.js';
import { accName } from './accname.js';

const SCREEN = document.querySelector("#screen");
const MASK = document.querySelector("#mask");
const VIEWER = document.querySelector("#viewer");
const LIST = document.querySelector("#list");
const WALLET = document.querySelector("#wallet");
const RULES = document.querySelector("#rules_modal");

// Wait page loading
window.addEventListener("load", () => {
  // Display modal rules on load
  new bootstrap.Modal(RULES).show();
  
  // Init screen reader
  let sr = new ScreenReader(SCREEN, ELEMENTS);
  
  // Function mappings for key actions
  const keyActions = {
    arrowdown: () => VIEWER.innerHTML = `<p>${sr.move().speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    arrowup: () => VIEWER.innerHTML = `<p>${sr.move({ reverse: true }).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    h: (shiftKey) => VIEWER.innerHTML = `<p>${sr.move({ list: "headings", reverse: shiftKey }).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    i: (shiftKey) => VIEWER.innerHTML = `<p>${sr.move({ list: "listitems", reverse: shiftKey }).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    d: (shiftKey) => VIEWER.innerHTML = `<p>${sr.move({ list: "landmarks", reverse: shiftKey }).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    tab: (shiftKey) => VIEWER.innerHTML = `<p>${sr.move({ list: "interactives", reverse: shiftKey }).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    enter: () => VIEWER.innerHTML = `<p>${sr.activate().speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    " ": () => VIEWER.innerHTML = `<p>${sr.activate().speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    escape: () => VIEWER.innerHTML = `<p>${sr.activate().speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    t: () => VIEWER.innerHTML = `<p>Titre de la page : ${SCREEN.contentWindow.document.title}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    1: () => LIST.innerHTML = `<h3 class="h6 text-uppercase fw-bold">${sr.collect('interactives').length} éléments interactifs :</h3><ol>${sr.collect('interactives').map(interactive => [`<li><button class="btn btn-dark" data-index="${sr.readable.indexOf(sr.readable.find((element) => element === interactive))}">${sr.speak({ wrapper: accName, element: interactive }).substring(0, 100)}</button></li>`]).join('')}</ol>`,
    2: () => LIST.innerHTML = `<h3 class="h6 text-uppercase fw-bold">${sr.collect('headings').length} titres :</h3><ol>${sr.collect('headings').map(heading => [`<li><button class="btn btn-dark" data-index="${sr.readable.indexOf(sr.readable.find((element) => element === heading))}">${sr.speak({ wrapper: accName, element: heading }).substring(0, 100)}</button></li>`]).join('')}</ol>`,
    3: () => LIST.innerHTML = `<h3 class="h6 text-uppercase fw-bold">${sr.collect('landmarks').length} régions :</h3><ol>${sr.collect('landmarks').map(landmark => [`<li><button class="btn btn-dark" data-index="${sr.readable.indexOf(sr.readable.find((element) => element === landmark))}">${sr.speak({ wrapper: accName, element: landmark }).substring(0, 100)}</button></li>`]).join('')}</ol>`,
    m: () => {
      MASK.addEventListener('mousemove', (event) => {
        MASK.style.background = `linear-gradient(180deg, rgba(0,0,0,1) ${event.layerY - 20}px, rgba(0,0,0,0) ${event.layerY - 20}px ${event.layerY + 20}px, rgba(0,0,0,1) ${event.layerY + 20}px)`;
      });
      MASK.classList.replace('invisible', 'visible');
      SCREEN.classList.replace('invisible', 'visible');
    },
    f: () => {
      MASK.classList.replace('visible', 'invisible');
      SCREEN.classList.replace('invisible', 'visible');
    }
  };

  // Wait for a key press
  window.addEventListener("keydown", (event) => {
    // Check if the key is mapped to an action
    if (keyActions[event.key.toLowerCase()]) {
      event.preventDefault();
      keyActions[event.key.toLowerCase()](event.shiftKey); // Trigger the mapped action and pass the shiftKey state to the action
    }
  });
  
  // Wait for a button click to trigger control event
  document.querySelectorAll(".controls button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      
      const { key, keycode, price } = event.target.closest("button").dataset; // Get key and keyCode from the dataset

      // Dispatch keyboard event if key and keyCode are valid
      if (key && keycode) {
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: key,
          keyCode: keycode,
          which: keycode,
          bubbles: true,
          cancelable: true,
          shiftKey: event.shiftKey // Pass the actual shiftKey state
        }));
      }
      
      if (price) {
        // Increase total cost
        WALLET.textContent = parseInt(WALLET.textContent, 10) - parseInt(price, 10);
        if (parseInt(WALLET.textContent, 10) < 100) WALLET.closest("div.alert").classList.replace('alert-info', 'alert-warning');
        if (parseInt(WALLET.textContent, 10) < 0) WALLET.closest("div.alert").classList.replace('alert-warning', 'alert-danger');
      }
    });
  });
  
  // Wait for a button click to trigger action event
  LIST.addEventListener("click", (event) => {
    if (event.target.matches("button")) {
      event.preventDefault();
      
      VIEWER.innerHTML = `<p>${sr.setCurrent(event.target.closest("button").dataset.index).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`;
    }
  });
});
