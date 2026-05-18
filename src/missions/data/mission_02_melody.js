import { MissionBase } from '../MissionBase.js';

export class Mission02Melody extends MissionBase {
  constructor() {
    super({
      id: 'melody',
      title: 'La melodía incompleta',
      steps: [
        { description: 'Investigar la música que suena en la escuela abandonada' },
        { description: 'Reunir los 4 fragmentos de la partitura' },
        { description: 'Entregar la partitura completa a Vera' },
        { description: 'Toca la melodía en el piano para sellar la grieta' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('rift_school_piano_sealed', true);
    this._saveSystem?.setFlag('school_piano_silent', true);
    this._saveSystem?.setFlag('melody_ability_unlocked', true);
    this._saveSystem?.setFlag('resonant_objects_active', true);
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'item:picked': {
        const partituraFlags = {
          'I_partitura_1': 'partitura_1_found',
          'I_partitura_2': 'partitura_2_found',
          'I_partitura_3': 'partitura_3_found',
          'I_partitura_4': 'partitura_4_found',
        };
        if (partituraFlags[data.itemId]) {
          this._saveSystem?.setFlag(partituraFlags[data.itemId], true);
          // Check if all 4 collected → combine into partitura_completa
          if (this._allPartituraPiecesFound()) {
            this._saveSystem?.setFlag('partitura_complete', true);
          }
        }
        // Step 1 complete: advance when first partitura found (entering school)
        if (data.itemId === 'I_partitura_1' && this.currentStep === 0) {
          this.advanceStep();
        }
        break;
      }

      case 'item:combined':
        if (data.resultId === 'I_partitura_completa' && this.currentStep === 1) {
          this.advanceStep();
        }
        break;

      case 'dialogue:node_exit':
        if (data.nodeId === 'vera_echo_end_02' && this.currentStep === 2) {
          this._saveSystem?.setFlag('partitura_delivered_vera', true);
          this.advanceStep();
        }
        break;

      case 'rift:sealed':
        if (data.riftId === 'G_school_piano') {
          this.complete();
        }
        break;
    }
  }

  _allPartituraPiecesFound() {
    return ['partitura_1_found', 'partitura_2_found', 'partitura_3_found', 'partitura_4_found']
      .every(f => this._saveSystem?.getFlag(f));
  }
}
