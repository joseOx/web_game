// R_HOME — Rosa's house interior (tutorial zone, first room Mateo wakes up in)
// 20 × 13 tiles = 320 × 208 px

export const ZoneR_HOME = {
  id:       'R_HOME',
  music:    null,
  tileSize: 16,
  solidChars: '#f',

  // '#' wall  '.' wood floor  'f' furniture (solid)  'd' door frame (walkable)  'a' attic hatch
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
    '#': '#2D2D3D',   // wall
    '.': '#C8A06A',   // wood floor
    'f': '#4A3020',   // furniture
    'd': '#B89560',   // door sill (slightly darker floor)
    'a': '#7A5F3A',   // attic hatch (slightly lighter, warm wood)
  },

  spawns: {
    default:    { x: 152, y: 144 },
    from_hub:   { x: 112, y: 148 },
    from_attic: { x: 248, y:  36 },
    from_void:  { x: 112, y: 148 },  // vuelve cerca de la puerta al salir del vacío
  },

  // Exits: pixel rects; must match walkable tile positions in the grid
  exits: [
    {
      id:          'to_hub',
      x:    7 * 16, y: 11 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_home',
    },
    {
      id:          'to_attic',
      x:   15 * 16, y:  1 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HOME_ATTIC',
      targetSpawn: 'default',
    },
  ],

  // NPC defs: col/row → pixel pos at tileSize=16
  npcs: [
    {
      id:         'rosa',
      x:          11 * 16,
      y:           5 * 16,
      color:      '#D4A96A',
      dialogueId: 'rosa_meta',
      label:      'Rosa',
    },
  ],

  // Rift del jardín — no visible en el mundo real (ni con visión felina)
  rifts: [
    { id: 'G_home_garden', x: 15 * 16, y: 9 * 16, size: 'minor', emotion: 'grief', forceHiddenInReal: true },
  ],

  // EchoMinor / EchoBound defs for this zone
  echoes: [],

  voidZoneId: 'V_HOME',
  dimension: 'real',
};
