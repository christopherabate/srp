export function accName(element) {
  return [...element.ownerDocument.querySelectorAll(`#${element.getAttribute("aria-labelledby")?.split(' ').join(', #')}`)]
  .filter(label =>
    label // Exclude empty element
    && getComputedStyle(label).visibility !== "hidden" // Exlude hidden elements
    && getComputedStyle(label).display !== "none" // Exlude display: none elements
    && !label.closest('[aria-hidden="true"]') // Exlude aria-hidden elements
  )
  .map(label => label?.textContent.trim())
  .join(", ")
  || element.getAttribute("aria-label")?.trim()
  || [...element.ownerDocument.querySelectorAll(`label[for="${element.id}"]`)]
  .filter(label =>
    label // Exclude empty element
    && getComputedStyle(label).visibility !== "hidden" // Exlude hidden elements
    && getComputedStyle(label).display !== "none" // Exlude display: none elements
    && !label.closest('[aria-hidden="true"]') // Exlude aria-hidden elements
  )
  .map(label => label?.textContent.trim())
  .join(", ")
  || element.closest("label")?.textContent.trim()
  || (element.hasAttribute("alt") ? (element.getAttribute("alt")?.trim() || " ") : null)
  || element.closest("figure")?.querySelector("figcaption")?.textContent.trim()
  || element.closest("figure")?.getAttribute("aria-label").trim()
  || element.closest("figure")?.getAttribute("title").trim()
  || element.closest("table")?.querySelector("caption")?.textContent.trim()
  || element.closest("table")?.getAttribute("aria-label").trim()
  || element.closest("table")?.getAttribute("title").trim()
  || element.closest("fieldset")?.querySelector("legend")?.textContent.trim()
  || element.closest("fieldset")?.getAttribute("aria-label").trim()
  || element.closest("fieldset")?.getAttribute("title").trim()
  || element.getAttribute("title")?.trim()
  || element.getAttribute("placeholder")?.trim()
  //|| element.getAttribute("src")?.trim()
  || element.textContent?.trim()
}