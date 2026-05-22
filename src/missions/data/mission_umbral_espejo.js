import { MissionBase } from '../MissionBase.js';

// MissionUmbralEspejo — Escena final extendida "El Umbral del Espejo"
// No es una misión tradicional (ocurre después del ending)
// Gestiona el trigger, el flujo de la escena, y el desbloqueo del Capítulo 0
export class MissionUmbralEspejo extends MissionBase {
  constructor() {
    super({
      id: 'umbral_espejo',
      title: 'El Umbral del Espejo',
      steps: [
        { description: 'El marco del espejo vibra en tu mochila' },
        { description: 'Subir al desván con el marco' },
        { description: 'Cruzar el umbral luminoso' },
        { description: 'Encontrar a Luna en el plano abstracto' },
        { description: 'Despedirse de Luna' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('umbral_espejo_visto', true);
    this._saveSystem?.setFlag('chapter_umbral_unlocked', true);
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        // Paso 0→1: Mateo nota que el marco vibra
        if (data.nodeId === 'umbral_espejo_trigger_01' && this.currentStep === 0) {
          this.advanceStep();
        }
        // Paso 1→2: Mateo llega al desván con el marco
        if (data.nodeId === 'umbral_espejo_attic_02' && this.currentStep === 1) {
          this.advanceStep();
        }
        // Paso 2→3: El eco del abuelo se manifiesta y el umbral se abre
        if (data.nodeId === 'umbral_abuelo_eco_05' && this.currentStep === 2) {
          this.advanceStep();
        }
        // Paso 3→4: Mateo encuentra a Luna en el umbral
        if (data.nodeId === 'umbral_luna_01' && this.currentStep === 3) {
          this.advanceStep();
        }
        // Paso 4→5 (completa): La despedida final
        if (data.nodeId === 'umbral_luna_final' && this.currentStep === 4) {
          this.advanceStep();
        }
        break;

      case 'zone:loaded':
        // Al entrar a V_UMBRAL con la misión activa y paso 2, avanzar a paso 3
        if (data.zoneId === 'V_UMBRAL' && this.currentStep === 2) {
          this.advanceStep();
        }
        break;
    }
  }
}
