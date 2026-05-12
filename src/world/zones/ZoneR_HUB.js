// R_HUB — Plaza central del pueblo
// 25 × 18 tiles = 400 × 288 px
// The main outdoor hub connecting all areas.

export const ZoneR_HUB = {
  id:       'R_HUB',
  music:    null,
  tileSize: 16,
  solidChars: '#bf',  // '#' walls, 'b' building blocks, 'f' plaza features

  // '#' edge wall  '.' stone floor  'b' building facade (solid)
  // 'f' fountain/bench (solid)  'd' exit south to R_HOME  'g' grass patch
  grid: [
    '#########################',
    '#.......................#',
    '#.bbb..............bbb.#',
    '#.b.b..............b.b.#',
    '#.bbb..............bbb.#',
    '#.......................#',
    '#.......................#',
    '#...........ff..........#',
    '#...........ff..........d',
    '#.......................d',
    '#.......................#',
    '#.bbb..............bbb.#',
    '#.b.b..............b.b.#',
    '#.bbb..............bbb.#',
    '#.......................#',
    '#.......................#',
    '#...........d..........#',
    '#########################',
  ],

  palette: {
    '#': '#2D2D3D',   // edge wall
    '.': '#666676',   // stone floor
    'b': '#3A3545',   // building facade
    'f': '#555565',   // fountain/bench feature
    'd': '#666676',   // exit tile (same color as floor)
    'g': '#4A6040',   // grass
  },

  spawns: {
    default:          { x: 12 * 16, y: 9 * 16 },
    from_home:        { x: 12 * 16, y: 240 },
    from_lighthouse:  { x: 12 * 16, y: 2 * 16 },
    from_school:      { x: 21 * 16, y: 9 * 16 },
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
  ],

  // Rift G_hub_alley lives here (the demo rift from Phase 4/5)
  rifts: [
    { id: 'G_hub_alley', x: 7 * 16, y: 5 * 16, size: 'minor', emotion: 'longing' },
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
      dialogueId: 'antonio_echo_first_encounter',
      doneFlag:   'mission_lighthouse_done',
    },
  ],

  voidZoneId: null,
  dimension:  'real',
};
