import { show, hide, getSpeedLabel } from './utils.js';
import { showDialogQueue, askInput } from './dialog.js';
import { startIntro, goUpstairs, showRemotePickup, continueStoryAfterRemote } from './scenes.js';
import { showRemoteAtWindow } from './remote.js';

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
let textSpeed = 20;

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
  textSpeedLabel.textContent = getSpeedLabel(textSpeedSlider.value);
}

startBtn.onclick = () => {
  hide(titleScreen);
  show(gameArea);
  startIntro(scene, dialogContainer, { value: playerName }, () => goUpstairs(scene, dialogContainer, () => {
    showRemotePickup(scene, dialogContainer, () => {
      remotePicked = true;
      showRemoteAtWindow(() => {
        scene.innerHTML = `
          <div class=\"pixel-scene\">
            <img src=\"assets/scene4.png\" alt=\"Strange World\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\">
          </div>
        `;
        showDialogQueue(dialogContainer, [
          { text: '*You are now inside the TV, in a unknown world!*', type: 'monologue' }
        ], null, textSpeed);
      });
      continueStoryAfterRemote(scene, dialogContainer);
    });
  }));
};

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
  setTimeout(() => { canSkipDialog = true; }, 200);
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

const remoteWindow = document.getElementById('remote-window');
if (remoteWindow) remoteWindow.classList.add('hidden'); 