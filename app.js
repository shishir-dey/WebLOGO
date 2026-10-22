import { parse, Turtle } from './logo.js';

const drawing = document.querySelector('#drawing');
const turtle = document.querySelector('#turtle');
const history = document.querySelector('#history');
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
  const entry = document.createElement('div');
  entry.className = 'entry';
  const command = document.createElement('div');
  command.className = 'entry-command';
  command.textContent = source;
  const result = document.createElement('div');
  result.className = 'entry-result';
  try {
    for (const command of parse(source)) model.execute(command);
    updateTurtle();
  } catch (error) {
    result.textContent = error.message;
    result.classList.add('entry-error');
  }
  entry.append(command);
  if (result.textContent) entry.append(result);
  history.append(entry);
  const consoleViewport = document.querySelector('.console-scroll');
  consoleViewport.scrollTop = consoleViewport.scrollHeight;
  commands.push(source);
  historyIndex = commands.length;
  input.value = '';
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
