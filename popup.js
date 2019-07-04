"use strict";


//fake state
let nurtureItems = [
  // {
  //   id: 0,
  //   action: "Push ups",
  //   percent: 64,
  //   goal: "like",
  //   reason: "The burn in my arms feels like progress",
  //   log: ["veryTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "neutral", "neutral", "mostlyNotTrue", "notTrue"]
  // },
];
let activeItemId = null;
let maxDotsToShow = 20;
let showIntroModule = true;
let removeIsActive = false;
let classShowRemove = "" //"showRemove" if true, anything else if false
let userVersion = "1.2.0"; 
let intensity = "likeDislike";


/***************************/
/***** EVENT LISTENERS *****/
/***************************/

//open a specific item
const onClickOpenItem = e => {
  let itemId = e.target.id;
  let classNames = e.target.className;
  if (itemId === "default") { return }
  if (classNames.includes("showRemove")) {
    removeItemFromList(itemId);
    return;
  }

  if (itemId === null || itemId == "" || itemId === undefined || isNaN(itemId)) {
    return;
  }

  loadPage("item", itemId);
}
document.querySelector(".nurtureItemList").addEventListener("click", onClickOpenItem);


const runBootstrapProcess = () => {

  const onBackButtonClick = () => {
    loadPage("home");
  }
  const onCloseButtonClick = () => {
    window.close();
  }
  const onAddNewItemClick = () => {
    loadPage("addNew")
  };
  const onAboutPageClick = () => {
    loadPage("about")
  }
  const onIntroButtonClick = () => {
    showIntroModule = false;
    loadPage("home");
    updateStorage(["showIntroModule"]);
  }
  const onHeaderDeleteButtonClick = () => {
    toggleRemoveButtons();
  }
  const onFaceClick = (e) => {
    let targetId = e.target.id;
    if (targetId === "notTrue" ||
      targetId === "mostlyNotTrue" ||
      targetId === "neutral" ||
      targetId === "mostlyTrue" ||
      targetId === "veryTrue") {
      faceClick(targetId);
    }
  }

  document.querySelectorAll(".back")
    .forEach(backButton => backButton
      .addEventListener("click", onBackButtonClick)
    );
  document.querySelectorAll(".close")
    .forEach(closeButton => closeButton
      .addEventListener("click", onCloseButtonClick)
    );
  document.querySelectorAll(".addNew")
    .forEach(addNewItemButton => addNewItemButton
      .addEventListener("click", onAddNewItemClick)
    );
  document.querySelector(".about")
    .addEventListener("click", onAboutPageClick);
  document.querySelector(".introButton")
    .addEventListener("click", onIntroButtonClick)
  document.querySelector(".delete")
    .addEventListener("click", onHeaderDeleteButtonClick);
  document.querySelector(".faces")
    .addEventListener("click", onFaceClick);
}




//form

const newItemFormToggleLike = () => {
  formGoalToggle("like");
} 
document.querySelector(".toggleLike")
  .addEventListener("click", newItemFormToggleLike);

const newItemFormToggleDislike = () => {
  formGoalToggle("dislike");
}
document.querySelector(".toggleDislike")
  .addEventListener("click", newItemFormToggleDislike);




document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();
  let goal = event.target.goal.value;
  let action = event.target.action.value;
  let reason = event.target.reason.value;
  newItem(goal, action, reason);
  this.reset();
});


//intensity modes
document.querySelector(".toggleLikeDislike").addEventListener("click", () => {
  intensityToggle("likeDislike");
});
document.querySelector(".toggleLoveHate").addEventListener("click", () => {
  intensityToggle("loveHate");
});


/*******************/
/*** FUNCTIONS *****/
/*******************/

function loadPage(page, itemId) {
  resetHomePage();
  resetItemPage()
  document.querySelector("#homeModule").classList.add("hide");
  document.querySelector("#itemModule").classList.add("hide");
  document.querySelector("#addNewModule").classList.add("hide");
  document.querySelector("#aboutModule").classList.add("hide");
  document.querySelector("#introModule").classList.add("hide");
  activeItemId = null;

  if (page === "home") {
    document.querySelector("#homeModule").classList.remove("hide");
    updateList();
  } else if (page === "item") {
    document.querySelector("#itemModule").classList.remove("hide");
    displayItem(itemId);
  } else if (page === "addNew") {
    document.querySelector("#addNewModule").classList.remove("hide");
  } else if (page === "about") {
    document.querySelector("#aboutModule").classList.remove("hide");
  } else if (page === "intro") {
    if (showIntroModule) {
      document.querySelector("#introModule").classList.remove("hide");
    }
    else loadPage("home");
  }

}

function updateList() {
  resetHomePage();
  let listHTML = "<p style='display:none'></p>";
  let list = document.querySelector(".nurtureItemList");

  if (nurtureItems.length !== 0) {
    for (var i = 0; i < nurtureItems.length; i++) {
      listHTML =
        listHTML +
        `<p id=${nurtureItems[i].id} class="${classShowRemove}">
          <span class="remove"> - </span>
          ${nurtureItems[i].action}
          <span class="percent ${nurtureItems[i].goal}">${nurtureItems[i].percent}%</span>
        </p>`;
    }
  } else {
    listHTML = "<p class='default' id='default'>Click + to make your first item!</p>";
  }
  list.insertAdjacentHTML("afterbegin", listHTML);
}

function removeItemFromList(itemId) {
  nurtureItems.splice(itemId, 1);
  for (let i = 0; i < nurtureItems.length; i++) {
    nurtureItems[i].id = i;
  }
  if (nurtureItems.length === 0) {
    toggleRemoveButtons();
  }
  updateStorage(["nurtureItems"]);
  updateList();
}

function toggleRemoveButtons() {

  removeIsActive = !removeIsActive;
  if (removeIsActive) {
    document.querySelector(".delete").classList.add("active");
    classShowRemove = "showRemove"
  }
  else {
    document.querySelector(".delete").classList.remove("active");
    classShowRemove = "";
  }
  updateList();
}

function displayItem(itemId) {
  activeItemId = itemId;
  let item = nurtureItems[itemId];

  document.querySelector("#itemModule .displayPercent").innerHTML = `${item.percent}%`;
  document.querySelector("#itemModule .displayAction").innerHTML = `I ${item.goal} ${item.action}`;
  document.querySelector("#itemModule .displayReason").innerHTML = `${item.reason}`;
  displayDots(itemId)
  updatePercent(itemId);
}

function displayDots(itemId) {
  resetDots();
  let opacity = 100;

  let opacityReducer = 100 / maxDotsToShow;
  if (maxDotsToShow <= 5) opacityReducer = 5;

  document.querySelector("#itemModule").classList.add(`${nurtureItems[itemId].goal}`)
  for (var i = 0; i < nurtureItems[itemId].log.length; i++) {
    if (i > maxDotsToShow - 1) return;
    let faceToAddTo = document.querySelector(`.face.${nurtureItems[itemId].log[i]} .dots`);
    if (i === 0) {
      faceToAddTo.insertAdjacentHTML("afterbegin", `<div class="dot newest" style="opacity:${opacity / 100}"></div>`);
    }
    else {
      faceToAddTo.insertAdjacentHTML("beforeend", `<div class="dot" style="opacity:${opacity / 100}"></div>`);
    }
    if (opacity > 10) {
      opacity -= opacityReducer;
    }
  }
}

function updatePercent(itemId) {

  let percent = 0;
  let faceValue = 25 / maxDotsToShow;

  for (let i = 0; i < nurtureItems[itemId].log.length; i++) {
    if (i < maxDotsToShow) {
      switch (nurtureItems[itemId].log[i]) {
        case "veryTrue":
          percent += faceValue * 4;
          break;
        case "mostlyTrue":
          percent += faceValue * 3;
          break;
        case "neutral":
          percent += faceValue * 2;
          break;
        case "mostlyNotTrue":
          percent += faceValue;
          break;
        default:
          break;
      }
    }
  }
  nurtureItems[itemId].percent = percent;
  document.querySelector(".displayPercent").innerHTML = `${percent}%`;
}

function faceClick(faceId) {
  nurtureItems[activeItemId].log.unshift(faceId);
  displayItem(activeItemId);
  updateStorage(["nurtureItems"]);
}

function formGoalToggle(goal) {
  if (goal === "like") {
    document.querySelector(".toggleLike").classList.add("active");
    document.querySelector(".toggleDislike").classList.remove("active");
    document.querySelector(".actionInput").placeholder = "ie. eating vegetables";
    if (intensity === "likeDislike"){
      document.querySelector(".actionLabel").innerHTML = "I'm learning to like...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to like?";
      document.querySelector(".goalResult").value = "like";
    } else {
      document.querySelector(".actionLabel").innerHTML = "I'm learning to love...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to love?";
      document.querySelector(".goalResult").value = "love";
    }
    document.querySelector(".reasonInput").placeholder = "ie. I feel healthy";
    
  }
  else if (goal === "dislike") {
    document.querySelector(".toggleLike").classList.remove("active");
    document.querySelector(".toggleDislike").classList.add("active");
    document.querySelector(".actionInput").placeholder = "ie. social media";
    if (intensity === "likeDislike") {
      document.querySelector(".actionLabel").innerHTML = "I'm learning to dislike...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to dislike?";
      document.querySelector(".goalResult").value = "dislike";
    } else {
      document.querySelector(".actionLabel").innerHTML = "I'm learning to hate...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to hate?";
      document.querySelector(".goalResult").value = "hate";
    }
    document.querySelector(".reasonInput").placeholder = "ie. Feels like a waste of time";
  }
}

// function formSubmissionVisibilityToggle() {
//   let actionInput = document.querySelector(".actionInput").value;
//   let reasonInput = document.querySelector(".reasonInput").value;
//   if (actionInput && reasonInput) {
//     document.querySelector(".submit").classList.add("canSubmit");
//   }
//   else {
//     document.querySelector(".submit").classList.remove("canSubmit");
//   }
// }



function intensityToggle(res) {

  if (res === "likeDislike") {
    intensity = "likeDislike";
    document.querySelector(".toggleLikeDislike").classList.add("active");
    document.querySelector(".toggleLoveHate").classList.remove("active");
    document.querySelector(".toggleLike").innerHTML = "LIKE";
    document.querySelector(".toggleDislike").innerHTML = "DISLIKE";
    for (var i = 0; i < nurtureItems.length; i++) {
      let goal = nurtureItems[i].goal;
      if (goal === "love" || goal === "like") {
        nurtureItems[i].goal = "like"
      } 
      else if (goal === "hate" || goal === "dislike"){
        nurtureItems[i].goal = "dislike"
      }
    }
  }
  else if (res === "loveHate"){
    intensity = "loveHate";
    document.querySelector(".toggleLoveHate").classList.add("active");
    document.querySelector(".toggleLikeDislike").classList.remove("active");
    document.querySelector(".toggleLike").innerHTML = "LOVE";
    document.querySelector(".toggleDislike").innerHTML = "HATE";
    for (var i=0;i<nurtureItems.length;i++){
      let goal = nurtureItems[i].goal;
      if (goal === "love" || goal === "like") {
        nurtureItems[i].goal = "love";
      } 
      else if (goal === "hate" || goal === "dislike") {
        nurtureItems[i].goal = "hate"
      }
    }
  }
  formGoalToggle("like"); //update values there to match
  updateStorage(["intensity"]);
}

function newItem(goal, action, reason) {
  let id = nurtureItems.length;
  let item = {
    id: id,
    action: action,
    percent: 0,
    goal: goal,
    reason: reason,
    log: [],
  }
  nurtureItems.push(item);
  updateStorage(["nurtureItems"]);
  loadPage("home");
}

function updateStorage(toUpdate) {

  if (toUpdate.includes("nurtureItems") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      nurtureItems: nurtureItems
    }, function () {});
  }

  if (toUpdate.includes("showIntroModule") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      showIntroModule: showIntroModule
    }, function () {});
  }

  if (toUpdate.includes("userVersion") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      userVersion: userVersion
    }, function () {});
  }

  if (toUpdate.includes("intensity") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      intensity: intensity
    }, function () {});
  }
    
}

function updateDataFromStorage() {

  chrome.storage.sync.get('nurtureItems', function (result) {
    if (result.nurtureItems) {
      nurtureItems = result.nurtureItems;
      updateList();
    }
  });
  chrome.storage.sync.get('intensity', function (result) {

    if (result.intensity) {
      intensity = result.intensity;
      intensityToggle(intensity);
    }
  });
}

function getIntroFromStorage() {
  chrome.storage.sync.get('showIntroModule', function (result) {

    if (result.showIntroModule !== undefined) {
      showIntroModule = result.showIntroModule;
    }
    if (showIntroModule) {
      loadPage("intro");
    }
    else {
      loadPage("home");
    }
  });
}

chrome.storage.onChanged.addListener(updateList)


/*******************/
/*** RESETS *****/
/*******************/

function resetHomePage() {
  // document.querySelector(".nurtureItemList").remove();
  // document.querySelector("#homeModule .body").insertAdjacentHTML("afterbegin", `<div class="nurtureItemList></div>"`);

  let items = document.querySelectorAll(".nurtureItemList > p");
  for (var i = 0; i < items.length; i++) {
    items[i].remove();
  }
}

function resetItemPage() {
  document.querySelector("#itemModule").classList.remove("like");
  document.querySelector("#itemModule").classList.remove("dislike");
  document.querySelector("#itemModule").classList.remove("love");
  document.querySelector("#itemModule").classList.remove("hate");
  resetDots();
}
function resetDots() {
  let dots = document.querySelectorAll(".dots");
  for (var i = 0; i < dots.length; i++) {
    while (dots[i].firstChild) {
      dots[i].firstChild.remove();
    }
  }
}

// document.addEventListener("keypress", e => {
//   if (e.key === "-") {
//     nurtureItems = [];
//     showIntroModule = true;
//     intensity = "likeDislike";
//     updateStorage(["all"]);
//     updateDataFromStorage();

//   }
// })

// document.addEventListener("keypress", e => {
//   if (e.key === "=") {
//     alert(nurtureItems[activeItemId].log)
//   }
// })


//first run
runBootstrapProcess();
updateDataFromStorage();
getIntroFromStorage();
formGoalToggle("like");