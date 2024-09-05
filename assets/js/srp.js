const SCREEN = document.querySelector("#screen");
const HISTORY = document.querySelector("#history");
const LIST = document.querySelector("#list");

let readable = [];
let current = 0; // Set first element as current

const ELEMENTS = {
  all: { P: "Paragraphe", IMG: "Image", OPTGROUP: "Groupe d'options", OPTION: "Option" },
  lists: { OL: "Liste ordonnée", UL: "Liste non-ordonnée", DL: "Liste de définitions" },
  listitem: { LI: "Élément de liste", DT: "Terme", DD: "Définition" },
  interactives: { A: "Lien", BUTTON: "Bouton", INPUT: "Champ", SELECT: "Liste de sélection" },
  landmarks: { HEADER: "En-tête de page", NAV: "Navigation principale", MAIN: "Section principale", FOOTER: "Pied de page" },
  headings: { H1: "Titre de niveau 1", H2: "Titre de niveau 2", H3: "Titre de niveau 3", H4: "Titre de niveau 4", H5: "Titre de niveau 5", H6: "Titre de niveau 6" }
};

function accessibleName(element) {
  return SCREEN.contentWindow.document.getElementById(element.getAttribute("aria-labelledby"))?.textContent.trim()
    || element.getAttribute("aria-label")
    || SCREEN.contentWindow.document.querySelector(`label[for="${element.id}"]`)?.textContent.trim()
    || element.closest("label")?.textContent.trim()
    || element.closest("figure")?.querySelector("figcaption")?.textContent.trim()
    || element.getAttribute("alt")
    || element.closest("table")?.querySelector("caption")?.textContent.trim()
    || element.closest("fieldset")?.querySelector("legend")?.textContent.trim()
    || element.matches([...Object.keys(ELEMENTS.lists), ...Object.keys(ELEMENTS.landmarks)].toString()) && `${element.children.length} éléments`
    || element.textContent.trim()
    || element.src
}

function speech(element) {
  const tag = Object.assign({}, ...Object.values(ELEMENTS))?.[element.tagName];
  return `${tag} "${accessibleName(element) || 'vide'}"`
    + (element.matches(Object.keys(ELEMENTS.interactives)) && element.value ? ` : ${element.value.trim()}` : "")
    + (element.getAttribute("placeholder") ? ` (${element.getAttribute("placeholder")})` : "")
    + (element.required ? " (Obligatoire)" : "")
    + (element.checked ? " (Coché)" : "")
    + (element.selected ? " (Sélectionné)" : "")
    + (element.disabled ? " (Désactivé)" : "");
}

function collect(list = "") {
  const elementsList = list ? ELEMENTS[list] : Object.assign({}, ...Object.values(ELEMENTS));
  
  // Build readable list
  return [...SCREEN.contentWindow.document.querySelectorAll(Object.keys(elementsList).toString())].filter(element =>
    getComputedStyle(element).visibility !== "hidden" // Exlude hidden elements
    && getComputedStyle(element).display !== "none" // Exlude display: none elements
    && !element.closest('[aria-hidden="true"]') // Exlude aria-hidden elements
  );
}

function list(elements) {
  // Build list
  const readableList = collect(elements);

  // Write list
  LIST.innerHTML = readableList.map(element => `<li>${speech(element)}</li>`).join("");
  
  // Speech to text
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(`${readableList.length} éléments`));
}

function output(speech) {
  // Write history
  HISTORY.innerHTML += `<li>${speech}</li>`;
  
  // Speech to text
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(speech));
}

function navigate(target, reverse = false) {
  const readableSlice = reverse ? readable.slice(0, current) : readable.slice(current + 1);
  const findMethod = reverse ? "findLast" : "find";
  const findIndexMethod = reverse ? "findLastIndex" : "findIndex";
  
  // Find the next matching element after the current index
  nextElement = readableSlice[findMethod]((element) => element.matches(Object.keys(target).toString()));
  
  if (nextElement) {
    // Update `current` if a next element is found
    current = readable.indexOf(nextElement);
  } else {
    // Search from the start if no next element is found
    current = readable[findIndexMethod]((element) => element.matches(Object.keys(target).toString()));
  }
  
  // Output the speech for the current element
  output(speech(readable[current]));
}

function activate(element) {
  console.log(element);
  element.click();
  output(speech(element));
  readable = collect();
}

// Wait page loading
window.addEventListener("load", (event) => {
  readable = collect();

  // Function mappings for key actions
  const keyActions = {
    ArrowDown: () => navigate(Object.assign({}, ...Object.values(ELEMENTS))),
    ArrowUp: () => navigate(Object.assign({}, ...Object.values(ELEMENTS)), true),
    h: () => navigate(ELEMENTS.headings),
    i: () => navigate(ELEMENTS.listitem),
    d: () => navigate(ELEMENTS.landmarks),
    Tab: () => navigate(ELEMENTS.interactives),
    Enter: () => activate(readable[current]),
    " ": () => activate(readable[current]),
    Esc: () => activate(readable[current]),
    t: () => output(`Titre de la page : ${SCREEN.contentWindow.document.title}`),
    1: () => list("headings"),
    2: () => list("interactives"),
    3: () => list("landmarks")
  };

  // Wait for a key press
  window.addEventListener("keydown", (event) => {
    event.preventDefault();

    // Check if the key is mapped to an action
    if (keyActions[event.key]) keyActions[event.key](); // Trigger the mapped action
  });
  
  // Wait for a button click to trigger keyboard event
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      
      const { key, keycode } = event.target.closest("button").dataset; // Get key and keyCode from the dataset

      // Dispatch keyboard event if key and keyCode are valid
      if (key && keycode) {
        window.dispatchEvent(new KeyboardEvent("keydown", {
          key: key, // Set key value
          code: key.toUpperCase(), // Set code value
          keyCode: keycode.charCodeAt(0), // Convert keyCode to charCode
          which: keycode.charCodeAt(0), // Set which (same as keyCode)
          bubbles: true, // Allow event to bubble up
          cancelable: true // Make the event cancelable
        }));
      }
    });
  });
});