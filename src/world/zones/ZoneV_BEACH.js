// V_BEACH — Playa norte en el Vacío
// 24 × 14 tiles = 384 × 224 px
// La grieta submarina atrae a ecos que se adhieren a los perros del pueblo.

export const ZoneV_BEACH = {
  id:       'V_BEACH',
  music:    null,
  tileSize: 16,
  solidChars: '#w',   // '#' roca  'w' agua void (sólida)

  // '#' roca  '.' arena oscura del Vacío  'w' agua void  'r' ribera
  grid: [
    'wwwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwrrrrrrrrrrwwwwwww',
    'wwwwwwrr..........rrwwww',
    'wwwwwrr............rrwww',
    'wwwwrr..............rrww',
    'wwwrr................rrw',
    'wwrr..................rrw',
    'wwr....................rw',
    'ww......................ww',
    'ww......................ww',
    'ww......................ww',
    '##....d.d...............##',
    '########################',
  ],

  palette: {
    '#': '#1A1A28',   // roca void
    'w': '#0A1A3A',   // agua void (oscura y densa)
    '.': '#4A4030',   // arena del Vacío
    'r': '#3A3020',   // ribera del Vacío
    'd': '#3A3020',   // salida
  },

  spawns: {
    default:       { x: 12 * 16, y: 10 * 16 },
    from_beach:    { x: 12 * 16, y: 10 * 16 },
  },

  exits: [
    {
      id:          'to_beach',
      x:    5 * 16, y: 12 * 16,
      width:  4 * 16, height: 16,
      targetZone:  'R_BEACH',
      targetSpawn: 'from_hub',
      switchDim:   'real',
    },
  ],

  npcs: [],

  rifts: [
    { id: 'G_beach_submarine', x: 12 * 16, y: 3 * 16, size: 'major', emotion: 'fear' },
  ],

  echoes: [
    // Los ecos de los perros se separan con el siseo sostenido de Luna (2s), no con diálogo
    {
      type: 'bound', id: 'echo_dog_1', x: 8 * 16, y: 5 * 16, emotion: 'fear',
      dialogueId:     null,
      separateByLuna: true,
      doneFlag:       'echo_dog_1_separated',
    },
    {
      type: 'bound', id: 'echo_dog_2', x: 14 * 16, y: 4 * 16, emotion: 'fear',
      dialogueId:     null,
      separateByLuna: true,
      doneFlag:       'echo_dog_2_separated',
    },
    {
      type: 'bound', id: 'echo_dog_3', x: 11 * 16, y: 7 * 16, emotion: 'fear',
      dialogueId:     null,
      separateByLuna: true,
      doneFlag:       'echo_dog_3_separated',
    },
  ],

  objects: [
    {
      id:         'shipwreck_box',
      x:          16 * 16,
      y:           9 * 16,
      width:      14,
      height:     12,
      dialogueId: 'inspect_shipwreck_box',
      label:      'Caja sellada',
      color:      '#8B6914',
    },
  ],

  realZoneId: 'R_BEACH',
  dimension:  'void',
};
