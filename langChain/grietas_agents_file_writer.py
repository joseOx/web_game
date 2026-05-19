"""
GRIETAS — File Writer Agent
============================
Agente adicional que parsea la salida del Programador
y escribe los archivos resultantes en tu proyecto real.

Forma parte del pipeline:
  Designer → Narrativo → Programador → [FileWriter] → Tester

Uso independiente:
  from grietas_file_writer import agente_file_writer
  Importar en grietas_agents.py (ver instrucciones abajo)
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# ─────────────────────────────────────────────
# Configuración: raíz de tu proyecto
# ─────────────────────────────────────────────
# Opción A — ruta absoluta (más seguro):
# PROJECT_ROOT = Path("/Users/tu_usuario/proyectos/grietas")
#
# Opción B — relativa al script (si lo pones en la raíz del proyecto):
PROJECT_ROOT = Path(__file__).parent.resolve()

# Directorio de respaldo antes de sobrescribir (recomendado)
BACKUP_DIR = PROJECT_ROOT / "_agent_backups"


# ─────────────────────────────────────────────
# Mapa de destinos según tipo de archivo
# ─────────────────────────────────────────────
DESTINOS = {
    # Extensión → carpeta relativa dentro del proyecto
    ".js":   "src",
    ".json": "src/data",
    ".md":   "docs",
    ".css":  "src",
}

# Subcarpetas conocidas del proyecto (para ubicar mejor los archivos)
SUBCARPETAS_JS = {
    "mission": "src/missions/data",
    "Mission": "src/missions/data",
    "Scene":   "src/scenes",
    "System":  "src/systems",
    "Entity":  "src/entities",
    "Component": "src/entities/components",
    "Echo":    "src/entities",
    "NPC":     "src/entities",
}


# ─────────────────────────────────────────────
# Utilidades
# ─────────────────────────────────────────────
def _hacer_backup(filepath: Path):
    """Copia el archivo existente a _agent_backups/ antes de sobrescribirlo."""
    if not filepath.exists():
        return
    BACKUP_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{filepath.stem}_{timestamp}{filepath.suffix}"
    backup_path = BACKUP_DIR / backup_name
    backup_path.write_text(filepath.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"  📦 Backup → {backup_path.relative_to(PROJECT_ROOT)}")


def _inferir_destino(nombre_archivo: str) -> Path:
    """
    Decide en qué carpeta del proyecto va el archivo
    basándose en su nombre y extensión.
    """
    ext = Path(nombre_archivo).suffix.lower()
    base = Path(nombre_archivo).stem

    # Para .js, usar subcarpeta según nombre de clase
    if ext == ".js":
        for patron, carpeta in SUBCARPETAS_JS.items():
            if patron in base:
                return PROJECT_ROOT / carpeta / nombre_archivo
        return PROJECT_ROOT / "src" / nombre_archivo

    # Para .json, casi siempre va a src/data
    if ext == ".json":
        if "dialogue" in nombre_archivo or "dialog" in nombre_archivo:
            return PROJECT_ROOT / "src" / "data" / nombre_archivo
        if "mission" in nombre_archivo:
            return PROJECT_ROOT / "src" / "missions" / "data" / nombre_archivo
        return PROJECT_ROOT / "src" / "data" / nombre_archivo

    # Para .md, va a docs/
    if ext == ".md":
        return PROJECT_ROOT / "docs" / nombre_archivo

    # Fallback
    carpeta = DESTINOS.get(ext, "src")
    return PROJECT_ROOT / carpeta / nombre_archivo


def _extraer_bloques_codigo(texto: str) -> list[dict]:
    """
    Extrae bloques de código del texto del Programador.
    Busca el patrón:
      ```[lenguaje] [nombre_archivo.ext]
      ...código...
      ```
    
    Ejemplo que el LLM debe generar:
      ```javascript mission_07_cemetery.js
      class Mission07Cemetery extends MissionBase {
        ...
      }
      ```
    """
    patron = r"```(\w+)\s+([\w./\-]+\.\w+)\n(.*?)```"
    matches = re.findall(patron, texto, re.DOTALL)

    bloques = []
    for lenguaje, nombre_archivo, codigo in matches:
        bloques.append({
            "lenguaje":       lenguaje,
            "nombre_archivo": nombre_archivo.strip(),
            "codigo":         codigo.strip(),
        })

    return bloques


def _extraer_flags_json(texto: str) -> dict | None:
    """
    Busca un bloque JSON de flags en la salida del Programador.
    El LLM debe generar algo como:
      ```json flags_nuevos.json
      { "mission_cemetery_active": { "type": "bool", "default": false, ... } }
      ```
    Si no encuentra bloque con nombre, busca el primer bloque json suelto.
    """
    # Primero intenta bloque nombrado
    patron_nombrado = r"```json\s+flags[\w./\-]*\.json\n(.*?)```"
    match = re.search(patron_nombrado, texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Si no, busca cualquier bloque ```json con estructura de flags
    patron_generico = r"```json\n(\{[^`]+\})\n```"
    for match in re.finditer(patron_generico, texto, re.DOTALL):
        try:
            data = json.loads(match.group(1))
            # Heurística: si tiene claves con "_active" o "_done", es flags
            if any("_active" in k or "_done" in k or "_found" in k for k in data.keys()):
                return data
        except json.JSONDecodeError:
            continue

    return None


# ─────────────────────────────────────────────
# Agente principal
# ─────────────────────────────────────────────
def agente_file_writer(state: dict) -> dict:
    """
    Parsea la salida del Programador y escribe los archivos
    resultantes en la carpeta real del proyecto.

    Compatible con GrietasState de grietas_agents.py.
    Añadir entre 'programador' y 'tester' en el grafo.
    """
    print("\n" + "═" * 60)
    print("📁  FILE WRITER — escribiendo archivos en el proyecto...")
    print(f"    Raíz del proyecto: {PROJECT_ROOT}")
    print("═" * 60)

    implementacion = state.get("implementacion", "")
    archivos_escritos = []
    errores = []

    if not implementacion:
        print("  ⚠️  No hay implementación del Programador todavía.")
        return {"archivos_escritos": [], "errores_escritura": ["Sin implementación"]}

    # 1. Extraer y escribir bloques de código
    bloques = _extraer_bloques_codigo(implementacion)

    if not bloques:
        print("  ⚠️  No se encontraron bloques de código con nombre de archivo.")
        print("     El Programador debe usar el formato:")
        print("     ```javascript NombreArchivo.js")
        print("     ...código...")
        print("     ```")
    else:
        for bloque in bloques:
            nombre = bloque["nombre_archivo"]
            codigo = bloque["codigo"]
            destino = _inferir_destino(nombre)

            try:
                destino.parent.mkdir(parents=True, exist_ok=True)
                _hacer_backup(destino)
                destino.write_text(codigo, encoding="utf-8")
                ruta_relativa = destino.relative_to(PROJECT_ROOT)
                print(f"  ✅ Escrito: {ruta_relativa}")
                archivos_escritos.append(str(ruta_relativa))
            except Exception as e:
                error = f"Error escribiendo {nombre}: {e}"
                print(f"  ❌ {error}")
                errores.append(error)

    # 2. Extraer y mergear flags en game_states
    flags = _extraer_flags_json(implementacion)
    if flags:
        _actualizar_game_states(flags, archivos_escritos, errores)

    # 3. Extraer y mergear diálogos en dialogues.json
    dialogos = _extraer_dialogos_json(implementacion)
    if dialogos:
        _actualizar_dialogos(dialogos, archivos_escritos, errores)

    # 4. Resumen
    print(f"\n  📊 Resumen: {len(archivos_escritos)} archivo(s) escritos, {len(errores)} error(es)")

    return {
        "archivos_escritos":  archivos_escritos,
        "errores_escritura":  errores,
    }


def _actualizar_game_states(flags_nuevos: dict, archivos_escritos: list, errores: list):
    """Mergea flags nuevos en src/data/world_flags.json (o lo crea)."""
    destino = PROJECT_ROOT / "src" / "data" / "world_flags.json"
    destino.parent.mkdir(parents=True, exist_ok=True)

    flags_existentes = {}
    if destino.exists():
        try:
            flags_existentes = json.loads(destino.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass

    _hacer_backup(destino)
    flags_existentes.update(flags_nuevos)

    try:
        destino.write_text(
            json.dumps(flags_existentes, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        ruta = destino.relative_to(PROJECT_ROOT)
        print(f"  ✅ Flags mergeados → {ruta} ({len(flags_nuevos)} nuevos)")
        archivos_escritos.append(str(ruta))
    except Exception as e:
        errores.append(f"Error actualizando flags: {e}")


def _extraer_dialogos_json(texto: str) -> dict | None:
    """Busca bloques JSON con estructura de diálogos."""
    patron = r"```json\n(\{[^`]+\})\n```"
    for match in re.finditer(patron, texto, re.DOTALL):
        try:
            data = json.loads(match.group(1))
            # Heurística: si tiene claves con "speaker" o "text", son diálogos
            primer_valor = next(iter(data.values()), {})
            if isinstance(primer_valor, dict) and (
                "speaker" in primer_valor or "text" in primer_valor
            ):
                return data
        except (json.JSONDecodeError, StopIteration):
            continue
    return None


def _actualizar_dialogos(dialogos_nuevos: dict, archivos_escritos: list, errores: list):
    """Mergea diálogos nuevos en src/data/dialogues.json."""
    destino = PROJECT_ROOT / "src" / "data" / "dialogues.json"
    destino.parent.mkdir(parents=True, exist_ok=True)

    dialogos_existentes = {}
    if destino.exists():
        try:
            dialogos_existentes = json.loads(destino.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass

    _hacer_backup(destino)
    dialogos_existentes.update(dialogos_nuevos)

    try:
        destino.write_text(
            json.dumps(dialogos_existentes, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        ruta = destino.relative_to(PROJECT_ROOT)
        print(f"  ✅ Diálogos mergeados → {ruta} ({len(dialogos_nuevos)} nuevos)")
        archivos_escritos.append(str(ruta))
    except Exception as e:
        errores.append(f"Error actualizando diálogos: {e}")


# ─────────────────────────────────────────────
# Modo standalone — para probar el parser solo
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("🧪 Prueba del File Writer con output simulado del Programador")
    print(f"   PROJECT_ROOT = {PROJECT_ROOT}\n")

    output_simulado = """
Aquí está la implementación para la Misión 07:

```javascript mission_07_cemetery.js
// missions/data/mission_07_cemetery.js
import { MissionBase } from '../MissionBase.js';
import { SaveSystem } from '../../core/SaveSystem.js';
import { EventBus } from '../../core/EventBus.js';

export class Mission07Cemetery extends MissionBase {
  constructor() {
    super({
      id: 'cemetery',
      title: 'El jardinero y su promesa',
      steps: [
        { description: 'Hablar con Diego sobre el cementerio' },
        { description: 'Encontrar la lápida del jardinero en zona antigua' },
        { description: 'Recoger las semillas en el Vacío del cementerio' },
        { description: 'Plantar las semillas junto a la lápida' },
      ]
    });
  }

  onEvent(eventName, data) {
    if (eventName === 'dialogue:completed'
        && data.npcId === 'diego'
        && data.topic === 'cemetery') {
      if (this.currentStep === 0) this.advanceStep();
    }
    if (eventName === 'item:picked' && data.itemId === 'gardener_seeds') {
      if (this.currentStep === 2) this.advanceStep();
    }
    if (eventName === 'item:used'
        && data.itemId === 'gardener_seeds'
        && data.targetId === 'lapida_jardinero') {
      if (this.currentStep === 3) this.advanceStep();
    }
  }
}
```

Los flags necesarios son:

```json flags_m07.json
{
  "mission_cemetery_active": {
    "type": "bool",
    "default": false,
    "description": "M07 activada",
    "set_by": "MissionManager",
    "read_by": ["DialogueSystem", "SaveSystem"]
  },
  "mission_cemetery_done": {
    "type": "bool",
    "default": false,
    "description": "M07 completada",
    "set_by": "MissionBase",
    "read_by": ["MissionManager", "EndingSystem"]
  },
  "gardener_seeds_found": {
    "type": "bool",
    "default": false,
    "description": "Semillas del jardinero recogidas en el Vacío",
    "set_by": "ItemSystem",
    "read_by": ["MissionManager"]
  }
}
```

Y los diálogos de inicio:

```json
{
  "gardener_echo_greeting": {
    "speaker": "Voz del viento",
    "portrait": "void_ambient",
    "text": "...las semillas... alguien tiene que plantar las semillas...",
    "next": "gardener_echo_01"
  },
  "gardener_echo_01": {
    "speaker": "Mateo",
    "portrait": "mateo_unsettled",
    "text": "¿Quién habla?",
    "next": "gardener_echo_02"
  },
  "gardener_echo_02": {
    "speaker": "Jardinero",
    "portrait": "gardener_echo",
    "text": "Prometí que el jardín no moriría. Todavía no puedo irme.",
    "next": null
  }
}
```
"""

    resultado = agente_file_writer({"implementacion": output_simulado})
    print("\nArchivos escritos:", resultado["archivos_escritos"])
    print("Errores:", resultado["errores_escritura"])