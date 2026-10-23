// Return the edited prompt and caret without changing text outside the selection.
export function editCommand(value, start, end, { command, key, action }) {
  start ??= value.length;
  end ??= start;
  if (action === 'backspace') {
    if (start === end) start = Math.max(0, start - 1);
    return { value: value.slice(0, start) + value.slice(end), cursor: start };
  }
  let inserted = key ?? '';
  if (command) {
    const before = value.slice(0, start);
    inserted = `${before && !/[\s[]$/.test(before) ? ' ' : ''}${command} `;
  }
  return { value: value.slice(0, start) + inserted + value.slice(end), cursor: start + inserted.length };
}
