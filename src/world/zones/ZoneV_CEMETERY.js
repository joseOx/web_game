// V_CEMETERY — Cementerio en el Vacío
// 20 × 16 tiles = 320 × 256 px
// El eco del hermano de Diego espera aquí, anclado a la grieta de la capilla.

export const ZoneV_CEMETERY = {
  id:       'V_CEMETERY',
  music:    null,
  tileSize: 16,
  solidChars: '#g',

  // mismo layout que R_CEMETERY pero con paleta void
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
    '#': '#1A1A28',   // muro void
    '.': '#1E2A1A',   // hierba void (casi negra)
    'g': '#2A2A3A',   // lápida void
    'p': '#2E2E3E',   // camino
    'd': '#1E2A1A',   // salida
  },

  spawns: {
    default:     { x: 10 * 16, y: 13 * 16 },
    from_real:   { x: 10 * 16, y: 13 * 16 },
  },

  exits: [
    {
      id:          'to_cemetery',
      x:    7 * 16, y: 14 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_CEMETERY',
      targetSpawn: 'from_hub',
      switchDim:   'real',
    },
  ],

  npcs: [],

  rifts: [
    { id: 'G_cemetery_chapel', x: 10 * 16, y: 4 * 16, size: 'major', emotion: 'grief' },
    { id: 'G_cemetery_child', x: 16 * 16, y: 3 * 16, size: 'major', emotion: 'guilt' },
  ],

  echoes: [
    {
      type:       'bound',
      id:         'echo_hermano',
      x:          10 * 16,
      y:           6 * 16,
      emotion:    'grief',
      dialogueId: 'hermano_echo_encounter',
      spawnFlag:  'mission_brothers_active',
      doneFlag:   'mission_brothers_done',
    },
    // Barrera de duelo: fila horizontal en row 5 (todos tiles abiertos)
    // Solo aparece cuando la misión está activa
    { type: 'minor', id: 'guard_grief_1', x:  7 * 16, y: 5 * 16, emotion: 'grief', guard: true, spawnFlag: 'mission_brothers_active', doneFlag: 'mission_brothers_done' },
    { type: 'minor', id: 'guard_grief_2', x: 13 * 16, y: 5 * 16, emotion: 'grief', guard: true, spawnFlag: 'mission_brothers_active', doneFlag: 'mission_brothers_done' },
    { type: 'minor', id: 'guard_grief_3', x: 10 * 16, y: 5 * 16, emotion: 'grief', guard: true, spawnFlag: 'mission_brothers_active', doneFlag: 'mission_brothers_done' },
    // Eco de Tomás — aparece cuando la misión está activa y la grieta descubierta
    {
      type:       'bound',
      id:         'echo_tomas',
      x:          16 * 16,
      y:           6 * 16,
      emotion:    'guilt',
      dialogueId: 'tomas_echo_encounter',
      spawnFlag:  'mission_cemetery_child_active',
      doneFlag:   'mission_cemetery_child_done',
    },
    // Guardianes de culpa — barrera emocional que protege el collar de Tomás
    // Solo aparecen si la misión está activa y el jugador NO tiene la piedra de Emilia
    { type: 'minor', id: 'guard_guilt_1', x: 15 * 16, y: 4 * 16, emotion: 'guilt', guard: true, spawnFlag: 'mission_cemetery_child_active', doneFlag: 'mission_cemetery_child_done' },
    { type: 'minor', id: 'guard_guilt_2', x: 17 * 16, y: 4 * 16, emotion: 'guilt', guard: true, spawnFlag: 'mission_cemetery_child_active', doneFlag: 'mission_cemetery_child_done' },
    { type: 'minor', id: 'guard_guilt_3', x: 15 * 16, y: 6 * 16, emotion: 'guilt', guard: true, spawnFlag: 'mission_cemetery_child_active', doneFlag: 'mission_cemetery_child_done' },
    { type: 'minor', id: 'guard_guilt_4', x: 17 * 16, y: 6 * 16, emotion: 'guilt', guard: true, spawnFlag: 'mission_cemetery_child_active', doneFlag: 'mission_cemetery_child_done' },
  ],

  objects: [
    {
      id:          'collar_tomas',
      x:           16 * 16,
      y:            5 * 16,
      color:       '#D4A96A',
      dialogueId:  'collar_tomas_pickup',
      itemId:      'I_collar_tomas',
      spawnFlag:   'mission_cemetery_child_active',
      doneFlag:    'mission_cemetery_child_done',
    },
  ],

  realZoneId: 'R_CEMETERY',
  dimension:  'void',
};
