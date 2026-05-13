// R_BEACH — Playa norte de Miraloma
// 24 × 14 tiles = 384 × 224 px
// Carmen vive cerca. De noche los perros aúllan hacia aquí.

export const ZoneR_BEACH = {
  id:       'R_BEACH',
  music:    null,
  tileSize: 16,
  solidChars: '#~',   // '#' rocas/borde  '~' agua (sólida)

  // '#' roca/borde  '.' arena  '~' mar (sólido)  'd' salida al pueblo  'r' ribera húmeda
  grid: [
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~rrrrrrrrrr~~~~~~~',
    '~~~~~~rr..........rr~~~~',
    '~~~~~rr............rr~~~',
    '~~~~rr..............rr~~',
    '~~~rr................rr~',
    '~~rr..................rr~',
    '~~r....................r~',
    '~~......................~~',
    '~~......................~~',
    '~~......................~~',
    '##....d.d...............##',
    '########################',
  ],

  palette: {
    '#': '#2A2A3A',   // roca oscura
    '~': '#1A4A7A',   // mar
    '.': '#C8B878',   // arena
    'r': '#A89858',   // ribera húmeda / arena mojada
    'd': '#A89858',   // salida (misma arena, la superposición del exit la indica)
  },

  spawns: {
    default:  { x: 12 * 16, y: 10 * 16 },
    from_hub: { x: 12 * 16, y: 10 * 16 },
  },

  exits: [
    {
      id:          'to_hub',
      x:    5 * 16, y: 12 * 16,
      width:  4 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_beach',
    },
  ],

  npcs: [
    {
      id:         'carmen',
      x:          10 * 16,
      y:           9 * 16,
      color:      '#D4A870',
      dialogueId: 'carmen_route',
      label:      'Carmen',
    },
  ],

  rifts: [
    // La grieta submarina no es visible en el mundo real
    { id: 'G_beach_submarine', x: 12 * 16, y: 3 * 16, size: 'major', emotion: 'fear', visible: false },
  ],

  echoes:  [],
  objects: [],

  voidZoneId: 'V_BEACH',
  dimension:  'real',
};
