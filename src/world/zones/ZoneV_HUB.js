// V_HUB — Plaza central en el Vacío
// Espejo de R_HUB. El Tejedor aparece aquí por primera vez.
// Luna también se localiza aquí durante el Acto 2→3.

export const ZoneV_HUB = {
  id:       'V_HUB',
  music:    null,
  tileSize: 16,
  solidChars: '#bf',

  grid: [
    '#########################',
    '#.......................#',
    '#.bbb..............bbb.#',
    '#.b.b..............b.b.#',
    '#.bbb..............bbb.#',
    '#.......................#',
    '#.......................#',
    'd...........ff..........#',
    'd...........ff..........d',
    'd.......................d',
    '#.......................#',
    '#.bbb..............bbb.d',
    '#.b.b..............b.b.d',
    '#.bbb..............bbb.#',
    '#.......................#',
    '#.......................#',
    '#...........d..d.......#',
    '#########################',
  ],

  palette: {
    '#': '#1A1828',   // roca void
    '.': '#2A2838',   // suelo void
    'b': '#1E1C2A',   // fachada void
    'f': '#252333',   // fuente/banca void
    'd': '#2A2838',   // salida
  },

  spawns: {
    default:      { x: 12 * 16, y: 9 * 16 },
    from_hub:     { x: 12 * 16, y: 9 * 16 },
    heart_return: { x: 12 * 16, y: 3 * 16 },
    throne_return: { x: 12 * 16, y: 15 * 16 },
  },

  exits: [
    {
      id:          'to_hub_left',
      x:    0,          y: 7 * 16,
      width:  16,       height: 3 * 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_v_hub',
      switchDim:   'real',
    },
    {
      id:          'to_hub_right',
      x:    24 * 16,    y: 8 * 16,
      width:  16,       height: 2 * 16,
      targetZone:  'R_HUB',
      targetSpawn: 'from_v_hub',
      switchDim:   'real',
    },
    {
      id:          'to_heart',
      x:    10 * 16,    y: 1 * 16,
      width:  5 * 16,   height: 16,
      targetZone:  'V_HEART',
      targetSpawn: 'default',
      condition:   'flag:abuelo_connection_unlocked',
    },
    {
      id:          'to_throne',
      x:    12 * 16,    y: 15 * 16,
      width:  3 * 16,   height: 16,
      targetZone:  'V_THRONE',
      targetSpawn: 'default',
      condition:   'flag:reina_vacio_unlocked',
    },
  ],

  // El Tejedor como NPC — desaparece una vez que ya fue visto (doneFlag = weaver_first_seen)
  npcs: [
    {
      id:         'el_tejedor',
      x:          12 * 16,
      y:           5 * 16,
      color:      '#4A2D6E',
      dialogueId: 'weaver_first_seen_01',
      label:      'El Tejedor',
      doneFlag:   'weaver_first_seen',
    },
  ],

  rifts: [
    { id: 'G_hub_alley', x: 7 * 16, y: 5 * 16, size: 'minor', emotion: 'longing' },
  ],
  echoes:  [],
  objects: [],

  realZoneId: 'R_HUB',
  dimension:  'void',
};
