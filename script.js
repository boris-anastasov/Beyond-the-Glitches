// --- Game State ---
let playerName = '';
let remotePicked = false;
let brightness = 1;
let dialogQueue = [];
let dialogIndex = 0;
let awaitingInput = false;
let isTyping = false;
let finishTyping = null;
let canSkipDialog = true;
let ignoreNextDialogClick = false;

// --- DOM Elements ---
const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const brightnessSlider = document.getElementById('brightness-slider');
const gameArea = document.getElementById('game-area');
const scene = document.getElementById('scene');
const dialogContainer = document.getElementById('dialog-container');
const remoteContainer = document.getElementById('remote-container');

// --- Utility Functions ---
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
function clearDialog() { dialogContainer.innerHTML = ''; }
function addDialog(text, type = 'monologue', showArrow = true, onDoneTyping) {
  clearDialog();
  const bubble = document.createElement('div');
  bubble.className = 'dialog-bubble ' + type;
  dialogContainer.appendChild(bubble);

  let i = 0;
  const speed = 20; // ms per character
  isTyping = true;
  canSkipDialog = false;
  setTimeout(() => { canSkipDialog = true; }, 200); // 200ms delay before allowing skip
  let typingTimeout = null;

  finishTyping = function() {
    if (!isTyping) return;
    isTyping = false;
    bubble.innerText = text;
    if (showArrow) {
      const arrow = document.createElement('span');
      arrow.innerHTML = ' ▼';
      arrow.style.fontSize = '1.2em';
      arrow.style.marginLeft = '0.5em';
      bubble.appendChild(arrow);
    }
    if (onDoneTyping) onDoneTyping();
    if (typingTimeout) clearTimeout(typingTimeout);
  };

  function typeWriter() {
    if (!isTyping) return;
    if (i <= text.length) {
      bubble.innerText = text.slice(0, i);
      i++;
      typingTimeout = setTimeout(typeWriter, speed);
    } else {
      isTyping = false;
      if (showArrow) {
        const arrow = document.createElement('span');
        arrow.innerHTML = ' ▼';
        arrow.style.fontSize = '1.2em';
        arrow.style.marginLeft = '0.5em';
        bubble.appendChild(arrow);
      }
      if (onDoneTyping) onDoneTyping();
    }
  }
  typeWriter();
}
function askInput(prompt, callback) {
  clearDialog();
  addDialog(prompt, 'monologue', false);
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 16;
  input.placeholder = 'Enter name...';
  input.style.margin = '1rem 0';
  input.style.fontSize = '1.1rem';
  input.style.padding = '0.5rem';
  dialogContainer.appendChild(input);
  input.focus();
  awaitingInput = true;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      awaitingInput = false;
      callback(input.value.trim());
    }
  });
}

// --- Settings ---
settingsBtn.onclick = () => { show(settingsModal); };
closeSettingsBtn.onclick = () => { hide(settingsModal); };
brightnessSlider.oninput = (e) => {
  brightness = e.target.value;
  gameArea.style.filter = `brightness(${brightness})`;
};

// --- Dialog System ---
function showDialogQueue(queue, onDone) {
  dialogQueue = queue;
  dialogIndex = 0;
  document.removeEventListener('click', window._dialogClickHandler);
  document.removeEventListener('keydown', window._dialogKeyHandler);
  function nextDialog() {
    if (!canSkipDialog) return;
    if (isTyping) {
      if (finishTyping) finishTyping();
      return;
    }
    if (dialogIndex < dialogQueue.length) {
      const d = dialogQueue[dialogIndex];
      addDialog(d.text, d.type, true);
      dialogIndex++;
    } else {
      document.removeEventListener('click', window._dialogClickHandler);
      document.removeEventListener('keydown', window._dialogKeyHandler);
      if (onDone) onDone();
    }
  }
  window._dialogClickHandler = function(e) {
    if (ignoreNextDialogClick) {
      ignoreNextDialogClick = false;
      return;
    }
    if (!awaitingInput) nextDialog();
  };
  window._dialogKeyHandler = function(e) {
    if (!awaitingInput && (e.key === ' ' || e.key === 'Enter')) nextDialog();
  };
  document.addEventListener('click', window._dialogClickHandler);
  document.addEventListener('keydown', window._dialogKeyHandler);
  nextDialog();
}

// --- Game Flow ---
startBtn.onclick = () => {
  hide(titleScreen);
  show(gameArea);
  ignoreNextDialogClick = true;
  startIntro();
};

function startIntro() {
  // Scene 1: Book under lamp (user's image)
  scene.innerHTML = `
    <div class="pixel-scene">
      <img src="assets/scene1.png" alt="Reading under lamp" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;">
    </div>
  `;
  {
    showDialogQueue([
      { text: '*It was a quiet night. I decided to read my sister\'s favorite book...*', type: 'monologue' },
      { text: '*It has been three years since my sister died...*', type: 'monologue' },
      { text: '*We used to be inseparable as kids, but over time I drifted away—buried in work and excuses.*', type: 'monologue' },
      { text: '*Looking back, she kept reaching out—especially through the books we both loved.*', type: 'monologue' },
      { text: '*Now, every memory weighs heavier. I wish I had just made more time for her...*', type: 'monologue' },
    ], () => {
      // Scene 2: Noises from upstairs (same image)
      scene.innerHTML = `<div class=\"pixel-scene\"><img src=\"assets/scene1.png\" alt=\"Reading under lamp\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\"></div>`;
      showDialogQueue([
        { text: '*A voice called for you from upstairs. What name did it speak?*', type: 'monologue' }
      ], () => {
        askInput('*Enter your name*', (name) => {
          playerName = name;
          showDialogQueue([
            { text: `${playerName}: \"Who said that?\"`, type: 'character' },
            { text: '*You put your book down and decide to check to be sure.*', type: 'monologue' },
          ], goUpstairs);
        });
      });
    });
  };
}

function goUpstairs() {
  scene.innerHTML = `
    <div class="pixel-scene">
      <img src="assets/scene2.png" alt="Upstairs Hallway" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;">
    </div>
  `;
  showDialogQueue([
    { text: '*You decide to walk up the stairs to be sure, each step creaking beneath your feet...*', type: 'monologue' },
    { text: '*There\'s a low buzzing sound coming from the open room at the end of the hallway.*', type: 'monologue' }
  ], showRemotePickup);
}

function showRemotePickup() {
  scene.innerHTML = `<div class=\"pixel-scene\"></div>`;
  showDialogQueue([
    { text: '*You glance inside. A TV flickers in the middle of the room.*', type: 'monologue' },
    { text: '*A remote lies on the ground, faintly illuminated by the screen.*', type: 'monologue' },
    { text: '*You can pick up the remote.*', type: 'monologue' }
  ], () => {
    // Placeholder for when user provides their own remote image
    remotePicked = true;
    showRemoteAtBottom();
    continueStoryAfterRemote();
  });
}

function showRemoteAtBottom() {
  // Remove the remote from the UI for now
  remoteContainer.innerHTML = '';
  hide(remoteContainer);
}

function continueStoryAfterRemote() {
  scene.innerHTML = `<div class=\"pixel-scene\"></div>`;
  showDialogQueue([
    { text: '*You now have the remote. What will you do next?*', type: 'monologue' }
  ]);
}

// --- Initialize ---
hide(gameArea);
hide(settingsModal);
hide(remoteContainer); 