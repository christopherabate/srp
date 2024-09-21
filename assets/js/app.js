import { ELEMENTS } from './elements.js';
import { ScreenReader } from './screenreader.js';
import { accName } from './accname.js';

// DOM elements
const SCREEN = document.querySelector("#screen");
const CONTROLS = document.querySelector("#controls");
const MASK = document.querySelector("#mask");
const VIEWER = document.querySelector("#viewer");
const LIST = document.querySelector("#list");
const WALLET = document.querySelector("#wallet");
const RULES = document.querySelector("#rules_modal");

// On page load
window.addEventListener("load", () => {
  // Display modal with rules on page load
  new bootstrap.Modal(RULES).show();
  
  // Initialize screen reader
  let sr = new ScreenReader(SCREEN, ELEMENTS);
  
  // Check live region
  if (sr.current) VIEWER.innerHTML = `<p>${sr.speak({ wrapper: accName }).substring(0, 100)}</p>`;
  
  // Key actions mapping
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
    1: () => LIST.innerHTML = `<h3 class="h6">${sr.collect('interactives').length} éléments interactifs :</h3><div class="list-group list-group-flush list-group-numbered">${sr.collect('interactives').map(interactive => [`<button type="button" class="list-group-item list-group-item-action" data-index="${sr.readable.indexOf(sr.readable.find((element) => element === interactive))}">${sr.speak({ wrapper: accName, element: interactive }).substring(0, 100)}</button>`]).join('')}</div>`,
    2: () => LIST.innerHTML = `<h3 class="h6">${sr.collect('headings').length} titres :</h3><div class="list-group list-group-flush list-group-numbered">${sr.collect('headings').map(heading => [`<button type="button" class="list-group-item list-group-item-action" data-index="${sr.readable.indexOf(sr.readable.find((element) => element === heading))}">${sr.speak({ wrapper: accName, element: heading }).substring(0, 100)}</button>`]).join('')}</div>`,
    3: () => LIST.innerHTML = `<h3 class="h6">${sr.collect('landmarks').length} régions :</h3><div class="list-group list-group-flush list-group-numbered">${sr.collect('landmarks').map(landmark => [`<button type="button" class="list-group-item list-group-item-action" data-index="${sr.readable.indexOf(sr.readable.find((element) => element === landmark))}">${sr.speak({ wrapper: accName, element: landmark }).substring(0, 100)}</button>`]).join('')}</div>`,
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
  
  // Event listener for button click in LIST
  LIST.addEventListener("click", (event) => {
    if (event.target.matches("button")) {
      event.preventDefault();
      VIEWER.innerHTML = `<p>${sr.setCurrent(event.target.closest("button").dataset.index).speak({ wrapper: accName }).substring(0, 100)}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`;
    }
  });
  
  // Event listener for button click in CONTROLS
  CONTROLS.querySelectorAll("button").forEach((button) => {
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
      
      // Update wallet if price is present
      if (price) {
        const newBalance = parseInt(wallet.textContent, 10) - parseInt(price, 10);
        wallet.textContent = newBalance;
        
        const walletAlert = wallet.closest("div.alert");
        if (newBalance < 100) walletAlert.classList.replace('alert-info', 'alert-warning');
        if (newBalance <= 0) walletAlert.classList.replace('alert-warning', 'alert-danger');
      }
    });
  });

  // Wait for a key press
  window.addEventListener("keydown", (event) => {
    // Check if the key is mapped to an action
    if (keyActions[event.key.toLowerCase()]) {
      event.preventDefault();
      keyActions[event.key.toLowerCase()](event.shiftKey); // Trigger the mapped action and pass the shiftKey state to the action
    }
  });
  
  // Mutation observer to trigger text-to-speech when content changes
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(mutation.target.firstChild.textContent));
    });
  });

  // Observe changes in VIEWER and LIST elements
  observer.observe(VIEWER, { childList: true });
  observer.observe(LIST, { childList: true });
});