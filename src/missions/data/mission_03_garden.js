import { MissionBase } from '../MissionBase.js';

export class Mission03Garden extends MissionBase {
  constructor() {
    super({
      id: 'garden',
      title: 'El jardín de los recuerdos',
      steps: [
        { description: 'Investigar el jardín marchito de la abuela Rosa' },
        { description: 'Entrar al jardín del Vacío y hablar con el espíritu' },
        { description: 'Actuar como intermediario entre el Eco y la abuela Rosa' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('garden_flowers_bloomed', true);
    this._saveSystem?.setFlag('rosa_full_story_unlocked', true);
    this._saveSystem?.setFlag('abuelo_backstory_unlocked', true);
    this._saveSystem?.setFlag('rosa_trust_level', 1);
    // Secret: if message was 'release', activate signal flowers
    if (this._saveSystem?.getFlag('m03_message') === 'release') {
      this._saveSystem?.setFlag('m03_secret_unlocked', true);
      this._saveSystem?.setFlag('garden_signal_flowers', true);
    }
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        if (data.nodeId === 'rosa_m03_trigger_02' && this.currentStep === 0) {
          this.advanceStep();
        }
        if (data.nodeId === 'abuelo_echo_end' && this.currentStep === 1) {
          this.advanceStep();
        }
        if (data.nodeId === 'rosa_m03_end_02' && this.currentStep === 2) {
          this.advanceStep();
        }
        break;
    }
  }
}
