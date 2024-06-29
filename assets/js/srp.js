// Handle buying items
document.querySelectorAll(".card form").forEach((items) => {
  items.addEventListener("submit", (event) => {

    event.preventDefault();
    
    // Disable the item
    if (event.submitter.classList.contains("unique-item")) {
      event.submitter.disabled = true;
    }
    
    document.querySelector("#" + event.submitter.dataset.srpItem).classList.remove("d-none");
    
    // Increase total cost
    document.querySelector("#total_cost").textContent = parseInt(document.querySelector("#total_cost").textContent, 10) + parseInt(event.submitter.textContent, 10);
  });
});

// Handle visualization
document.querySelector(".dropdown form").addEventListener("change", (event) => {
  if (event.srcElement.name == "mask" && event.srcElement.checked == true) {
    document.querySelector("#mask").classList.remove("invisible");
    document.querySelector("#mask").classList.add("visible");
    document.querySelector("#page").classList.remove("visible");
    document.querySelector("#page").classList.add("invisible");
    event.srcElement.parentElement.parentElement.querySelector("input[name='page']").checked = false;
  } else if (event.srcElement.name == "mask" && event.srcElement.checked == false) {
    document.querySelector("#mask").classList.remove("visible");
    document.querySelector("#mask").classList.add("invisible");
    document.querySelector("#page").classList.remove("invisible");
    document.querySelector("#page").classList.add("visible");
  } else if (event.srcElement.name == "page" && event.srcElement.checked == true) {
    document.querySelector("#mask").classList.remove("visible");
    document.querySelector("#mask").classList.add("invisible");
    document.querySelector("#page").classList.remove("visible");
    document.querySelector("#page").classList.add("invisible");
    event.srcElement.parentElement.parentElement.querySelector("input[name='mask']").checked = false;
  } else if (event.srcElement.name == "page" && event.srcElement.checked == false) {
    document.querySelector("#mask").classList.remove("visible");
    document.querySelector("#mask").classList.add("invisible");
    document.querySelector("#page").classList.remove("invisible");
    document.querySelector("#page").classList.add("viinvisible");
  } else if (event.srcElement.name == "title" && event.srcElement.checked == true) {
    document.querySelector("#puzzle h2").textContent = document.querySelector("#puzzle iframe").title;
  } else if (event.srcElement.name == "title" && event.srcElement.checked == false) {
    document.querySelector("#puzzle h2").textContent = "Puzzle";
  }
});