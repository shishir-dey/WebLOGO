// Parse the entire command before drawing, so a typo cannot leave a partial shape.
export function parse(source) {
  const tokens = source.toLowerCase().match(/\[|\]|[^\s\[\]]+/g) || [];
  let cursor = 0;
  let count = 0;
  function block(nested = false, depth = 0) {
    if (depth > 20) throw new Error('Too many nested repeats.');
    const result = [];
    while (cursor < tokens.length) {
      const name = tokens[cursor++];
      if (name === ']') {
        if (!nested) throw new Error('Unexpected closing bracket.');
        return result;
      }
      if (name === 'repeat') {
        const repetitions = Number(tokens[cursor++]);
        if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 1000) throw new Error('Repeat needs a whole number from 1 to 1000.');
        if (tokens[cursor++] !== '[') throw new Error('Use repeat 4 [fd 100 rt 90].');
        const body = block(true, depth + 1);
        if (result.length + body.length * repetitions > 5000) throw new Error('Try fewer than 5,000 drawing steps.');
        for (let i = 0; i < repetitions; i++) result.push(...body);
      } else if (['fd', 'forward', 'bk', 'back', 'rt', 'right', 'lt', 'left'].includes(name)) {
        const amount = Number(tokens[cursor++]);
        if (!Number.isFinite(amount) || Math.abs(amount) > 10000) throw new Error(`${name} needs a number between -10000 and 10000.`);
        result.push([name, amount]);
      } else if (['setxy', 'arc'].includes(name)) {
        const first = Number(tokens[cursor++]);
        const second = Number(tokens[cursor++]);
        if (![first, second].every(value => Number.isFinite(value) && Math.abs(value) <= 10000)) throw new Error(`${name} needs two numbers between -10000 and 10000.`);
        if (name === 'arc' && second < 0) throw new Error('Arc radius must be zero or greater.');
        result.push([name, first, second]);
      } else if (['ht', 'hideturtle', 'st', 'showturtle', 'pu', 'penup', 'pd', 'pendown', 'cs', 'clearscreen', 'home'].includes(name)) {
        result.push([name]);
      } else throw new Error(`Unknown command “${name}”. Try fd 100 or rt 90.`);
      if (++count > 5000 || result.length > 5000) throw new Error('Try fewer than 5,000 drawing steps.');
    }
    if (nested) throw new Error('Add a closing ] to your repeat.');
    return result;
  }
  return block();
}

// LOGO coordinates: origin at centre, positive Y up, clockwise headings from north.
export class Turtle {
  constructor(draw = () => {}, clear = () => {}) {
    this.draw = draw;
    this.clear = clear;
    this.reset();
  }
  reset() {
    this.x = 0; this.y = 0; this.angle = 0;
    this.pen = true; this.visible = true;
    this.clear();
  }
  setPosition(x, y) {
    if (this.pen) this.draw(`M ${500 + this.x} ${400 - this.y} L ${500 + x} ${400 - y}`);
    this.x = x; this.y = y;
  }
  move(distance) {
    const radians = this.angle * Math.PI / 180;
    this.setPosition(this.x + Math.sin(radians) * distance, this.y + Math.cos(radians) * distance);
  }
  arc(sweep, radius) {
    if (!this.pen || !sweep || !radius) return;
    const point = heading => {
      const radians = heading * Math.PI / 180;
      return `${500 + this.x + Math.sin(radians) * radius} ${400 - this.y - Math.cos(radians) * radius}`;
    };
    let path = `M ${point(this.angle)}`;
    // Split at 180 degrees so full circles and multi-turn arcs remain valid SVG.
    const segments = Math.ceil(Math.abs(sweep) / 180);
    for (let i = 1; i <= segments; i++) {
      path += ` A ${radius} ${radius} 0 0 ${sweep > 0 ? 1 : 0} ${point(this.angle + sweep * i / segments)}`;
    }
    this.draw(path);
  }
  execute([name, a, b]) {
    switch (name) {
      case 'fd': case 'forward': this.move(a); break;
      case 'bk': case 'back': this.move(-a); break;
      case 'rt': case 'right': this.angle = (this.angle + a) % 360; break;
      case 'lt': case 'left': this.angle = (this.angle - a) % 360; break;
      case 'pu': case 'penup': this.pen = false; break;
      case 'pd': case 'pendown': this.pen = true; break;
      case 'ht': case 'hideturtle': this.visible = false; break;
      case 'st': case 'showturtle': this.visible = true; break;
      case 'cs': case 'clearscreen': this.reset(); break;
      case 'home': this.setPosition(0, 0); this.angle = 0; break;
      case 'setxy': this.setPosition(a, b); break;
      case 'arc': this.arc(a, b); break;
    }
  }
}
