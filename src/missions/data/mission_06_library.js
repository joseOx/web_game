import { MissionBase } from '../MissionBase.js';

export class Mission06Library extends MissionBase {
  constructor() {
    super({
      id: 'library',
      title: 'La grieta del olvido',
      steps: [
        { description: 'Investigar los libros en blanco de la biblioteca' },
        { description: 'Reunir los 3 fragmentos de documento en el Vacío' },
        { description: 'Confrontar al Eco del archivista con los documentos reconstruidos' },
      ],
    });
  }

  onComplete() {
    this._saveSystem?.setFlag('rift_library_history_sealed', true);
    this._saveSystem?.setFlag('archive_full_unlocked', true);
    this._saveSystem?.setFlag('weaver_pattern_revealed', true);
    this._saveSystem?.setFlag('abuelo_connection_unlocked', true);
    this._saveSystem?.setFlag('ponce_grateful', true);
  }

  onEvent(eventName, data) {
    switch (eventName) {
      case 'dialogue:node_exit':
        if (data.nodeId === 'ponce_m06_03' && this.currentStep === 0) {
          this._saveSystem?.setFlag('books_blank_seen', true);
          this.advanceStep();
        }
        if (data.nodeId === 'archivist_echo_end' && this.currentStep === 2) {
          this._saveSystem?.setFlag('archivist_confronted', true);
          this.advanceStep();
        }
        break;

      case 'item:picked': {
        const docFlags = {
          'I_fragmento_doc_1': 'fragmento_doc_1_found',
          'I_fragmento_doc_2': 'fragmento_doc_2_found',
          'I_fragmento_doc_3': 'fragmento_doc_3_found',
        };
        if (docFlags[data.itemId]) {
          this._saveSystem?.setFlag(docFlags[data.itemId], true);
          if (this._allFragmentsFound()) {
            this._saveSystem?.setFlag('documentos_reconstructed', true);
          }
        }
        break;
      }

      case 'item:combined':
        if (data.resultId === 'I_documentos_reconstruidos' && this.currentStep === 1) {
          this.advanceStep();
        }
        break;

      case 'rift:sealed':
        if (data.riftId === 'G_library_history') {
          this.complete();
        }
        break;
    }
  }

  _allFragmentsFound() {
    return ['fragmento_doc_1_found', 'fragmento_doc_2_found', 'fragmento_doc_3_found']
      .every(f => this._saveSystem?.getFlag(f));
  }
}
