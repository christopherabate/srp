export function accName(element) {
  const isVisible = (element) => {
    while (element) {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
      element = element.parentElement;
    }
    return true;
  };

  const getVisibleLabels = (selector) => [...element.ownerDocument.querySelectorAll(selector)]
  .filter(label => label && isVisible(label) && !label.closest('[aria-hidden="true"]'))
  .map(label => label.textContent.trim())
  .join(", ");

  const ariaLabels = getVisibleLabels(`#${element.getAttribute("aria-labelledby")?.split(' ').join(', #')}`);
  const ariaLabel = element.getAttribute("aria-label")?.trim();
  const labelForElement = getVisibleLabels(`label[for="${element.id}"]`);
  const closestLabel = element.closest("label")?.textContent.trim();
  const altText = element.hasAttribute("alt") ? element.getAttribute("alt")?.trim() : null;
  const figcaption = element.closest("figure")?.querySelector("figcaption")?.textContent.trim();
  const caption = element.closest("table")?.querySelector("caption")?.textContent.trim();
  const legend = element.closest("fieldset")?.querySelector("legend")?.textContent.trim();
  const title = element.getAttribute("title")?.trim();
  const placeholder = element.getAttribute("placeholder")?.trim();
  const textContent = element.textContent?.trim();

  return ariaLabels || ariaLabel || labelForElement || closestLabel || altText || figcaption || caption || legend || title || placeholder || textContent || "";
}
