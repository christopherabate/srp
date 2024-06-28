// Handle buying items
document.querySelectorAll(".card form").forEach((items) => {
  items.addEventListener("submit", (event) => {

    event.preventDefault();
    
    // Disable the item
    if (event.submitter.classList.contains("unique-item")) {
      event.submitter.disabled = true;
    }
    
    // Increase total cost
    document.querySelector("#total_cost").textContent = parseInt(document.querySelector("#total_cost").textContent, 10) + parseInt(event.submitter.textContent, 10);
  });
});

// Handle visualization
document.querySelector(".dropdown form").addEventListener("change", (event) => {
  console.log(event.srcElement.id + " " + event.srcElement.checked);
});