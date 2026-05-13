// R_CEMETERY — Cementerio de Miraloma
// 20 × 16 tiles = 320 × 256 px
// Diego habla de su hermano. De noche algo sigue a los vivos entre las lápidas.

export const ZoneR_CEMETERY = {
  id:       'R_CEMETERY',
  music:    null,
  tileSize: 16,
  solidChars: '#g',   // '#' muro  'g' lápidas (sólidas)

  // '#' muro  '.' hierba  'g' lápida (sólida)  'p' camino piedra  'd' salida
  grid: [
    '####################',
    '#..................#',
    '#.gg....gg....gg..#',
    '#.gg....gg....gg..#',
    '#..................#',
    '#..................#',
    '#.gg....gg....gg..#',
    '#.gg....gg....gg..#',
    '#..................#',
    '#..................#',
    '#.gg....gg....gg..#',
    '#.gg....gg....gg..#',
    '#..................#',
    '#..................#',
    '#.......d.d........#',
    '####################',
  ],

  palette: {
    '#': '#2A2A3A',   // muro de piedra
    '.': '#3A4A30',   // hierba del cementerio
    'g': '#4A4A5A',   // lápida
    'p': '#5A5A6A',   // camino de piedra
    'd': '#3A4A30',   // salida (misma hierba)
  },

  spawns: {
    default:  { x: 10 * 16, y: 13 * 16 },
    from_hub: { x: 10 * 16, y: 13 * 16 },
  },

  exits: [
    {
      id:          'to_hub',
      x:    7 * 16, y: 14 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_cemetery',
    },
  ],

  npcs:    [],
  echoes:  [],
  objects: [],

  rifts: [
    // La grieta de la capilla no es visible en el mundo real
    { id: 'G_cemetery_chapel', x: 10 * 16, y: 4 * 16, size: 'major', emotion: 'grief', visible: false },
  ],

  voidZoneId: 'V_CEMETERY',
  dimension:  'real',
};
