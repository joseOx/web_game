import { MissionBase } from '../MissionBase.js';

export class Mission04Dogs extends MissionBase {
  constructor() {
    super({
      id: 'dogs',
      title: 'Perros y sombras',
      steps: [
        { description: 'Llegar a la playa norte de noche' },
        { description: 'Separar los Ecos adheridos a los tres perros' },
        { description: 'Sellar la Grieta submarina con el ronroneo de Luna' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('rift_G_beach_submarine_sealed', true);
    this._saveSystem?.setFlag('luna_whistle_unlocked', true);
    this._saveSystem?.setFlag('carmen_grateful', true);
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'zone:loaded':
        if ((data.zoneId === 'R_BEACH' || data.zoneId === 'V_BEACH') && this.currentStep === 0) {
          this.advanceStep();
        }
        break;

      case 'echo:separated':
        if (['echo_dog_1', 'echo_dog_2', 'echo_dog_3'].includes(data.echoId)) {
          const key = `echo_dog_${data.echoId.slice(-1)}_separated`;
          this._saveSystem?.setFlag(key, true);
          if (this._allEchosSeparated() && this.currentStep === 1) {
            this.advanceStep();
          }
        }
        break;

      case 'rift:sealed':
        if (data.riftId === 'G_beach_submarine' && this.currentStep === 2) {
          this.advanceStep();
        }
        break;

      case 'item:picked':
        if (data.itemId === 'I_shipwreck_box') {
          this._saveSystem?.setFlag('shipwreck_box_found', true);
        }
        break;
    }
  }

  _allEchosSeparated() {
    return ['echo_dog_1_separated', 'echo_dog_2_separated', 'echo_dog_3_separated']
      .every(f => this._saveSystem?.getFlag(f));
  }
}
