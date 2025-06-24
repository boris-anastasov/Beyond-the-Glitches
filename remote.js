export function showRemoteAtWindow(onPowerClick) {
  const remoteWindow = document.getElementById('remote-window');
  if (remoteWindow) {
    remoteWindow.classList.remove('hidden');
    remoteWindow.innerHTML = `
      <div style="position:relative;width:220px;height:440px;">
        <img id="side-remote" src="assets/TV_Remote.png" alt="TV Remote" style="width:220px;height:440px;image-rendering:pixelated;">
        <div id="power-btn-area" style="position:absolute;left:33px;top:33px;width:60px;height:60px;cursor:pointer;z-index:2;"></div>
      </div>
    `;
    const powerBtn = document.getElementById('power-btn-area');
    if (powerBtn) {
      powerBtn.addEventListener('click', () => {
        if (onPowerClick) onPowerClick();
      }, { once: true });
    }
  }
} 