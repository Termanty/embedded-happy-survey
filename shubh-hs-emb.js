// hs = HAPPY survey (this is nps survey)

const hsRootElement = document.getElementById("hs-embeded-survey");

console.log("---  HAPPY Survey  ---");

document.addEventListener("DOMContentLoaded", () => {
  console.log("content loaded");

  const cssUri =
    "https://happy-survey-embed.s3.eu-north-1.amazonaws.com/hs-emb.css";
  // const cssUri = "./hs-emb.css";
  const fileref = document.createElement("link");
  fileref.setAttribute("rel", "stylesheet");
  fileref.setAttribute("type", "text/css");
  fileref.setAttribute("href", cssUri);
  document.head.appendChild(fileref);

  createHS();
});

function createHS() {
  const close = "X";
  const closeButton = addElement(hsRootElement, "button", close, "hs-close-button");
  closeButton.addEventListener("click",handleCloseClick);

  const question =
    "How likely are you recommend us to a friend or colleagues?";
  addElement(hsRootElement, "h3", question, "hs-question-h3");

  const hsInfoText = "(0 = Not Likely, 10 = Very Likely)";
  addElement(hsRootElement, "p", hsInfoText, "likely", "hs-text-p");

  const selectWrapper = addElement(hsRootElement, "div", undefined, "progress");
  for (let i = 0; i < 11; i++) {
    const btElem = addElement(selectWrapper, "button", `${i}`, `hs-emb-bt${i}`);
    btElem.classList.add("hs-emb-bt");
    btElem.addEventListener("click", handleButtonClick);
  }

  //responsive page (input element and rating div)
  const responsiveInput = addElement(hsRootElement, "div",undefined, "responsive-section");
  const circle = addElement(responsiveInput,"input", undefined, "circle");
  circle.setAttribute("id", "ratingValue");
  circle.setAttribute("type", "text");
  circle.setAttribute("value","");
  circle.setAttribute("max",10);
  circle.addEventListener("change",handleInputchange)
  const rating = addElement(responsiveInput, "div", "", "rating");
  rating.setAttribute("id", "rating");
  rating.setAttribute("value",".1");
  rating.setAttribute("max", "1");
  rating.position= ratingValue;
  rating.style.backgroundColor="gray";
  rating.addEventListener("click", handleRatingClick);
  //It ends here

  const commentInfo =
    "Please provide any comments to help explain your selection.";
  addElement(hsRootElement, "p", commentInfo, "hs-info-p");

  const commentElem = addElement(hsRootElement, "textarea", null, "hs-comment");
  commentElem.setAttribute("id", "hs-comment-text");

  const saveButton = addElement(hsRootElement, "button", "Save", "hs-emb-save");
  saveButton.addEventListener("click", handleSaveClick);
}

function addElement(parent, childType, childText, childClass) {
  const childElem = document.createElement(childType);
  if (childText) childElem.innerHTML = childText;
  if (childClass) childElem.classList.add(childClass);
  parent.appendChild(childElem);
  return childElem;
}

function handleButtonClick(event) {
  const btElem = event.target;
  const btElems = document.getElementsByClassName("hs-emb-bt");
  for (let bt of btElems) {
    bt.classList.remove("hs-emb-bt-selected");
  }
  btElem.classList.add("hs-emb-bt-selected");
}

 function handleCloseClick() {
   window.close();
 }

 //responsive page on input change
 function handleInputchange(e) {
   const inputValue = e.target.value;
   if(inputValue < 0 || inputValue >10){
   alert("Rating can be 0-10!")
   e.target.value = "";
    e.target.focus();
  }
  else {
    swithHandle(inputValue);
  }
 }

 //responsive page on rating (div bar) click
function handleRatingClick(e) {
  const x = e.pageX - this.offsetLeft;
  const xconvert = x/300;
  var finalx = (xconvert).toFixed(1);
  rating.value = finalx;
  ratingValue.value = finalx*10;
  let ratingScore = ratingValue.value;
  swithHandle(ratingScore);
}

function swithHandle(value) {
  switch (value){
    case "0" :rating.style.backgroundImage= "linear-gradient(to right, rgba(0,0,0,0) 0%, gray 20%)";
    break;
    case "1" :rating.style.backgroundImage= "linear-gradient(to right, rgb(226, 96, 96) 10%, gray 20%)";
    break;
    case "2" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 10%,rgb(220, 95, 68) 20%, gray 20%";
    break;
    case "3" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 10%, rgb(220, 95, 68) 10%, rgb(220, 95, 68) 30%, gray 20%";
    break;
    case "4" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 10%, rgb(220, 95, 68) 20%, rgb(220, 95, 68) 30%,rgb(226, 96, 96) 40%, gray 20%";
    break;
    case "5" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 10%, rgb(220, 95, 68) 20%, rgb(220, 95, 68) 30%,rgb(226, 96, 96) 40%, rgb(220, 159, 68) 50%, gray 50%";
    break;
    case "6" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 9%, rgb(220, 95, 68) 9%, rgb(220, 95, 68) 12%,rgb(226, 96, 96) 10%, rgb(220, 159, 68) 50%, rgb(218, 188, 111) 60%, gray 20%";
    break;
    case "7" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 9%, rgb(220, 95, 68) 9%, rgb(220, 95, 68) 12%,rgb(226, 96, 96) 10%, rgb(220, 159, 68) 50%, rgb(218, 188, 111) 60%, rgb(183, 193, 122) 70%, gray 20%";
    break;
    case "8" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 9%, rgb(220, 95, 68) 9%, rgb(220, 95, 68) 12%,rgb(226, 96, 96) 10%, rgb(220, 159, 68) 50%, rgb(218, 188, 111) 60%, rgb(183, 193, 122) 70%, rgb(159, 203, 103) 80%, gray 20%";
    break;
    case "9" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 9%, rgb(220, 95, 68) 9%, rgb(220, 95, 68) 12%,rgb(226, 96, 96) 10%, rgb(220, 159, 68) 50%, rgb(218, 188, 111) 60%, rgb(183, 193, 122) 70%, rgb(159, 203, 103) 80%, rgb(82, 165, 105) 90%, gray 20%";
    break;
    case "10" :rating.style.backgroundImage="linear-gradient(to right, rgb(226, 96, 96) 9%, rgb(220, 95, 68) 9%, rgb(220, 95, 68) 12%,rgb(226, 96, 96) 10%, rgb(220, 159, 68) 50%, rgb(218, 188, 111) 60%, rgb(183, 193, 122) 70%, rgb(159, 203, 103) 80%, rgb(82, 165, 105) 90%,rgb(59, 133, 84) 100%, gray 20%";
    break;
    default : rating.style.backgroundColor="gray";
    break
  }
}

function handleSaveClick(event) {
  const btElem = document.getElementsByClassName("hs-emb-bt-selected")[0];
  if (!btElem) return; // TODO: what to do when no selection is made?
  const score = btElem.innerHTML;
  const comment = document.getElementById("hs-comment-text").value;
  console.log(score);
  console.log(comment);

  const url =
    "http://ec2-13-53-206-94.eu-north-1.compute.amazonaws.com/responses";
  // const url = "http://localhost:3001/responses";
  const hsElem = document.getElementById("happy-survey-script");

  console.log(hsElem);
  const surveyId = hsElem.getAttribute("surveyid");
  console.log(surveyId);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      surveyId,
      score,
      comment,
    }),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}
