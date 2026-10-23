import test from 'node:test';
import assert from 'node:assert/strict';
import { editCommand } from '../keyboard.js';
test('command and number keys form a runnable line', () => {
  let value = '', cursor = 0;
  for (const key of [{command:'FD'},{key:'1'},{key:'0'},{key:'0'},{command:'RT'},{key:'9'},{key:'0'}]) {
    ({value, cursor} = editCommand(value, cursor, cursor, key));
  }
  assert.equal(value, 'FD 100 RT 90');
});
test('editing replaces selections and respects the caret', () => {
  assert.deepEqual(editCommand('FD 100', 3, 6, {key:'5'}), {value:'FD 5',cursor:4});
  assert.deepEqual(editCommand('FD 100', 4, 4, {action:'backspace'}), {value:'FD 00',cursor:3});
  assert.deepEqual(editCommand('FD 100', 3, 6, {action:'backspace'}), {value:'FD ',cursor:3});
  assert.deepEqual(editCommand('', 0, 0, {action:'backspace'}), {value:'',cursor:0});
});
test('repeat syntax, signed decimals, and spaces are available', () => {
  let value = '', cursor = 0;
  for (const key of [{command:'REPEAT'},{key:'3'},{key:' '},{key:'['},{command:'FD'},{key:'-'},{key:'1'},{key:'.'},{key:'5'},{key:']'}]) {
    ({value, cursor} = editCommand(value, cursor, cursor, key));
  }
  assert.equal(value, 'REPEAT 3 [FD -1.5]');
});
