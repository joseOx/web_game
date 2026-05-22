// R_CHAPTER0_HOUSE — Casa de Rosa, 6 años atrás (precuela)
// Versión nocturna. Luna escala para proteger a Mateo.
// 16 × 9 tiles = 256 × 144 px

export const ZoneR_CHAPTER0_HOUSE = {
  id:       'R_CHAPTER0_HOUSE',
  music:    null,
  tileSize: 16,
  solidChars: '#',

  grid: [
    '################',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '#..............#',
    '################',
  ],

  palette: {
    '#': '#0A0812',   // noche — paredes oscuras
    '.': '#1A1428',   // piso nocturno
  },

  spawns: {
    default: { x: 80, y: 72 },
  },

  exits: [
    {
      id:          'to_garden',
      x:    7 * 16, y: 7 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_CHAPTER0_GARDEN',
      targetSpawn: 'from_house',
    },
  ],

  npcs: [],

  objects: [],

  rifts:  [],
  echoes: [],

  voidZoneId: null,
  dimension:  'real',
};
