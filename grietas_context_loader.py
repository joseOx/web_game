"""
GRIETAS — Context Loader
=========================
Lee los archivos reales de tu proyecto y construye el contexto
que los agentes reciben. Así trabajan sobre el código ACTUAL,
no sobre una descripción desactualizada.

Qué lee:
  - Todos los .js de src/          (código fuente real)
  - src/data/dialogues.json        (diálogos existentes)
  - src/data/world_flags.json      (flags existentes)
  - src/missions/data/*.js         (misiones existentes)
  - Los .md de docs/ o raíz        (lore, diseño, arquitectura)

El resultado es un string listo para pegar en CONTEXTO_GRIETAS.
"""

import os
from pathlib import Path

# ─────────────────────────────────────────────
# Configuración
# ─────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.resolve()

# Carpetas y archivos que SÍ se leen
INCLUDE_DIRS = [
    "src/missions/data",   # misiones — muy importante
    "src/core",            # sistemas core
    "src/systems",         # sistemas de juego
    "src/entities",        # entidades
    "src/world",           # dimensiones, grietas
    "src/data",            # JSON de diálogos y flags
]

INCLUDE_DOCS = [
    # .md en la raíz o en docs/
    "grietas_lore.md",
    "level_design.md",
    "game_states.md",
    "dialogue_trees.md",
    "arquitectura_tecnica.md",
    "docs/grietas_lore.md",
    "docs/level_design.md",
    "docs/game_states.md",
    "docs/dialogue_trees.md",
    "docs/arquitectura_tecnica.md",
]

# Archivos/carpetas que se ignoran
EXCLUDE_PATTERNS = [
    "__pycache__", ".git", "node_modules",
    "_agent_backups", ".env",
    "grietas_agents", "grietas_file_writer", "grietas_context_loader",
]

# Límite de tamaño por archivo para no saturar el contexto (en caracteres)
MAX_CHARS_PER_FILE = 8_000
# Límite total del contexto completo
MAX_CHARS_TOTAL = 80_000


# ─────────────────────────────────────────────
# Funciones de lectura
# ─────────────────────────────────────────────

def _debe_excluir(path: Path) -> bool:
    return any(pat in str(path) for pat in EXCLUDE_PATTERNS)


def _leer_archivo(path: Path) -> str | None:
    """Lee un archivo y lo trunca si es muy grande."""
    try:
        contenido = path.read_text(encoding="utf-8", errors="ignore")
        if len(contenido) > MAX_CHARS_PER_FILE:
            contenido = contenido[:MAX_CHARS_PER_FILE] + f"\n... [truncado — {path.name} tiene más contenido]"
        return contenido
    except Exception:
        return None


def _leer_directorio(rel_dir: str) -> list[dict]:
    """Lee todos los .js y .json de una carpeta."""
    carpeta = PROJECT_ROOT / rel_dir
    if not carpeta.exists():
        return []

    archivos = []
    for ext in ("*.js", "*.json"):
        for path in sorted(carpeta.glob(ext)):
            if _debe_excluir(path):
                continue
            contenido = _leer_archivo(path)
            if contenido:
                archivos.append({
                    "ruta": str(path.relative_to(PROJECT_ROOT)),
                    "contenido": contenido,
                })
    return archivos


def _leer_docs() -> list[dict]:
    """Lee los archivos .md de documentación."""
    docs = []
    for nombre in INCLUDE_DOCS:
        path = PROJECT_ROOT / nombre
        if path.exists() and not _debe_excluir(path):
            contenido = _leer_archivo(path)
            if contenido:
                docs.append({
                    "ruta": str(path.relative_to(PROJECT_ROOT)),
                    "contenido": contenido,
                })
    return docs


# ─────────────────────────────────────────────
# Constructor del contexto
# ─────────────────────────────────────────────

def construir_contexto(verbose: bool = True) -> str:
    """
    Lee el proyecto real y devuelve el string de contexto
    para pasar a los agentes.

    Args:
        verbose: si True, imprime qué archivos cargó.

    Returns:
        String con todo el contexto del proyecto.
    """
    secciones = []
    total_chars = 0

    # 1. Documentación y lore (va primero — máxima prioridad)
    docs = _leer_docs()
    if docs:
        secciones.append("=" * 60)
        secciones.append("DOCUMENTACIÓN DEL PROYECTO (lore, diseño, arquitectura)")
        secciones.append("=" * 60)
        for doc in docs:
            bloque = f"\n--- {doc['ruta']} ---\n{doc['contenido']}"
            secciones.append(bloque)
            total_chars += len(bloque)
            if verbose:
                print(f"  📄 {doc['ruta']} ({len(doc['contenido'])} chars)")
            if total_chars >= MAX_CHARS_TOTAL:
                secciones.append("\n[Contexto truncado por límite de tokens]")
                return "\n".join(secciones)

    # 2. Misiones existentes (segunda prioridad — los agentes deben conocerlas)
    secciones.append("\n" + "=" * 60)
    secciones.append("CÓDIGO FUENTE — MISIONES EXISTENTES")
    secciones.append("=" * 60)

    misiones = _leer_directorio("src/missions/data")
    if misiones:
        for m in misiones:
            bloque = f"\n--- {m['ruta']} ---\n```javascript\n{m['contenido']}\n```"
            secciones.append(bloque)
            total_chars += len(bloque)
            if verbose:
                print(f"  🎯 {m['ruta']} ({len(m['contenido'])} chars)")
            if total_chars >= MAX_CHARS_TOTAL:
                secciones.append("\n[Contexto truncado]")
                return "\n".join(secciones)
    else:
        secciones.append("(No se encontraron archivos de misiones en src/missions/data/)")

    # 3. Datos JSON — diálogos y flags
    secciones.append("\n" + "=" * 60)
    secciones.append("DATOS JSON — DIÁLOGOS Y FLAGS ACTUALES")
    secciones.append("=" * 60)

    datos = _leer_directorio("src/data")
    for d in datos:
        bloque = f"\n--- {d['ruta']} ---\n```json\n{d['contenido']}\n```"
        secciones.append(bloque)
        total_chars += len(bloque)
        if verbose:
            print(f"  📊 {d['ruta']} ({len(d['contenido'])} chars)")
        if total_chars >= MAX_CHARS_TOTAL:
            secciones.append("\n[Contexto truncado]")
            return "\n".join(secciones)

    # 4. Sistemas core (referencia para el Programador)
    for rel_dir in ["src/core", "src/systems", "src/world", "src/entities"]:
        archivos = _leer_directorio(rel_dir)
        if not archivos:
            continue

        secciones.append(f"\n" + "=" * 60)
        secciones.append(f"CÓDIGO FUENTE — {rel_dir.upper()}")
        secciones.append("=" * 60)

        for f in archivos:
            bloque = f"\n--- {f['ruta']} ---\n```javascript\n{f['contenido']}\n```"
            secciones.append(bloque)
            total_chars += len(bloque)
            if verbose:
                print(f"  ⚙️  {f['ruta']} ({len(f['contenido'])} chars)")
            if total_chars >= MAX_CHARS_TOTAL:
                secciones.append("\n[Contexto truncado — proyecto muy grande]")
                return "\n".join(secciones)

    if verbose:
        print(f"\n  Total contexto: {total_chars:,} chars")

    if not secciones or total_chars < 100:
        return _contexto_fallback()

    return "\n".join(secciones)


def _contexto_fallback() -> str:
    """
    Contexto de respaldo si no se encuentra nada en el disco.
    Útil cuando los archivos aún no existen o la ruta es incorrecta.
    """
    return """
GRIETAS — Juego 2D web en HTML5/Canvas/JavaScript (contexto de respaldo)

PROTAGONISTAS:
- Mateo: niño de 12 años, protagonista jugable. Vive con su abuela Rosa.
- Luna: gata con poderes dimensionales. Ronronea para sellar Grietas.

MUNDO:
- Pueblo costero de Miraloma. Dos dimensiones:
  · Mundo Real: cálido, normal
  · El Vacío: paleta desaturada/violeta, gravedad 0.8
- Las Grietas conectan ambas dimensiones. Cada Grieta = historia emocional humana.
- Los Ecos: emociones atrapadas de personas fallecidas.

MISIONES EXISTENTES (M01–M06):
  M01 - El farero y su faro
  M02 - La melodía incompleta
  M03 - El jardín de los recuerdos
  M04 - Perros y sombras
  M05 - Los hermanos
  M06 - La biblioteca

SISTEMAS: MissionManager, DialogueSystem, BondSystem, SaveSystem, VisionSystem
STACK: JavaScript ES2022, HTML5 Canvas, sin frameworks externos
ARQUITECTURA: Entity + Components, EventBus, SceneManager
"""


# ─────────────────────────────────────────────
# Diagnóstico — qué encuentra en el proyecto
# ─────────────────────────────────────────────

def diagnosticar() -> None:
    """
    Imprime un resumen de qué archivos se encontraron
    sin construir el contexto completo. Útil para verificar
    que el script está apuntando al proyecto correcto.
    """
    print(f"\n🔍 DIAGNÓSTICO — {PROJECT_ROOT}")
    print("─" * 50)

    # Docs
    docs_encontrados = [
        PROJECT_ROOT / d for d in INCLUDE_DOCS
        if (PROJECT_ROOT / d).exists()
    ]
    print(f"\n📄 Documentación: {len(docs_encontrados)} archivo(s)")
    for d in docs_encontrados:
        print(f"   ✅ {d.relative_to(PROJECT_ROOT)}")
    faltantes = [d for d in INCLUDE_DOCS if not (PROJECT_ROOT / d).exists()]
    for d in faltantes[:3]:
        print(f"   ❌ {d} (no encontrado)")

    # Código
    print(f"\n⚙️  Carpetas de código:")
    for rel_dir in INCLUDE_DIRS:
        carpeta = PROJECT_ROOT / rel_dir
        if carpeta.exists():
            archivos = list(carpeta.glob("*.js")) + list(carpeta.glob("*.json"))
            archivos = [a for a in archivos if not _debe_excluir(a)]
            print(f"   ✅ {rel_dir}/ — {len(archivos)} archivo(s)")
        else:
            print(f"   ❌ {rel_dir}/ — carpeta no existe todavía")

    print(f"\n💡 Si ves muchos ❌, asegúrate de que PROJECT_ROOT apunta")
    print(f"   a la raíz de tu proyecto Grietas.")
    print(f"   Actualmente apunta a: {PROJECT_ROOT}")


# ─────────────────────────────────────────────
# Modo standalone — probar el loader solo
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("GRIETAS — Context Loader")
    print("=" * 60)

    diagnosticar()

    respuesta = input("\n¿Construir el contexto completo? (s/n): ").strip().lower()
    if respuesta == "s":
        print("\n📦 Cargando archivos del proyecto...\n")
        contexto = construir_contexto(verbose=True)
        print(f"\n{'─'*50}")
        print(f"Contexto listo: {len(contexto):,} caracteres")
        print(f"Primeros 500 chars:")
        print(contexto[:500])