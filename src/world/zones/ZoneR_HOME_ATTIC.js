// R_HOME_ATTIC — El desván de la familia Aguirre
// 12 × 9 tiles = 192 × 144 px
// El espejo del abuelo está aquí. Primera Grieta que cruzó Mateo de niño.

export const ZoneR_HOME_ATTIC = {
  id:       'R_HOME_ATTIC',
  music:    null,
  tileSize: 16,
  solidChars: '#',

  // '#' wall  '.' old wood floor  'd' stairs (exit trigger tile)
  grid: [
    '############',
    '#..........#',
    '#..........#',
    '#..........#',
    '#..........#',
    '#..........#',
    '#..........#',
    '#....d.....#',
    '############',
  ],

  palette: {
    '#': '#1C1C2E',   // dark stone wall
    '.': '#5C4A32',   // old dark wood floor
    'd': '#3D2E1A',   // darker wood — stairs opening
  },

  spawns: {
    default: { x: 88, y: 72 },  // center of room
  },

  exits: [
    {
      id:          'to_home',
      x:    4 * 16, y: 7 * 16,
      width:  4 * 16, height: 16,
      targetZone:  'R_HOME',
      targetSpawn: 'from_attic',
    },
  ],

  npcs: [],

  objects: [
    {
      id:                 'mirror_abuelo',
      x:                  80,   // col 5, centered on tile
      y:                  22,   // just below top wall, row 1
      width:              14,
      height:             22,
      dialogueId:         'mirror_inspect_01',
      dialogueIdUnlocked: 'mirror_inspect_post_m06_01',
      unlockFlag:         'abuelo_connection_unlocked',
      label:              'Espejo antiguo',
      color:              '#7BAFD4',
    },
  ],

  rifts:  [],
  echoes: [],

  voidZoneId: null,
  dimension:  'real',
};
