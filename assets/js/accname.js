/**
 * Retrieves the accessible name of an HTML element, taking into account ARIA 
 * attributes and other properties.
 * @param {HTMLElement} element - The element for which to obtain the accessible name.
 * @returns {string} - The accessible name of the element or an empty string if the element is not visible.
 */
export function accName(element) {
  // Visibility check: returns an empty string if the element or any of its parents is not visible
  if (!element || 
      getComputedStyle(element).visibility === 'hidden' || 
      getComputedStyle(element).display === 'none' || 
      element.closest('[aria-hidden="true"]')) {
    return ''; // The element is not visible, return an empty string
  }

  // Return the first non-empty value in priority order
  return (
    // Check if the element has the 'aria-labelledby' attribute
    (element.getAttribute('aria-labelledby') && 
      element.getAttribute('aria-labelledby')
        .split(' ') // Split the IDs by space
        .map(id => accName(element.ownerDocument.getElementById(id))) // Get the accessible name for each referenced ID
        .filter(Boolean) // Filter out falsy values (null, undefined, '')
        .join(', ')) // Join the values with a comma

    // Check the 'aria-label' attribute and return it if it exists
    || element.getAttribute('aria-label')?.trim() 

    // Check if the element has an ID and get the accessible name of the associated label
    || (element.id && accName(element.ownerDocument.querySelector(`label[for="${element.id}"]`))) 

    // Get the text from the closest label if present
    || (element.closest('label')?.textContent.trim() || '') 

    // Check if the element has an 'alt' attribute and return it
    || (element.hasAttribute('alt') ? element.getAttribute('alt')?.trim() : '') 

    // Get the text from the closest figcaption of a figure
    || (element.closest('figure')?.querySelector('figcaption')?.textContent.trim() || '') 

    // Get the text from the closest caption of a table
    || (element.closest('table')?.querySelector('caption')?.textContent.trim() || '') 

    // Get the text from the closest legend of a fieldset
    || (element.closest('fieldset')?.querySelector('legend')?.textContent.trim() || '') 

    // Check the 'title' attribute and return it if it exists
    || element.getAttribute('title')?.trim() 

    // Check the 'placeholder' attribute and return it if it exists
    || element.getAttribute('placeholder')?.trim() 

    // Retrieve the visible text content of the element's children
    || (Array.from(element.childNodes)
      .map(child => 
        child.nodeType === Node.TEXT_NODE 
          ? child.textContent.trim() 
          : accName(child)) // For each child, either get the text or call accName
      .filter(Boolean) // Filter out falsy values
      .join(' ')) // Join the text values of children with a space

    // If no accessible value was found, return an empty string
    || ''
  );
}
