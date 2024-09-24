import { ELEMENTS } from './elements.js';
import { ScreenReader } from './screenreader.js';
import { accName } from './accname.js';

// DOM elements
const CONTROLS = document.querySelectorAll(".controls");
const SCREEN = document.querySelector("#screen");
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
  const sr = new ScreenReader(SCREEN, ELEMENTS);
  
  sr.addEventListener('change', function() {
    VIEWER.innerHTML = `<p>
      <strong>${this.speak({ wrapper: accName }).role}</strong>
      ${this.speak({ wrapper: accName }).name}
      <em>${this.speak({ wrapper: accName }).value}</em></p>
    <div class="text-secondary">
      ${VIEWER.innerHTML}
    </div>`;
  });

  const updateList = (subset = LIST.getAttribute('data-subset')) => {
    if (!subset) return false;
    const elements = sr.collect(subset);
    LIST.setAttribute('data-subset', subset);
    LIST.innerHTML = `<h3 class="h6">${elements.length} éléments :</h3>
    <div class="list-group list-group-flush list-group-numbered">${elements.map(item => `
      <button type="button" class="list-group-item list-group-item-action" 
        data-index="${sr.collection.indexOf(item)}">
        <strong>${sr.speak({ wrapper: accName, element: item }).role}</strong>
        ${subset !== "landmarks" ? sr.speak({ wrapper: accName, element: item }).name : ''}
      </button>
      `).join('')}
    </div>`;
  };
  
  // Key actions mapping
  const keyActions = {
    arrowdown: () => sr.move(),
    arrowup: () => sr.move({ reverse: true }),
    h: (shiftKey) => sr.move({ list: "headings", reverse: shiftKey }),
    i: (shiftKey) => sr.move({ list: "listitems", reverse: shiftKey }),
    d: (shiftKey) => sr.move({ list: "landmarks", reverse: shiftKey }),
    tab: (shiftKey) => sr.move({ list: "interactives", reverse: shiftKey }),
    enter: () => {
      sr.activate();
      updateList();
    },
    " ": () => (sr.activate(), updateList()),
    escape: () => sr.collection[sr.current].dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, which: 27, bubbles: true, cancelable: true })),
    t: () => VIEWER.innerHTML = `<p>Titre de la page : ${sr.title}</p><div class="text-secondary">${VIEWER.innerHTML}</div>`,
    1: () => updateList('interactives'),
    2: () => updateList('headings'),
    3: () => updateList('landmarks'),
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
    if (event.target.closest("button").matches("button")) {
      event.preventDefault();
      sr.setCurrent(event.target.closest("button").dataset.index);
    }
  });
  
  // Event listener for button click in CONTROLS
  CONTROLS.forEach((control) => {
    control.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const { key, keycode, price } = event.target.closest("button").dataset;

        // Dispatch keyboard event if key and keyCode are valid
        if (key && keycode) {
          window.dispatchEvent(new KeyboardEvent("keydown", {
            key,
            keyCode: keycode,
            which: keycode,
            bubbles: true,
            cancelable: true,
            shiftKey: event.shiftKey
          }));
        }
        
        // Update wallet if price is present
        if (price) updateWallet(price);
      });
    });
  });

  const updateWallet = (price) => {
    const newBalance = parseInt(WALLET.textContent, 10) - parseInt(price, 10);
    WALLET.textContent = newBalance;

    const walletAlert = WALLET.closest("div.alert");
    if (newBalance < 100) walletAlert.classList.replace('alert-info', 'alert-warning');
    if (newBalance <= 0) walletAlert.classList.replace('alert-warning', 'alert-danger');
  };

  // Wait for a key press
  window.addEventListener("keydown", (event) => {
    const action = keyActions[event.key.toLowerCase()];
    if (action) {
      event.preventDefault();
      action(event.shiftKey);
    }
  });
  
  // Mutation observer to trigger text-to-speech when content changes
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(mutation.target.firstChild.textContent));
    });
  });

  // Observe changes in VIEWER and LIST first child elements
  observer.observe(VIEWER , { childList: true });
  observer.observe(LIST , { childList: true });
});
