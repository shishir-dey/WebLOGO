import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, Turtle } from '../logo.js';
function setup() {
  const paths = [];
  const turtle = new Turtle(path => paths.push(path), () => { paths.length = 0; });
  const run = source => parse(source).forEach(command => turtle.execute(command));
  return { paths, turtle, run };
}
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≠ ${expected}`);
test('forward, backward and both turns follow LOGO coordinates', () => {
  const { turtle: t, paths, run } = setup();
  run('FD 100 RT 90 FD 50 LT 90 BK 25');
  near(t.x, 50); near(t.y, 75); near(t.angle, 0); assert.equal(paths.length, 3);
});
test('pen state, absolute coordinates, home and visibility', () => {
  const { turtle: t, paths, run } = setup();
  run('PU SETXY 20 20 HT');
  assert.equal(t.x, 20); assert.equal(t.y, 20); assert.equal(t.visible, false); assert.equal(paths.length, 0);
  run('PD SETXY -20 -20 ST RT 90 HOME');
  assert.equal(paths.length, 2); assert.equal(t.visible, true); near(t.x, 0); near(t.y, 0); near(t.angle, 0);
  run('HT PU CS');
  assert.equal(paths.length, 0); assert.equal(t.visible, true); assert.equal(t.pen, true);
});
test('nested repeats execute and a square returns home', () => {
  const { turtle: t, paths, run } = setup();
  run('REPEAT 2 [REPEAT 2 [FD 100 RT 90]]');
  near(t.x, 0); near(t.y, 0); assert.equal(paths.length, 4);
});
test('arcs use SVG curves without moving the turtle', () => {
  const { turtle: t, paths, run } = setup();
  run('ARC 90 50');
  assert.equal(paths[0], 'M 500 350 A 50 50 0 0 1 550 400');
  near(t.x, 0); near(t.y, 0); near(t.angle, 0);
  run('ARC 360 50 ARC -90 50');
  assert.equal((paths[1].match(/ A /g) || []).length, 2);
  assert.match(paths[2], /0 0 0/);
  run('PU ARC 90 50'); assert.equal(paths.length, 3);
});
test('invalid commands cannot partially draw', () => {
  const { paths, run } = setup();
  for (const source of ['FD 100 SETXY 20', 'ARC 90 -50', 'FD 100 unknown', 'REPEAT 2 [FD 10', 'REPEAT 1000 [REPEAT 1000 [FD 1]]', 'FD NaN', 'SETXY 1 Infinity', ']']) {
    assert.throws(() => run(source)); assert.equal(paths.length, 0);
  }
});
