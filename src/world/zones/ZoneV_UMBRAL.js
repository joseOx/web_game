// V_UMBRAL — Plano abstracto entre dimensiones
// No es una zona tileada normal. Es un espacio vacío con geometría abstracta:
// plataformas de luz, partículas doradas, cielo estrellado.
// Sin Ecos, sin enemigos. Solo silencio y luz.

export const ZoneV_UMBRAL = {
  id:       'V_UMBRAL',
  music:    null,                    // umbral_theme se carga desde main.js
  tileSize: 16,
  solidChars: '',                    // no hay tiles sólidos — zona abstracta

  // No se usa tilemap — se renderiza directamente
  abstract: true,

  // Grid vacío (necesario para que World no falle)
  grid: [],

  palette: {},

  spawns: {
    default: { x: 80, y: 80 },
  },

  exits: [],

  npcs: [],

  objects: [],

  rifts:  [],
  echoes: [],

  voidZoneId: null,
  dimension:  'void',                // está en el Vacío
};
