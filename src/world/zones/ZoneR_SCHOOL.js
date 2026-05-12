// R_SCHOOL — Escuela abandonada de Miraloma (mundo real)
// 22 × 18 tiles = 352 × 288 px
// El edificio ocupa cols 2-19, filas 3-13. Acceso desde el sur (gap en fila 13).
// Salida sur → R_HUB.

export const ZoneR_SCHOOL = {
  id:       'R_SCHOOL',
  music:    null,
  tileSize: 16,
  solidChars: '#b',

  // '#' borde  '.' suelo  'b' ladrillo (sólido)  'd' salida
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
    '#': '#2D2D3D',
    'b': '#5A4A3A',   // ladrillo de la escuela
    '.': '#8A8A7A',   // suelo de patio/interior
    'd': '#8A8A7A',
  },

  spawns: {
    default:  { x: 11 * 16, y: 14 * 16 },
    from_hub: { x: 11 * 16, y: 14 * 16 },
    from_void:{ x: 11 * 16, y:  7 * 16 },
  },

  exits: [
    {
      id:          'to_hub',
      x:   10 * 16, y: 16 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_school',
    },
  ],

  npcs: [],

  rifts: [
    { id: 'G_school_piano', x: 10 * 16, y: 5 * 16, size: 'major', emotion: 'fear' },
  ],

  echoes: [],
  items:  [],

  voidZoneId: 'V_SCHOOL',
  realZoneId: null,
  dimension:  'real',
};
