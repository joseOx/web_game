// V_SCHOOL — Escuela abandonada (dimensión Vacío)
// 22 × 18 tiles — espejo de R_SCHOOL
// G_school_piano rift, Vera EchoBound, 4 fragmentos de partitura.

export const ZoneV_SCHOOL = {
  id:       'V_SCHOOL',
  music:    null,
  tileSize: 16,
  solidChars: '#b',

  // Misma topología que R_SCHOOL; paleta void oscura.
  grid: [
    '######################',
    '######################',
    '#....................#',
    '#.bbbbbbbbbbbbbbbbbb.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.b................b.#',
    '#.bbbbbbbb..bbbbbbbb.#',
    '#....................#',
    '#....................#',
    '#..........d.........#',
    '######################',
  ],

  palette: {
    '#': '#0D0B1A',
    'b': '#1E1530',
    '.': '#141020',
    'd': '#141020',
  },

  spawns: {
    default:   { x: 11 * 16, y: 14 * 16 },
    from_real: { x: 11 * 16, y:  7 * 16 },
  },

  exits: [
    {
      id:          'to_school_real',
      x:   10 * 16, y: 16 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_SCHOOL',
      targetSpawn: 'from_void',
      switchDim:   'real',
    },
  ],

  npcs: [],

  rifts: [
    { id: 'G_school_piano', x: 10 * 16, y: 4 * 16, size: 'major', emotion: 'fear' },
  ],

  echoes: [
    {
      type:       'bound',
      id:         'echo_vera',
      x:          10 * 16,
      y:           7 * 16,
      emotion:    'fear',
      dialogueId: 'vera_echo_loop',
      doneFlag:   'mission_melody_done',
    },
  ],

  items: [
    { id: 'I_partitura_1', x: 4 * 16 + 4, y:  5 * 16 + 4, width: 8, height: 8, pickFlag: 'partitura_1_found' },
    { id: 'I_partitura_2', x: 16 * 16 + 4, y: 5 * 16 + 4, width: 8, height: 8, pickFlag: 'partitura_2_found' },
    { id: 'I_partitura_3', x: 4 * 16 + 4, y: 10 * 16 + 4, width: 8, height: 8, pickFlag: 'partitura_3_found' },
    { id: 'I_partitura_4', x: 16 * 16 + 4, y: 10 * 16 + 4, width: 8, height: 8, pickFlag: 'partitura_4_found' },
  ],

  voidZoneId: null,
  realZoneId: 'R_SCHOOL',
  dimension:  'void',
};
