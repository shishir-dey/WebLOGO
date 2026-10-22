# WebLOGO

A minimal SVG turtle graphics playground with an Apple system font, a light-yellow canvas, and a black command prompt. Desktop uses a 70/30 split; mobile stacks the panels. Only panel content scrolls.

## Run and package

- `npm install`
- `npm run dev` — local development with Vite
- `npm run build` — production site in `dist/`
- `npm run preview` — preview the production build
- `npm test` — command-engine tests

Deploy the contents of `dist/` to a static web host.

## Commands

Open the ⓘ button for the command reference. Commands are case-insensitive, support signed decimals, and can be combined on one line. Press Enter to run; use Up/Down to recall commands.

Supported: FD, BK, RT, LT, PU, PD, CS, HT, ST, REPEAT, HOME, SETXY, ARC.

Coordinates start at (0, 0) in the centre; positive X points right and positive Y points up. HOME moves to the centre and faces north. HOME and SETXY draw when the pen is down. ARC draws clockwise around the current turtle position from its heading without moving or turning the turtle; negative angles draw counterclockwise. Pen-up suppresses drawing. CS resets drawing, position, heading, visibility, and pen state.

Examples:

```text
REPEAT 4 [FD 100 RT 90]
PU SETXY 20 20 PD ARC 90 50
REPEAT 3 [FD 100 RT 120]
```

The full line is validated before execution. Commands are limited to 5,000 expanded steps per submission, 20 nested repeat levels, and numeric magnitudes of 10,000.
