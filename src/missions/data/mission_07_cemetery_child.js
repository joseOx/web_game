import { MissionBase } from '../MissionBase.js';

export class Mission07CemeteryChild extends MissionBase {
  constructor() {
    super({
      id: 'cemetery_child',
      title: 'La tumba vacía',
      steps: [
        { description: 'Hablar con Emilia en la plaza sobre su hijo Tomás' },
        { description: 'Investigar el cementerio con la visión felina' },
        { description: 'Encontrar la grieta oculta en el muro norte' },
        { description: 'Cruzar al Vacío y encontrar al Eco de Tomás' },
        { description: 'Recuperar el collar de Tomás en el Vacío' },
        { description: 'Resolver el destino de Tomás' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('rift_G_cemetery_child_sealed', true);
    const res = this._saveSystem?.getFlag('m07_resolution');
    if (res === 'A') {
      this._saveSystem?.setFlag('m07_tree_flowered', true);
      this._saveSystem?.setFlag('echo_location_unlocked', true);
    } else if (res === 'B') {
      this._saveSystem?.setFlag('m07_emilia_comforted', true);
      this._saveSystem?.setFlag('memory_share_upgraded', true);
    }
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        // Paso 0→1: Emilia acepta la misión
        if (data.nodeId === 'emilia_m07_accept' && this.currentStep === 0) {
          this.advanceStep();
        }
        // Paso 1→2: Mateo descubre la grieta oculta con visión felina
        if (data.nodeId === 'cemetery_child_rift_discovered' && this.currentStep === 1) {
          this.advanceStep();
        }
        // Paso 2→3: Mateo cruza al Vacío (detectado por zone:loaded)
        // Paso 3→4: Mateo habla con Tomás (cualquier rama)
        if ((data.nodeId === 'tomas_echo_A_collar_02' ||
             data.nodeId === 'tomas_echo_B_04') && this.currentStep === 3) {
          this._saveSystem?.setFlag('tomas_echo_met', true);
          this.advanceStep();
        }
        // Paso 4→5: Collar encontrado (item:picked)
        // Paso 5→6 (completa): Resolución elegida
        if (data.nodeId === 'tomas_echo_res_A_04' && this.currentStep >= 4) {
          this._saveSystem?.setFlag('m07_resolution', 'A');
          this.advanceStep();
        }
        if (data.nodeId === 'tomas_echo_res_B_end' && this.currentStep >= 4) {
          this._saveSystem?.setFlag('m07_resolution', 'B');
          this._saveSystem?.setFlag('collar_tomas_found', true);
          this.advanceStep();
        }
        // Cierres de Emilia — completan la misión
        if (data.nodeId === 'emilia_m07_closure_A_03' ||
            data.nodeId === 'emilia_m07_closure_B_04') {
          this.complete();
        }
        break;

      case 'item:picked':
        if (data.itemId === 'I_collar_tomas' && this.currentStep === 4) {
          this._saveSystem?.setFlag('collar_tomas_found', true);
          this.advanceStep();
        }
        if (data.itemId === 'I_piedra_emilia') {
          this._saveSystem?.setFlag('piedra_emilia_found', true);
        }
        break;

      case 'zone:loaded':
        // Al entrar a V_CEMETERY con la misión activa y paso 2, avanzar a paso 3
        if (data.zoneId === 'V_CEMETERY' && this.currentStep === 2) {
          this.advanceStep();
        }
        break;

      case 'rift:sealed':
        if (data.riftId === 'G_cemetery_child' && this.currentStep >= 4) {
          this.complete();
        }
        break;
    }
  }
}
