import { parse, Turtle } from './logo.js';
import { editCommand } from './keyboard.js';

const drawing = document.querySelector('#drawing');
const turtle = document.querySelector('#turtle');
const commandError = document.querySelector('#command-error');
const input = document.querySelector('#command');
const canvasViewport = document.querySelector('.canvas-scroll');
const canvas = document.querySelector('#canvas');
const canvasBackground = canvas.querySelector('rect');
const model = new Turtle(path => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  element.setAttribute('d', path);
  drawing.append(element);
}, () => drawing.replaceChildren());
const commands = [];
let historyIndex = 0;
function updateTurtle() {
  turtle.setAttribute('transform', `translate(${500 + model.x} ${400 - model.y}) rotate(${model.angle})`);
  turtle.style.display = model.visible ? '' : 'none';
}
function centerDrawing() {
  const bounds = drawing.childElementCount ? drawing.getBBox() : {
    x: 500 + model.x, y: 400 - model.y, width: 0, height: 0,
  };
  const width = Math.max(1000, canvasViewport.clientWidth, bounds.width + 80);
  const height = Math.max(800, canvasViewport.clientHeight, bounds.height + 80);
  const left = bounds.x + bounds.width / 2 - width / 2;
  const top = bounds.y + bounds.height / 2 - height / 2;
  // Pan the viewport, preserving turtle coordinates and one pixel per LOGO step.
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  canvas.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
  canvasBackground.setAttribute('x', left);
  canvasBackground.setAttribute('y', top);
  canvasViewport.scrollLeft = (canvasViewport.scrollWidth - canvasViewport.clientWidth) / 2;
  canvasViewport.scrollTop = (canvasViewport.scrollHeight - canvasViewport.clientHeight) / 2;
}
function reset() { model.reset(); updateTurtle(); centerDrawing(); }
function run(source) {
  if (!source.trim()) return;
  commandError.hidden = true;
  commandError.textContent = '';
  try {
    for (const command of parse(source)) model.execute(command);
    updateTurtle();
    commands.push(source);
    historyIndex = commands.length;
    input.value = '';
  } catch (error) {
    commandError.textContent = error.message;
    commandError.hidden = false;
  }
  centerDrawing();
}
document.querySelector('#command-form').addEventListener('submit', event => { event.preventDefault(); run(input.value); });
document.querySelector('#reset').addEventListener('click', reset);
input.addEventListener('keydown', event => {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  event.preventDefault();
  historyIndex = Math.max(0, Math.min(commands.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
  input.value = commands[historyIndex] || '';
});
updateTurtle();
centerDrawing();
new ResizeObserver(centerDrawing).observe(canvasViewport);

const helpDialog = document.querySelector('#help-dialog');
document.querySelector('#help-button').addEventListener('click', () => helpDialog.showModal());
document.querySelector('#help-close').addEventListener('click', () => helpDialog.close());
helpDialog.addEventListener('click', event => {
  if (event.target !== helpDialog) return;
  const rect = helpDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) helpDialog.close();
});

// Read-only touch input prevents the system keyboard; desktop stays editable.
const touchPrompt = window.matchMedia('(pointer: coarse)');
function updateInputMode() { input.readOnly = touchPrompt.matches; }
updateInputMode();
touchPrompt.addEventListener('change', updateInputMode);
const keyboard = document.querySelector('.keyboard');
keyboard.addEventListener('pointerdown', event => {
  // Keep the prompt's cursor/selection when clicking a key with a mouse.
  if (event.pointerType === 'mouse' && event.target.closest('button')) event.preventDefault();
});
keyboard.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.type !== 'submit') {
    const edit = editCommand(input.value, input.selectionStart, input.selectionEnd, {
      command: button.dataset.command, key: button.dataset.key, action: button.dataset.action,
    });
    input.value = edit.value;
    input.setSelectionRange(edit.cursor, edit.cursor);
    commandError.hidden = true;
  }
  input.focus({ preventScroll: true });
});

const gridButton = document.querySelector('#grid-button');
gridButton.addEventListener('click', () => {
  const enabled = gridButton.getAttribute('aria-pressed') !== 'true';
  gridButton.setAttribute('aria-pressed', String(enabled));
  canvasBackground.setAttribute('fill', enabled ? 'url(#grid)' : 'none');
});
