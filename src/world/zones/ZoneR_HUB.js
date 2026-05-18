// R_HUB — Plaza central del pueblo
// 25 × 18 tiles = 400 × 288 px
// The main outdoor hub connecting all areas.

export const ZoneR_HUB = {
  id:       'R_HUB',
  music:    null,
  tileSize: 16,
  solidChars: '#bf',  // '#' walls, 'b' building blocks, 'f' plaza features

  // '#' edge wall  '.' stone floor  'b' building facade (solid)
  // 'f' fountain/bench (solid)  'd' side exits  'g' grass patch
  // 'h' exit south → R_HOME (warm earth)  'c' exit south → R_CEMETERY (mossy slate)
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
    '#...........hh#cc.......#',
    '#########################',
  ],

  palette: {
    '#': '#2D2D3D',   // edge wall
    '.': '#666676',   // stone floor
    'b': '#3A3545',   // building facade
    'f': '#555565',   // fountain/bench feature
    'd': '#666676',   // side exit tiles (same color as floor)
    'g': '#4A6040',   // grass
    'h': '#A87C5A',   // south exit → R_HOME (warm amber path)
    'c': '#4A6045',   // south exit → R_CEMETERY (mossy green path)
  },

  spawns: {
    default:          { x: 12 * 16, y: 9 * 16 },
    from_home:        { x: 12 * 16, y: 240 },
    from_lighthouse:  { x: 12 * 16, y: 2 * 16 },
    from_school:      { x: 21 * 16, y: 9 * 16 },
    from_beach:       { x:  2 * 16, y: 8 * 16 },
    from_cemetery:    { x: 15 * 16, y: 14 * 16 },
    from_library:     { x: 22 * 16, y: 11 * 16 },
    from_v_hub:       { x: 12 * 16, y:  9 * 16 },
  },

  exits: [
    {
      id:          'to_home',
      x:   11 * 16, y: 16 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_HOME',
      targetSpawn: 'from_hub',
    },
    {
      id:          'to_lighthouse',
      x:   10 * 16, y: 0,
      width:  4 * 16, height: 2 * 16,
      targetZone:  'R_LIGHTHOUSE',
      targetSpawn: 'from_hub',
    },
    {
      id:          'to_school',
      x:   23 * 16, y: 8 * 16,
      width:  2 * 16, height: 2 * 16,
      targetZone:  'R_SCHOOL',
      targetSpawn: 'from_hub',
    },
    {
      id:          'to_beach',
      x:    0,       y: 7 * 16,
      width:  16,    height: 3 * 16,
      targetZone:  'R_BEACH',
      targetSpawn: 'from_hub',
    },
    {
      id:          'to_cemetery',
      x:   14 * 16, y: 16 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_CEMETERY',
      targetSpawn: 'from_hub',
    },
    {
      id:          'to_library',
      x:   24 * 16, y: 11 * 16,
      width:  16,    height: 2 * 16,
      targetZone:  'R_LIBRARY',
      targetSpawn: 'from_hub',
    },
  ],

  npcs: [
    {
      id:         'townsperson_a',
      x:           5 * 16,
      y:           9 * 16,
      color:      '#7A9AB0',
      dialogueId: null,
      label:      '',
    },
    {
      id:         'townsperson_b',
      x:          18 * 16,
      y:           6 * 16,
      color:      '#9A8A70',
      dialogueId: null,
      label:      '',
    },
    {
      id:         'diego',
      x:           6 * 16,
      y:           8 * 16,
      color:      '#7ABCDE',
      dialogueId: 'diego_route',
      label:      'Diego',
    },
  ],

  rifts: [
    { id: 'G_hub_alley', x: 7 * 16, y:  5 * 16, size: 'minor', emotion: 'longing' },
    { id: 'G_hub_tree',  x: 19 * 16, y: 5 * 16, size: 'micro', emotion: 'grief'   },
  ],

  // Three EchoMinor near the alley rift + one EchoBound (antonio)
  echoes: [
    { type: 'minor', id: 'echo_minor_1', x: 7 * 16 - 18, y: 5 * 16 - 10, emotion: 'longing' },
    { type: 'minor', id: 'echo_minor_2', x: 7 * 16 + 12, y: 5 * 16 +  8, emotion: 'grief'   },
    { type: 'minor', id: 'echo_minor_3', x: 7 * 16 -  6, y: 5 * 16 + 22, emotion: 'fear'    },
    {
      type:       'bound',
      id:         'echo_antonio_hub',
      x:          9 * 16,
      y:          4 * 16,
      emotion:    'longing',
      dialogueId: 'antonio_echo_plaza',
      spawnFlag:  'antonio_letter_found',
      doneFlag:   'mission_lighthouse_done',
    },
  ],

  voidZoneId: 'V_HUB',
  dimension:  'real',
};
