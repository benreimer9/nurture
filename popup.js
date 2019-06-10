// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.set({ color: "#3aa757" }, function () {
//   console.log("The color is.");
// });

// chrome.storage.sync.get("color", function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute("value", data.color);
// });

// changeColor.onclick = function(element) {
//   let color = element.target.value;
//   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     chrome.tabs.executeScript(tabs[0].id, {
//       code: 'document.body.style.backgroundColor = "' + color + '";'
//     });
//   });
// };

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
  // {
  //   id: 1,
  //   action: "Vegetables",
  //   percent: 32,
  //   goal: "like",
  //   reason: "I like feeling healthy",
  //   log: ["veryTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "neutral", "neutral", "mostlyNotTrue", "notTrue"]
  // },
  // {
  //   id: 2,
  //   action: "Facebook feed",
  //   percent: 51,
  //   goal: "dislike",
  //   reason: "I hate wasting time",
  //   log: ["veryTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "neutral", "neutral", "mostlyNotTrue", "hate"]
  // }
];
let activeItemId = null;
let maxDotsToShow = 20;
let showIntroModule = true;
let removeIsActive = false;
let classShowRemove = "" //"showRemove" if true, anything else if false


/***************************/
/***** EVENT LISTENERS *****/
/***************************/

//open a specific item
document.querySelector(".nurtureItemList").addEventListener("click", e => {
  let itemId = e.target.id;
  let classNames = e.target.className;
  if (itemId === "default") { return }
  if (classNames.includes("showRemove")) {
    removeItemFromList(itemId);
    return;
  }
  loadPage("item", itemId);
});

//Back buttons
const back = document.querySelectorAll(".back");
for (var i = 0; i < back.length; i++) {
  back[i].addEventListener("click", () => {
    loadPage("home");
  });
}

//Close buttons
const close = document.querySelectorAll(".close");
for (var i = 0; i < close.length; i++) {
  close[i].addEventListener("click", () => {
    window.close();
  });
}

//AddNew buttons
const addNew = document.querySelectorAll(".addNew");
for (var i = 0; i < addNew.length; i++) {
  addNew[i].addEventListener("click", () => {
    loadPage("addNew")
  });
}

//Remove item buttons
// const removes = document.querySelectorAll(".remove");
// for (var i = 0; i < removes.length; i++) {
//   removes[i].addEventListener("click", (e) => {
//     removeItemFromList(e.target.id)
//   });
// }

//Delete button (in header)
document.querySelector(".delete").addEventListener("click", () => {
  toggleRemoveButtons();
});

//About page
document.querySelector(".about").addEventListener("click", () => {
  loadPage("about")
});

//intro page button
document.querySelector(".introButton").addEventListener("click", () => {
  showIntroModule = false;
  loadPage("home");
  updateStorage();
});

//Faces 
document.querySelector(".faces").addEventListener("click", e => {
  let targetId = e.target.id;
  if (targetId === "notTrue" ||
    targetId === "mostlyNotTrue" ||
    targetId === "neutral" ||
    targetId === "mostlyTrue" ||
    targetId === "veryTrue") {
    faceClick(targetId);
  }
})


//form
document.querySelector(".toggleLike").addEventListener("click", () => {
  formGoalToggle("like");
});
document.querySelector(".toggleDislike").addEventListener("click", () => {
  formGoalToggle("dislike");
});
document.querySelector(".actionInput").addEventListener("keydown", () => {
  formSubmitToggle();
});
document.querySelector(".reasonInput").addEventListener("keydown", () => {
  formSubmitToggle();
});
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();
  let goal = event.target.goal.value;
  let action = event.target.action.value;
  let reason = event.target.reason.value;
  newItem(goal, action, reason);
  this.reset();
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
    console.log('in intro, showIntroModule is ', showIntroModule);
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
  console.log("SPLICING : ");
  console.log('array ', nurtureItems);
  console.log('id ', itemId);
  nurtureItems.splice(itemId, 1);
  for (let i = 0; i < nurtureItems.length; i++) {
    nurtureItems[i].id = i;
  }
  if (nurtureItems.length === 0) {
    toggleRemoveButtons();
  }
  updateStorage();
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
  updateStorage();
}

function formGoalToggle(goal) {
  if (goal === "like") {
    document.querySelector(".toggleLike").classList.add("active");
    document.querySelector(".toggleDislike").classList.remove("active");
    document.querySelector(".actionLabel").innerHTML = "I'm learning to like...";
    document.querySelector(".actionInput").placeholder = "ie. eating vegetables";
    document.querySelector(".reasonLabel").innerHTML = "What about it do you want to like?";
    document.querySelector(".reasonInput").placeholder = "ie. I feel healthy";
    document.querySelector(".goalResult").value = "like";
  }
  else if (goal === "dislike") {
    document.querySelector(".toggleLike").classList.remove("active");
    document.querySelector(".toggleDislike").classList.add("active");
    document.querySelector(".actionLabel").innerHTML = "I'm learning to dislike...";
    document.querySelector(".actionInput").placeholder = "ie. social media";
    document.querySelector(".reasonLabel").innerHTML = "What about it do you want to dislike?";
    document.querySelector(".reasonInput").placeholder = "ie. Feels like a waste of time";
    document.querySelector(".goalResult").value = "dislike";
  }
}

function formSubmitToggle() {
  let actionInput = document.querySelector(".actionInput").value;
  let reasonInput = document.querySelector(".reasonInput").value;
  if (actionInput && reasonInput) {
    document.querySelector(".submit").classList.add("canSubmit");
  }
  else {
    document.querySelector(".submit").classList.remove("canSubmit");
  }
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
  updateStorage();
  loadPage("home");
}

function updateStorage() {
  chrome.storage.sync.set({ nurtureItems: nurtureItems }, function () {
  });
  chrome.storage.sync.set({ showIntroModule: showIntroModule }, function () {
  });
}

function updateDataFromStorage() {
  chrome.storage.sync.get('nurtureItems', function (result) {
    if (result.nurtureItems) {
      nurtureItems = result.nurtureItems;
      updateList();
    }
  });
}

function getIntroFromStorage() {
  chrome.storage.sync.get('showIntroModule', function (result) {
    if (result.showIntroModule !== "undefined") {
      showIntroModule = result.showIntroModule;
    }
    loadPage("intro");
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

document.addEventListener("keypress", e => {
  if (e.key === "-") {
    nurtureItems = [];
    showIntroModule = true;
    updateStorage();
    updateDataFromStorage();

  }
})

document.addEventListener("keypress", e => {
  if (e.key === "=") {
    alert(nurtureItems[activeItemId].log)
  }
})


//first run
updateDataFromStorage();
getIntroFromStorage();
formGoalToggle("like");