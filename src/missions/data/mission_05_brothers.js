import { MissionBase } from '../MissionBase.js';

export class Mission05Brothers extends MissionBase {
  constructor() {
    super({
      id: 'brothers',
      title: 'Dos hermanos, una promesa',
      steps: [
        { description: 'Hablar con Diego sobre lo que siente' },
        { description: 'Encontrar al Eco del hermano en el Vacío del cementerio' },
        { description: 'Recuperar el objeto personal del hermano' },
        { description: 'Resolver la situación con Diego' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('rift_cemetery_chapel_sealed', true);
    this._saveSystem?.setFlag('memory_share_unlocked', true);
    // Resolution effects applied via dialogue onExit actions (setFlag diego_resolution)
    const res = this._saveSystem?.getFlag('diego_resolution');
    if (res === 'B' || res === 'C') {
      this._saveSystem?.setFlag('diego_ally', true);
    }
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        if (data.nodeId === 'diego_m05_accept' && this.currentStep === 0) {
          this.advanceStep();
        }
        if (data.nodeId === 'hermano_echo_end' && this.currentStep === 1) {
          this._saveSystem?.setFlag('hermano_echo_met', true);
          this.advanceStep();
        }
        break;

      case 'item:picked':
        if (data.itemId === 'I_objeto_diego' && this.currentStep === 2) {
          this._saveSystem?.setFlag('objeto_diego_found', true);
          this.advanceStep();
        }
        break;

      // Resolution dialogues call complete() directly via onExit action
      case 'rift:sealed':
        if (data.riftId === 'G_cemetery_chapel') {
          this.complete();
        }
        break;
    }
  }
}
