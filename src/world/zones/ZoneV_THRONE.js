// V_THRONE — El Trono del Vacío
// Zona abstracta donde reside Reina, la soberana del Vacío profundo.
// Similar a V_UMBRAL (sin tilemap, renderizado abstracto).
// Accesible desde V_HUB tras completar M08 (reina_vacio_unlocked).
//
// Descripción visual:
//   - Fondo: negro profundo con vetas violeta que pulsan
//   - Suelo: losas de piedra irregulares flotantes
//   - Al fondo: estructura alta con formas geométricas (trono)
//   - Partículas: fragmentos de grieta (triángulos violetas)
//   - Iluminación: la única luz viene de Reina y los Cortesanos
//
// NPCs:
//   - Reina (entidad especial, en el centro)
//   - 3 Cortesanos (Guardian, Whisperer, Architect)
//   - Se evalúa en escena si M08 está completada para diálogos

export const ZoneV_THRONE = {
  id:       'V_THRONE',
  name:     'El Trono del Vacío',
  music:    null,           // reina_theme (por implementar en main.js)
  tileSize: 16,
  solidChars: '',           // zona abstracta

  abstract: true,

  // Grid vacío
  grid: [],

  palette: {},

  spawns: {
    default: { x: 40, y: 120 },
  },

  exits: [
    {
      id:          'throne_return',
      x:    10,    y: 130,
      width:  16,  height: 24,
      targetZone:  'V_HUB',
      targetSpawn: 'throne_return',
      condition:   null,     // siempre visible
    },
  ],

  npcs: [
    // Reina se agrega dinámicamente desde SceneManager/Game
    // porque necesita setup de sprite y de estado.
  ],

  // Sin rifts ni echoes por defecto (se manejan dinámicamente)
  rifts:  [],
  echoes: [],

  // Objetos decorativos
  objects: [
    {
      id:         'throne_structure',
      x:          160,   y: 100,
      width:      40,    height: 60,
      color:      '#3A1F5E',
      label:      'El Trono',
      dialogueId: 'throne_inspect_01',
      doneFlag:   'throne_inspected',
    },
    {
      id:         'throne_fragment_floor',
      x:          100,   y: 140,
      width:      14,    height: 8,
      color:      '#6B4A9E',
      label:      'Fragmento de realidad',
      dialogueId: 'throne_floor_fragment',
      doneFlag:   'throne_fragment_floor_seen',
    },
  ],

  voidZoneId: null,
  dimension:  'void',
};
