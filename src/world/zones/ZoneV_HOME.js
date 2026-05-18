// V_HOME — Casa de Rosa en el Vacío
// 20 × 13 tiles = 320 × 208 px
// El jardín marchito esconde una grieta de duelo.
// Mismo layout que R_HOME con paleta void.

export const ZoneV_HOME = {
  id:       'V_HOME',
  music:    null,
  tileSize: 16,
  solidChars: '#f',

  grid: [
    '####################',
    '#..............aa..#',
    '#.fff..............#',
    '#.fff..............#',
    '#..................#',
    '#...........fff....#',
    '#..................#',
    '#..................#',
    '#.fff..............#',
    '#..................#',
    '#..................#',
    '#.......d..........#',
    '####################',
  ],

  palette: {
    '#': '#120A1A',
    '.': '#1A0E28',
    'f': '#0A0818',
    'd': '#1A0E28',
    'a': '#1A0E28',
  },

  spawns: {
    default:   { x: 10 * 16, y: 7 * 16 },
    from_real: { x: 10 * 16, y: 7 * 16 },
  },

  exits: [
    {
      id:          'to_home',
      x:    7 * 16, y: 11 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HOME',
      targetSpawn: 'from_void',
      switchDim:   'real',
    },
  ],

  npcs: [],

  rifts: [
    { id: 'G_home_garden', x: 15 * 16, y: 9 * 16, size: 'minor', emotion: 'grief' },
  ],

  echoes: [
    {
      type:       'bound',
      id:         'echo_abuelo',
      x:          13 * 16,
      y:           7 * 16,
      emotion:    'grief',
      dialogueId: 'abuelo_echo_encounter',
      spawnFlag:  'mission_garden_active',
      doneFlag:   'abuelo_echo_met',
    },
  ],

  // Tres puntos de memoria del abuelo — inspeccionar con Espacio revela recuerdos
  objects: [
    { id: 'memo_garden_1', x: 5 * 16 + 4, y: 2 * 16 + 4, width: 8, height: 8, color: '#5A2080', label: '...', dialogueId: 'garden_memory_01' },
    { id: 'memo_garden_2', x: 11 * 16,    y: 4 * 16 + 4, width: 8, height: 8, color: '#5A2080', label: '...', dialogueId: 'garden_memory_02' },
    { id: 'memo_garden_3', x: 5 * 16 + 4, y: 8 * 16 + 4, width: 8, height: 8, color: '#5A2080', label: '...', dialogueId: 'garden_memory_03' },
  ],

  realZoneId: 'R_HOME',
  dimension:  'void',
};
