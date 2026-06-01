// V_HEART — El Corazón del Vacío
// Zona abstracta pequeña donde reside el origen de las Grietas.
// Accesible desde V_HUB tras completar M06 (biblioteca).
// Contiene 3 fragmentos inspeccionables y un círculo central.
// Sin Ecos hostiles — es un lugar de paz y revelación.
//
// Estilo: fondo oscuro con partículas violetas, como V_UMBRAL pero con geometría.

export const ZoneV_HEART = {
  id:       'V_HEART',
  name:     'Corazón del Vacío',
  music:    null,                    // void_heart_ambient (por implementar)
  tileSize: 16,
  solidChars: '',                    // zona abstracta, sin tiles sólidos
  abstract: true,

  // Grid vacío (necesario para que World no falle)
  grid: [],

  palette: {},

  spawns: {
    default: { x: 160, y: 100 },
  },

  exits: [
    {
      id:          'heart_return',
      x:    52,    y: 68,
      width:  16,  height: 24,
      targetZone:  'V_HUB',
      targetSpawn: 'heart_return',
      condition:   null,     // siempre visible
    },
  ],

  npcs: [],

  // 3 fragmentos inspeccionables alrededor del círculo central
  objects: [
    {
      id:         'corazon_piedra',
      x:          110,  y: 72,
      width:      14,   height: 14,
      color:      '#4A6FA5',
      label:      'Raíz de piedra',
      dialogueId: 'corazon_vacio_fragment_01',
      doneFlag:   'corazon_vacio_frag_01_done',
    },
    {
      id:         'corazon_cenizas',
      x:          132,  y: 78,
      width:      12,   height: 10,
      color:      '#7A9B6B',
      label:      'Cenizas frías',
      dialogueId: 'corazon_vacio_fragment_02',
      doneFlag:   'corazon_vacio_frag_02_done',
    },
    {
      id:         'corazon_sello',
      x:          90,   y: 82,
      width:      16,   height: 8,
      color:      '#B84A4A',
      label:      'El primer sello',
      dialogueId: 'corazon_vacio_fragment_03',
      doneFlag:   'corazon_vacio_frag_03_done',
    },
    // Fragmento de la Dama — parte 5 de 5 (último)
    { id: 'dama_frag_05', x: 185, y: 120, width: 14, height: 14, color: '#B8B8D0', label: 'Último jirón de niebla', dialogueId: 'fog_encounter_dama_05', doneFlag: 'fog_encounter_dama_05' },
  ],

  // Sin Ecos ni Grietas — es un lugar de paz
  rifts:  [],
  echoes: [],

  // Dimensión
  voidZoneId: null,
  dimension:  'void',
};
