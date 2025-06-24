import { show, hide, getSpeedLabel } from './utils.js';
import { addDialog, showDialogQueue, askInput } from './dialog.js';
import { startIntro, goUpstairs, showRemotePickup, continueStoryAfterRemote } from './scenes.js';

document.addEventListener('DOMContentLoaded', function() {
// --- Game State ---
let playerName = { value: '' };
let remotePicked = false;
let brightness = 1;
let dialogQueue = [];
let dialogIndex = 0;
let awaitingInput = false;
let isTyping = false;
let finishTyping = null;
let canSkipDialog = true;
let ignoreNextDialogClick = false;
let textSpeed = 20;

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
const textSpeedSlider = document.getElementById('text-speed-slider');
const textSpeedLabel = document.getElementById('text-speed-label');

// --- Utility Functions ---
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
function clearDialog() { dialogContainer.innerHTML = ''; }

// --- Settings ---
settingsBtn.onclick = () => { show(settingsModal); };
closeSettingsBtn.onclick = () => { hide(settingsModal); };
if (brightnessSlider) {
  brightnessSlider.oninput = (e) => {
    brightness = e.target.value;
    gameArea.style.filter = `brightness(${brightness})`;
  };
}

if (textSpeedSlider && textSpeedLabel) {
  textSpeedSlider.oninput = (e) => {
    textSpeed = Number(e.target.value);
    textSpeedLabel.textContent = getSpeedLabel(textSpeed);
  };
  // Set initial label
  textSpeedLabel.textContent = getSpeedLabel(textSpeedSlider.value);
}

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
  startIntro(scene, dialogContainer, playerName, () => goUpstairs(scene, dialogContainer, () => showRemotePickup(scene, dialogContainer, onPickup)));
};

function onPickup() {
  remotePicked = true;
  // Тук добави логиката за показване на дистанционното и продължаване на историята
  continueStoryAfterRemote(scene, dialogContainer);
}

// --- Initialize ---
hide(gameArea);
hide(settingsModal);
hide(remoteContainer); 

function addDialog(text, type = 'monologue', showArrow = true, onDoneTyping) {
  clearDialog();
  const bubble = document.createElement('div');
  bubble.className = 'dialog-bubble ' + type;
  dialogContainer.appendChild(bubble);

  let i = 0;
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
      typingTimeout = setTimeout(typeWriter, textSpeed);
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

}); // End DOMContentLoaded 