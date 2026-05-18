// V_LIBRARY — Biblioteca en el Vacío
// 20 × 14 tiles = 320 × 224 px
// El archivista destruyó registros de 1974. Los fragmentos están dispersos aquí,
// esperando ser reconstruidos. Su culpa mantiene abierta la grieta.

export const ZoneV_LIBRARY = {
  id:       'V_LIBRARY',
  music:    null,
  tileSize: 16,
  solidChars: '#b',

  // mismo layout que R_LIBRARY pero con paleta void
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
    '#': '#120A04',   // pared void
    '.': '#2A1E0E',   // suelo void (madera oscurísima)
    'b': '#1E0A00',   // estantería void
    't': '#160800',   // mesa void
    'd': '#2A1E0E',   // salida
  },

  spawns: {
    default:   { x: 10 * 16, y: 11 * 16 },
    from_real: { x: 10 * 16, y: 11 * 16 },
  },

  exits: [
    {
      id:          'to_library',
      x:    7 * 16, y: 12 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_LIBRARY',
      targetSpawn: 'from_hub',
      switchDim:   'real',
    },
  ],

  npcs: [],

  rifts: [
    { id: 'G_library_history', x: 8 * 16, y: 2 * 16, size: 'major', emotion: 'shame' },
  ],

  echoes: [
    {
      type:             'bound',
      id:               'echo_archivista',
      x:                8 * 16,
      y:                4 * 16,
      emotion:          'shame',
      dialogueId:       'archivist_echo_encounter',
      doneFlag:         'mission_library_done',
      evadeOnApproach:  true,   // huye de Mateo; Luna debe acorralarlo
    },
    // Dos guardianes de vergüenza protegen el fragmento 3 (el más comprometedor)
    { type: 'minor', id: 'guard_shame_1', x: 16 * 16 - 14, y: 3 * 16,      emotion: 'shame', guard: true, doneFlag: 'fragmento_doc_3_found' },
    { type: 'minor', id: 'guard_shame_2', x: 16 * 16 + 14, y: 3 * 16 + 10, emotion: 'shame', guard: true, doneFlag: 'fragmento_doc_3_found' },
  ],

  objects: [],

  // Tres fragmentos de documento dispersos por la zona
  items: [
    { id: 'I_fragmento_doc_1', x:  4 * 16, y:  5 * 16, width: 12, height: 12, pickFlag: 'fragmento_doc_1_found' },
    { id: 'I_fragmento_doc_2', x:  9 * 16, y:  9 * 16, width: 12, height: 12, pickFlag: 'fragmento_doc_2_found' },
    { id: 'I_fragmento_doc_3', x: 16 * 16, y:  3 * 16, width: 12, height: 12, pickFlag: 'fragmento_doc_3_found', guardedByEcho: true },
  ],

  realZoneId: 'R_LIBRARY',
  dimension:  'void',
};
