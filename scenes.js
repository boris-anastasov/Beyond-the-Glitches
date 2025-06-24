import { showDialogQueue, askInput } from './dialog.js';

export function startIntro(scene, dialogContainer, playerName, goUpstairs) {
  scene.innerHTML = `
    <div class="pixel-scene">
      <img src="assets/scene1.png" alt="Reading under lamp" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;">
    </div>
  `;
  showDialogQueue(dialogContainer, [
    { text: '*It was a quiet night. I decided to read my sister\'s favorite book...*', type: 'monologue' },
    { text: '*It has been three years since she died...*', type: 'monologue' },
    { text: '*We used to be inseparable as kids, but over time I drifted away—buried in work and excuses.*', type: 'monologue' },
    { text: '*Looking back, she kept reaching out—especially through the books we both loved.*', type: 'monologue' },
    { text: '*Now, every memory weighs heavier. I wish I had just made more time for her...*', type: 'monologue' },
  ], () => {
    scene.innerHTML = `<div class=\"pixel-scene\"><img src=\"assets/scene1.png\" alt=\"Reading under lamp\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\"></div>`;
    showDialogQueue(dialogContainer, [
      { text: '*A voice called for you from upstairs. What name did it speak?*', type: 'monologue' }
    ], () => {
      askInput(dialogContainer, '*Enter your name*', (name) => {
        playerName.value = name;
        showDialogQueue(dialogContainer, [
          { text: `${name}: \"Who said that?\"`, type: 'character' },
          { text: '*You put your book down and decide to check to be sure.*', type: 'monologue' },
        ], goUpstairs);
      });
    });
  });
}

export function goUpstairs(scene, dialogContainer, showRemotePickup) {
  scene.innerHTML = `
    <div class="pixel-scene">
      <img src="assets/scene2.png" alt="Upstairs Hallway" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;">
    </div>
  `;
  showDialogQueue(dialogContainer, [
    { text: '*You decide to walk up the stairs to be sure, each step creaking beneath your feet...*', type: 'monologue' },
    { text: '*There\'s a low buzzing sound coming from the open room at the end of the hallway.*', type: 'monologue' }
  ], showRemotePickup);
}

export function showRemotePickup(scene, dialogContainer, onPickup) {
  scene.innerHTML = `
    <div class=\"pixel-scene\" style=\"position:relative;width:100%;height:100%;\">
      <img src=\"assets/scene3.png\" alt=\"Room\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\">
      <div id=\"glow-circle\" style=\"display:none;position:absolute; left:18%; top:38%; width:48px; height:48px; pointer-events:auto; cursor:pointer; z-index:2;\"></div>
    </div>
  `;
  showDialogQueue(dialogContainer, [
    { text: '*You glance inside. A TV flickers in the middle of the room.*', type: 'monologue' },
    { text: '*A remote lies on the ground, faintly illuminated by the screen.*', type: 'monologue' },
    { text: '*You can pick up the remote.*', type: 'monologue' }
  ], () => {
    const glowCircle = document.getElementById('glow-circle');
    if (glowCircle) {
      glowCircle.style.display = 'block';
      glowCircle.className = 'glow-circle';
      glowCircle.addEventListener('click', onPickup, { once: true });
    }
  });
}

export function continueStoryAfterRemote(scene, dialogContainer) {
  scene.innerHTML = `
    <div class=\"pixel-scene\">\n      <img src=\"assets/scene3,5.png\" alt=\"Room after picking remote\" style=\"width:100%;height:100%;object-fit:cover;image-rendering:pixelated;\">\n    </div>
  `;
  showDialogQueue(dialogContainer, [
    { text: '*You now have the remote. What will you do next?*', type: 'monologue' }
  ]);
} 