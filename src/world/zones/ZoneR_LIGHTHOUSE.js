// R_LIGHTHOUSE — Exterior e interior del Faro de Miraloma (mundo real)
// 20 × 18 tiles = 320 × 288 px
// Norte: acantilado (bloqueado). Sur: salida a R_HUB.
// El faro (cols 4-7) es accesible por su base abierta.

export const ZoneR_LIGHTHOUSE = {
  id:       'R_LIGHTHOUSE',
  music:    null,
  tileSize: 16,
  solidChars: '#l',

  // '#' borde  '.' suelo (arena/piedra)  'l' muro del faro  'd' salida sur
  grid: [
    '####################',
    '####################',
    '#..................#',
    '#...llll...........#',
    '#...l..l...........#',
    '#...l..l...........#',
    '#...l..l...........#',
    '#...l..l...........#',
    '#...l..l...........#',
    '#...l..l...........#',
    '#...l..l...........#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#.......d..........#',
    '####################',
  ],

  palette: {
    '#': '#2D2D3D',
    'l': '#4A3A2A',   // muro del faro (piedra vieja)
    '.': '#C8B48A',   // arena costera
    'd': '#C8B48A',   // salida (misma arena)
  },

  spawns: {
    default:   { x: 9 * 16, y: 13 * 16 },
    from_hub:  { x: 9 * 16, y: 13 * 16 },
    from_void: { x: 5 * 16, y:  7 * 16 },  // aparece dentro del faro
  },

  exits: [
    {
      id:          'to_hub',
      x:   7 * 16, y: 16 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_lighthouse',
    },
  ],

  npcs: [],

  // El rift está aquí pero sólo visible con visión felina; presionar E cerca ↔ V_LIGHTHOUSE
  rifts: [
    {
      id:      'G_lighthouse_lantern',
      x:       5 * 16 - 4,
      y:       4 * 16,
      size:    'minor',
      emotion: 'longing',
    },
  ],

  echoes: [],
  items:  [],

  voidZoneId: 'V_LIGHTHOUSE',
  realZoneId: null,
  dimension:  'real',
};
