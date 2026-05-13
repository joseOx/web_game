// R_LIBRARY — Biblioteca pública de Miraloma
// 20 × 14 tiles = 320 × 224 px
// La Sra. Ponce lleva días reportando libros con páginas en blanco. Nadie la cree.

export const ZoneR_LIBRARY = {
  id:       'R_LIBRARY',
  music:    null,
  tileSize: 16,
  solidChars: '#b',   // '#' pared  'b' estantería (sólida)

  // '#' pared  '.' suelo  'b' estantería (sólida)  't' mesa  'd' salida
  grid: [
    '####################',
    '#..................#',
    '#.bb..bb..bb..bb..#',
    '#.bb..bb..bb..bb..#',
    '#..................#',
    '#.bb..bb..bb..bb..#',
    '#.bb..bb..bb..bb..#',
    '#..................#',
    '#.bb..bb..bb..bb..#',
    '#.bb..bb..bb..bb..#',
    '#..................#',
    '#..................#',
    '#.......d.d........#',
    '####################',
  ],

  palette: {
    '#': '#2A1A0A',   // pared de madera oscura
    '.': '#C8A878',   // suelo de madera clara
    'b': '#5C3010',   // estantería
    't': '#4A2808',   // mesa
    'd': '#C8A878',   // salida
  },

  spawns: {
    default:  { x: 10 * 16, y: 11 * 16 },
    from_hub: { x: 10 * 16, y: 11 * 16 },
  },

  exits: [
    {
      id:          'to_hub',
      x:    7 * 16, y: 12 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_library',
    },
  ],

  npcs: [
    {
      id:         'ponce',
      x:          14 * 16,
      y:           4 * 16,
      color:      '#B0909A',
      dialogueId: 'ponce_route',
      label:      'Sra. Ponce',
    },
  ],

  rifts: [
    // La grieta de historia no es visible en el mundo real
    { id: 'G_library_history', x: 8 * 16, y: 2 * 16, size: 'major', emotion: 'shame', visible: false },
  ],

  echoes:  [],
  objects: [],

  voidZoneId: 'V_LIBRARY',
  dimension:  'real',
};
