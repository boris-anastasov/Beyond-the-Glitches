// --- Game State ---
let playerName = '';
let remotePicked = false;
let brightness = 1;
let dialogQueue = [];
let dialogIndex = 0;
let awaitingInput = false;

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
function addDialog(text, type = 'monologue', showArrow = true) {
  clearDialog();
  const bubble = document.createElement('div');
  bubble.className = 'dialog-bubble ' + type;
  bubble.innerText = text;
  if (showArrow) {
    const arrow = document.createElement('span');
    arrow.innerHTML = ' ▼';
    arrow.style.fontSize = '1.2em';
    arrow.style.marginLeft = '0.5em';
    bubble.appendChild(arrow);
  }
  dialogContainer.appendChild(bubble);
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
  // Remove previous listeners to avoid duplicates
  document.removeEventListener('click', window._dialogClickHandler);
  document.removeEventListener('keydown', window._dialogKeyHandler);
  function nextDialog() {
    if (dialogIndex < dialogQueue.length) {
      const d = dialogQueue[dialogIndex];
      addDialog(d.text, d.type);
      dialogIndex++;
    } else {
      document.removeEventListener('click', window._dialogClickHandler);
      document.removeEventListener('keydown', window._dialogKeyHandler);
      if (onDone) onDone();
    }
  }
  window._dialogClickHandler = function(e) {
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
  startIntro();
};

function startIntro() {
  // Scene 1: Book under lamp (user's image)
  scene.innerHTML = `
    <div class="pixel-scene">
      <img src="assets/scene1.png" alt="Reading under lamp" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;">
    </div>
  `;
  showDialogQueue([
    { text: '*It was a quiet night. I was reading my favorite book...*', type: 'monologue' }
  ], () => {
    // Scene 2: Looking out the window (same image)
    scene.innerHTML = `
      <div class="pixel-scene">
        <img src="assets/scene1.png" alt="Reading under lamp" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;">
      </div>
    `;
    showDialogQueue([
      { text: '*It has been four years since my sister died...*', type: 'monologue' },
      { text: '*We were so close when were little, I started drifting away from her ten years before she passed, buried in work...*', type: 'monologue' },
      { text: '*When I think back, she was always trying to connect with me, especially through our shared love of books.*', type: 'monologue' },
      { text: '*Now, every time I think back, the regret feels heavier. I wish I had tried harder...*', type: 'monologue' },
    ], () => {
      // Scene 3: Noises from upstairs (same image)
      scene.innerHTML = `<div class=\"pixel-scene\"><img src=\"assets/scene1.png\" alt=\"Reading under lamp\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\"></div>`;
      showDialogQueue([
        { text: '*What is your name?*', type: 'monologue' }
      ], () => {
        askInput('*Enter your name*', (name) => {
          playerName = name;
          showDialogQueue([
            { text: 'You started hearing strange noises coming from upstairs...', type: 'monologue' },
            { text: '*You put your book down and grab the nearest thing for defense.*', type: 'monologue' },
            { text: `${playerName}: \"Better check what that is...\"`, type: 'character' }
          ], goUpstairs);
        });
      });
    });
  });
}

function goUpstairs() {
  scene.innerHTML = '<div style="width:100%;height:100%;background:linear-gradient(to top,#222 60%,#444 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;">Upstairs Hallway</div>';
  showDialogQueue([
    { text: '*You slowly walk up the stairs, each step creaking under your feet...*', type: 'monologue' },
    { text: '*You see an open door. Inside, a TV is showing static. A remote lies on the ground.*', type: 'monologue' },
    { text: '*You can pick up the remote.*', type: 'monologue' }
  ], showRemotePickup);
}

function showRemotePickup() {
  scene.innerHTML = `<div class=\"pixel-scene\"></div>`;
  showDialogQueue([
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