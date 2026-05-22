// R_CHAPTER0_GARDEN — Jardín trasero, 6 años atrás (precuela)
// Noche, lluvia. Ecos visibles sin necesidad de Visión Felina.
// 16 × 9 tiles = 256 × 144 px

export const ZoneR_CHAPTER0_GARDEN = {
  id:       'R_CHAPTER0_GARDEN',
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
    '#': '#0A0A14',   // muro nocturno
    '.': '#1E1A2E',   // césped nocturno
  },

  spawns: {
    default:    { x: 80, y: 72 },
    from_house: { x: 80, y: 72 },
  },

  exits: [
    {
      id:          'to_house',
      x:    7 * 16, y: 0,
      width:  2 * 16, height: 16,
      targetZone:  'R_CHAPTER0_HOUSE',
      targetSpawn: 'from_garden',
    },
  ],

  npcs: [],

  objects: [],

  rifts:  [],
  echoes: [],

  voidZoneId: null,
  dimension:  'real',
};
