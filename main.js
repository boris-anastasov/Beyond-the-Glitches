import { show, hide, getSpeedLabel } from './utils.js';
import { showDialogQueue, askInput } from './dialog.js';
import { startIntro, goUpstairs, showRemotePickup, continueStoryAfterRemote } from './scenes.js';
import { showRemoteAtWindow } from './remote.js';

let playerName = '';
let remotePicked = false;
let textSpeed = 20;

const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const gameArea = document.getElementById('game-area');
const scene = document.getElementById('scene');
const dialogContainer = document.getElementById('dialog-container');
const textSpeedSlider = document.getElementById('text-speed-slider');
const textSpeedLabel = document.getElementById('text-speed-label');

settingsBtn.onclick = () => { show(settingsModal); };
closeSettingsBtn.onclick = () => { hide(settingsModal); };

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
        // При клик на power бутона - влизане в TV света
        scene.innerHTML = `
          <div class=\"pixel-scene\">
            <img src=\"assets/scene4.png\" alt=\"Strange World\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\">
          </div>
        `;
        showDialogQueue(dialogContainer, [
          { text: '*You feel a strange force pulling you in...*', type: 'monologue' },
          { text: '*You are now inside the TV, in a bizarre new world!*', type: 'monologue' }
        ], null, textSpeed);
      });
      continueStoryAfterRemote(scene, dialogContainer);
    });
  }));
};

// Скрий всичко освен началния екран
hide(gameArea);
hide(settingsModal);
const remoteWindow = document.getElementById('remote-window');
if (remoteWindow) remoteWindow.classList.add('hidden'); 