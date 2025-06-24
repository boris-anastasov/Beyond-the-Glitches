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
        // Първо показваме сцената пред телевизора в другия свят
        scene.innerHTML = `
          <div class=\"pixel-scene\">
            <img src=\"assets/scene4.png\" alt=\"Strange World\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\">
          </div>
        `;
        showDialogQueue(dialogContainer, [
          { text: '*You are now inside the TV, in a unknown new world!*', type: 'monologue' },
          { text: '*Press any key or click to continue...*', type: 'monologue' }
        ], () => {
          function proceedToTopDown() {
            window.removeEventListener('keydown', proceedToTopDown);
            window.removeEventListener('click', proceedToTopDown);
            // Top-down view с бутони за Save/Load
            scene.innerHTML = `
              <div class=\"pixel-scene\" id=\"topdown-scene\" style=\"width:100%;height:100%;position:relative;background:#222;overflow:hidden;\">
                <div id=\"player\" style=\"position:absolute;width:48px;height:48px;left:476px;top:326px;\"></div>
                <button id=\"save-btn\" style=\"position:absolute;top:10px;right:120px;z-index:20;\">Save</button>
                <button id=\"load-btn\" style=\"position:absolute;top:10px;right:30px;z-index:20;\">Load</button>
              </div>
            `;
            const player = document.getElementById('player');
            let x = 476, y = 326, speed = 4;
            const bounds = { minX: 0, minY: 0, maxX: 1000-48, maxY: 700-48 };
            let keys = { up: false, down: false, left: false, right: false };

            // --- SAVE/LOAD функции ---
            function saveProgress() {
              localStorage.setItem('btg_save', JSON.stringify({ x, y, unlockTVWorld: true }));
            }
            function loadProgress() {
              const data = localStorage.getItem('btg_save');
              if (data) {
                const save = JSON.parse(data);
                if (typeof save.x === 'number' && typeof save.y === 'number') {
                  x = save.x;
                  y = save.y;
                  player.style.left = x + 'px';
                  player.style.top = y + 'px';
                }
              }
            }
            document.getElementById('save-btn').onclick = saveProgress;
            document.getElementById('load-btn').onclick = loadProgress;
            // --- Край на SAVE/LOAD ---

            function updatePlayer() {
              let dx = 0, dy = 0;
              if (keys.up) dy -= speed;
              if (keys.down) dy += speed;
              if (keys.left) dx -= speed;
              if (keys.right) dx += speed;
              if (dx !== 0 || dy !== 0) {
                x = Math.max(bounds.minX, Math.min(bounds.maxX, x + dx));
                y = Math.max(bounds.minY, Math.min(bounds.maxY, y + dy));
                player.style.left = x + 'px';
                player.style.top = y + 'px';
                saveProgress(); // Автоматично записване при движение
              }
              requestAnimationFrame(updatePlayer);
            }
            function handleKeyDown(e) {
              if (document.activeElement.tagName === 'INPUT') return;
              if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
              if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
              if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
              if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
            }
            function handleKeyUp(e) {
              if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false;
              if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;
              if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
              if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
            }
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            // Зареждаме прогреса ако има
            loadProgress();
            updatePlayer();
          }
          window.addEventListener('keydown', proceedToTopDown, { once: true });
          window.addEventListener('click', proceedToTopDown, { once: true });
        }, textSpeed);
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