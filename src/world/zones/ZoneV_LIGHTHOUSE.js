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
