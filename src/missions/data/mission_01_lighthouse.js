import { MissionBase } from '../MissionBase.js';

export class Mission01Lighthouse extends MissionBase {
  constructor() {
    super({
      id: 'lighthouse',
      title: 'El farero y su faro',
      steps: [
        { description: 'Hablar con la abuela Rosa sobre el faro' },
        { description: 'Investigar el interior del faro' },
        { description: 'Encontrar la carta de retiro de Antonio' },
        { description: 'Entregar la carta al Eco de Antonio en el Vacío' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('rift_lighthouse_lantern_sealed', true);
    this._saveSystem?.setFlag('faro_night_light_off', true);
    // Luna's detection range bonus: handled by LunaAI reading luna_detection_range_bonus flag
    this._saveSystem?.setFlag('luna_detection_range_bonus',
      (this._saveSystem.getFlag('luna_detection_range_bonus', 0)) + 30);
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        if (data.nodeId === 'rosa_lighthouse_warning_02' && this.currentStep === 0) {
          this._saveSystem?.setFlag('antonio_talked_rosa', true);
          this.advanceStep();
        }
        if (data.nodeId === 'antonio_echo_letter_03') {
          this._saveSystem?.setFlag('antonio_letter_read', true);
          if (this._saveSystem?.getFlag('antonio_notes_secret_active') === false) {
            this._saveSystem?.setFlag('antonio_notes_secret_active', true);
          }
        }
        if (data.nodeId === 'antonio_echo_release_03' && this.currentStep === 3) {
          this._saveSystem?.setFlag('antonio_letter_delivered', true);
          this.advanceStep();
        }
        break;

      case 'item:picked':
        if (data.itemId === 'I_antonio_letter' && this.currentStep === 2) {
          this._saveSystem?.setFlag('antonio_letter_found', true);
          this.advanceStep();
        }
        break;

      case 'zone:loaded':
        // Step 1 "Investigate the lighthouse" completes automatically on arrival
        if (data.zoneId === 'R_LIGHTHOUSE' && this.currentStep === 1) {
          this.advanceStep();
        }
        break;

      case 'rift:sealed':
        if (data.riftId === 'G_lighthouse_lantern' && this.currentStep === 3) {
          this.advanceStep();
        }
        break;
    }
  }
}
