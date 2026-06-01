// V_LIGHTHOUSE — El Vacío del Faro de Miraloma
// Misma geometría que R_LIGHTHOUSE pero en el Vacío:
//   - Paleta oscura violeta
//   - Rift G_lighthouse_lantern visible
//   - Eco de Antonio (EchoBound)
//   - Carta de retiro como objeto recogible

export const ZoneV_LIGHTHOUSE = {
  id:       'V_LIGHTHOUSE',
  music:    null,
  tileSize: 16,
  solidChars: '#l',

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
    '#': '#1A1A2E',
    'l': '#2D2445',   // muro del faro en el Vacío
    '.': '#252040',   // suelo vacío
    'd': '#252040',
  },

  spawns: {
    default:  { x: 9 * 16, y: 13 * 16 },
    from_real: { x: 5 * 16, y:  7 * 16 },
    from_hub:  { x: 9 * 16, y: 13 * 16 },
  },

  exits: [
    {
      id:          'to_hub_void',
      x:   7 * 16, y: 16 * 16,
      width:  2 * 16, height: 16,
      targetZone:  'R_LIGHTHOUSE',   // salir del Vacío vuelve al mundo real
      targetSpawn: 'from_void',
      switchDim:   'real',           // marca que esta salida cambia de dimensión
    },
  ],

  npcs: [],

  // Fragmento de la Dama de la Niebla — parte 1 de 5
  objects: [
    {
      id:         'dama_frag_01',
      x:          12 * 16,  y: 4 * 16,
      width:      14,       height: 14,
      color:      '#B8B8D0',
      label:      'Jirón de niebla',
      dialogueId: 'fog_encounter_dama_01',
      doneFlag:   'fog_encounter_dama_01',
    },
  ],

  // Rift visible en el Vacío (siempre visible)
  rifts: [
    {
      id:      'G_lighthouse_lantern',
      x:       5 * 16 - 4,
      y:       4 * 16,
      size:    'minor',
      emotion: 'longing',
    },
  ],

  // Eco de Antonio — EchoBound dentro del faro
  echoes: [
    {
      type:       'bound',
      id:         'echo_antonio_lighthouse',
      x:          5 * 16,
      y:          7 * 16,
      emotion:    'longing',
      dialogueId: 'antonio_echo_first_encounter',
      doneFlag:   'mission_lighthouse_done',
    },
    // Tres guardianes de la grieta del farol — bloquean el sellado hasta que Luna los echa
    { type: 'minor', id: 'guard_lantern_1', x: 80, y: 68,  emotion: 'longing', guard: true, doneFlag: 'mission_lighthouse_done' },
    { type: 'minor', id: 'guard_lantern_2', x: 84, y: 84,  emotion: 'longing', guard: true, doneFlag: 'mission_lighthouse_done' },
    { type: 'minor', id: 'guard_lantern_3', x: 78, y: 100, emotion: 'longing', guard: true, doneFlag: 'mission_lighthouse_done' },
  ],

  // Carta — objeto recogible en el suelo del faro
  items: [
    {
      id:       'I_antonio_letter',
      x:        5 * 16 + 3,
      y:        9 * 16,
      width:    10,
      height:   10,
      pickFlag: 'antonio_letter_found',
    },
  ],

  voidZoneId: null,
  realZoneId: 'R_LIGHTHOUSE',
  dimension:  'void',
};
