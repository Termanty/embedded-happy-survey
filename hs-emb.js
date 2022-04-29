// hs = HAPPY survey (this is nps survey)

const hsRootElement = document.getElementById('hs-embeded-survey');

console.log('---  HAPPY Survey  ---');

document.addEventListener('DOMContentLoaded', () => {
  console.log('content loaded');

  /*  const cssUri =
    'https://happy-survey-embed.s3.eu-north-1.amazonaws.com/hs-emb.css'; */
  const cssUri = './hs-emb.css';
  const fileref = document.createElement('link');
  fileref.setAttribute('rel', 'stylesheet');
  fileref.setAttribute('type', 'text/css');
  fileref.setAttribute('href', cssUri);
  document.head.appendChild(fileref);

  createHS();
});

function createHS() {
  const closeButton = 'close';
  addElement(hsRootElement, 'div', closeButton, 'hs-closebutton-div');

  const question =
    'How likely are you to recommend Tero to a friend or colleague?';
  addElement(hsRootElement, 'h3', question, 'hs-question-h3');

  const hsInfoText = '(0 = Not Likely, 10 = Very Likely)';
  addElement(hsRootElement, 'p', hsInfoText, 'likely', 'hs-text-p');

  const selectWrapper = addElement(hsRootElement, 'div', undefined, 'progress');
  for (let i = 0; i < 11; i++) {
    const btElem = addElement(selectWrapper, 'button', `${i}`, `hs-emb-bt${i}`);
    btElem.classList.add('hs-emb-bt');
    btElem.addEventListener('click', handleButtonClick);
  }

  const commentInfo =
    'Please provide any comments to help explain your selection.';
  addElement(hsRootElement, 'p', commentInfo, 'hs-info-p');

  const commentElem = addElement(hsRootElement, 'textarea', null, 'hs-comment');
  commentElem.setAttribute('id', 'hs-comment-text');

  const saveButton = addElement(hsRootElement, 'button', 'Save', 'hs-emb-save');
  saveButton.addEventListener('click', handleSaveClick);
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
  const btElems = document.getElementsByClassName('hs-emb-bt');
  for (let bt of btElems) {
    bt.classList.remove('hs-emb-bt-selected');
  }
  btElem.classList.add('hs-emb-bt-selected');
}

function handleSaveClick(event) {
  const btElem = document.getElementsByClassName('hs-emb-bt-selected')[0];
  if (!btElem) return; // TODO: what to do when no selection is made?
  const score = btElem.innerHTML;
  const comment = document.getElementById('hs-comment-text').value;
  console.log(score);
  console.log(comment);

  const url =
    'http://ec2-13-53-206-94.eu-north-1.compute.amazonaws.com/responses';
  // const url = "http://localhost:3001/responses";
  const hsElem = document.getElementById('happy-survey-script');

  console.log(hsElem);
  const surveyId = hsElem.getAttribute('surveyid');
  console.log(surveyId);

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
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
