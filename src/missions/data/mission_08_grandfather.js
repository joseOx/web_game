import { MissionBase } from '../MissionBase.js';

// M08 — "El diario del abuelo"
// Precuela jugable: cinemática interactiva con minijuegos de observación
// Requisitos: M06 (biblioteca) + M07 (cementerio) completadas + abuelo_connection_unlocked
// Transcurre en la memoria del abuelo joven (hace 40 años)
export class Mission08Grandfather extends MissionBase {
  constructor() {
    super({
      id: 'grandfather_chronicle',
      title: 'El diario del abuelo',
      steps: [
        { description: 'Encontrar el diario del abuelo en el desván' },
        { description: 'Explorar la memoria: encontrar objetos ocultos' },
        { description: 'Resolver el patrón de símbolos del pasaje' },
        { description: 'Encontrar a la durmiente en el Vacío profundo' },
        { description: 'Leer el legado del abuelo' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('mission_grandfather_done', true);
    this._saveSystem?.setFlag('reina_vacio_unlocked', true);
    this._saveSystem?.setFlag('m08_diary_found', true);
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        // Paso 0→1: Mateo encuentra el diario en el desván
        if (data.nodeId === 'm08_trigger_02' && this.currentStep === 0) {
          this._saveSystem?.setFlag('m08_diary_found', true);
          this.advanceStep();
        }
        // Paso 1→2: Al completar minijuego de observación (3 objetos encontrados)
        if (data.nodeId === 'm08_memory_objects_complete' && this.currentStep === 1) {
          this.advanceStep();
        }
        // Paso 2→3: Patrón de símbolos resuelto
        if (data.nodeId === 'm08_pattern_solved' && this.currentStep === 2) {
          this._saveSystem?.setFlag('m08_pattern_solved', true);
          this.advanceStep();
        }
        // Paso 3→4: El abuelo ve a Reina y la nombra
        if (data.nodeId === 'abuelo_reina_05' && this.currentStep === 3) {
          this._saveSystem?.setFlag('m08_reina_named', true);
          this.advanceStep();
        }
        // Paso 4→5 (completa): El abuelo escribe el legado y vuelve al presente
        if (data.nodeId === 'm08_present_02' && this.currentStep === 4) {
          this._saveSystem?.setFlag('mission_grandfather_done', true);
          this._saveSystem?.setFlag('reina_vacio_unlocked', true);
          this.complete();
        }
        break;

      case 'minigame:observation_complete':
        // Minijuego de objetos ocultos completado (3 encontrados)
        if (data.minigameId === 'm08_hidden_objects' && this.currentStep === 1) {
          this._saveSystem?.setFlag('m08_objects_found', 3);
          this.advanceStep();
        }
        break;

      case 'minigame:pattern_solved':
        // Minijuego de patrón de símbolos resuelto
        if (data.minigameId === 'm08_pattern' && this.currentStep === 2) {
          this._saveSystem?.setFlag('m08_pattern_solved', true);
          this.advanceStep();
        }
        break;

      case 'memory:entered':
        if (data.memoryId === 'grandfather') {
          this._saveSystem?.setFlag('m08_memory_entered', true);
        }
        break;

      case 'memory:exited':
        if (data.memoryId === 'grandfather') {
          this._saveSystem?.setFlag('m08_memory_exited', true);
        }
        break;
    }
  }
}
