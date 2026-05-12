// R_HOME — Rosa's house interior (tutorial zone, first room Mateo wakes up in)
// 20 × 13 tiles = 320 × 208 px

export const ZoneR_HOME = {
  id:       'R_HOME',
  music:    null,
  tileSize: 16,
  solidChars: '#f',

  // '#' wall  '.' wood floor  'f' furniture (solid)  'd' door frame (walkable)
  grid: [
    '####################',
    '#..................#',
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
    '#': '#2D2D3D',   // wall
    '.': '#C8A06A',   // wood floor
    'f': '#4A3020',   // furniture
    'd': '#B89560',   // door sill (slightly darker floor)
  },

  spawns: {
    default:  { x: 152, y: 144 },  // center of room
    from_hub: { x: 112, y: 168 },  // near the door
  },

  // Exits: pixel rects; must match walkable 'd' tile positions in the grid
  exits: [
    {
      id:          'to_hub',
      x:    7 * 16, y: 11 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_home',
    },
  ],

  // NPC defs: col/row → pixel pos at tileSize=16
  npcs: [
    {
      id:         'rosa',
      x:          11 * 16,
      y:           5 * 16,
      color:      '#D4A96A',
      dialogueId: 'rosa_lighthouse_hint',
      label:      'Rosa',
    },
  ],

  // Rifts that exist in this zone (none in Rosa's house)
  rifts: [],

  // EchoMinor / EchoBound defs for this zone
  echoes: [],

  voidZoneId: null,
  dimension: 'real',
};
