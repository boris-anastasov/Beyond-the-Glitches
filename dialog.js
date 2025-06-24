import { show, hide } from './utils.js';
import { clearDialog } from './utils.js';

export function addDialog(dialogContainer, text, type = 'monologue', showArrow = true, onDoneTyping, textSpeed = 20) {
  clearDialog(dialogContainer);
  const bubble = document.createElement('div');
  bubble.className = 'dialog-bubble ' + type;
  dialogContainer.appendChild(bubble);

  let i = 0;
  let isTyping = true;
  let typingTimeout = null;

  function finishTyping() {
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
  }

  function typeWriter() {
    if (!isTyping) return;
    if (i <= text.length) {
      bubble.innerText = text.slice(0, i);
      i++;
      typingTimeout = setTimeout(typeWriter, textSpeed);
    } else {
      finishTyping();
    }
  }
  typeWriter();
  return finishTyping;
}

export function showDialogQueue(dialogContainer, queue, onDone, textSpeed = 20) {
  let dialogIndex = 0;
  let finishTyping = null;
  function nextDialog() {
    if (finishTyping && finishTyping.isTyping) {
      finishTyping();
      return;
    }
    if (dialogIndex < queue.length) {
      const d = queue[dialogIndex];
      finishTyping = addDialog(dialogContainer, d.text, d.type, true, null, textSpeed);
      dialogIndex++;
    } else {
      if (onDone) onDone();
    }
  }
  nextDialog();
  dialogContainer.onclick = nextDialog;
}

export function askInput(dialogContainer, prompt, callback) {
  clearDialog(dialogContainer);
  addDialog(dialogContainer, prompt, 'monologue', false);
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 16;
  input.placeholder = 'Enter name...';
  input.style.margin = '1rem 0';
  input.style.fontSize = '1.1rem';
  input.style.padding = '0.5rem';
  dialogContainer.appendChild(input);
  input.focus();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      callback(input.value.trim());
    }
  });
} 