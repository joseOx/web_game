"""
GRIETAS — Herramientas reales de filesystem
============================================
Cada función acá es una Tool que los agentes pueden llamar
durante su razonamiento (ciclo ReAct: Reason → Act → Observe).

El agente decide cuándo y cómo usarlas — no hay parser frágil,
no hay "escribir al final": el agente lee, edita y verifica
en tiempo real igual que lo haría un desarrollador humano.
"""

import subprocess
from pathlib import Path
from langchain_core.tools import tool

PROJECT_ROOT = Path(__file__).parent.resolve()

def _ruta(path: str) -> Path:
    """Convierte path relativo en absoluto dentro del proyecto."""
    p = Path(path)
    if p.is_absolute():
        return p
    return (PROJECT_ROOT / path).resolve()

def _validar_ruta(path: Path) -> str | None:
    """Devuelve error si la ruta sale del proyecto."""
    try:
        path.resolve().relative_to(PROJECT_ROOT.resolve())
        return None
    except ValueError:
        return f"Ruta fuera del proyecto: {path}"


# ─────────────────────────────────────────────
# LECTURA
# ─────────────────────────────────────────────

@tool
def read_file(path: str) -> str:
    """
    Lee el contenido completo de un archivo del proyecto.
    Úsalo antes de editar — siempre revisá el contenido actual primero.

    Args:
        path: ruta relativa desde la raíz del proyecto (ej: 'src/missions/data/mission_01.js')
    """
    ruta = _ruta(path)
    err = _validar_ruta(ruta)
    if err:
        return f"ERROR: {err}"
    if not ruta.exists():
        return f"ERROR: El archivo no existe: {path}"
    try:
        contenido = ruta.read_text(encoding="utf-8")
        lineas = contenido.splitlines()
        # Numerar líneas para facilitar ediciones precisas
        numerado = "\n".join(f"{i+1:4d} | {l}" for i, l in enumerate(lineas))
        return f"=== {path} ({len(lineas)} líneas) ===\n{numerado}"
    except Exception as e:
        return f"ERROR leyendo {path}: {e}"


@tool
def list_files(directory: str = "", extension: str = "") -> str:
    """
    Lista archivos en una carpeta del proyecto.

    Args:
        directory: carpeta relativa (vacío = raíz del proyecto)
        extension: filtrar por extensión, ej: '.js', '.json' (vacío = todos)
    """
    carpeta = _ruta(directory) if directory else PROJECT_ROOT
    err = _validar_ruta(carpeta)
    if err:
        return f"ERROR: {err}"
    if not carpeta.exists():
        return f"ERROR: La carpeta no existe: {directory}"

    patron = f"**/*{extension}" if extension else "**/*"
    archivos = [
        p for p in sorted(carpeta.glob(patron))
        if p.is_file()
        and ".git" not in str(p)
        and "__pycache__" not in str(p)
        and "node_modules" not in str(p)
    ]

    if not archivos:
        return f"No se encontraron archivos en '{directory}' con extensión '{extension}'"

    lineas = []
    for a in archivos:
        rel = a.relative_to(PROJECT_ROOT)
        size = a.stat().st_size
        lineas.append(f"  {rel}  ({size:,} bytes)")

    return f"=== {len(archivos)} archivo(s) en '{directory or '.'}' ===\n" + "\n".join(lineas)


@tool
def search_in_files(pattern: str, directory: str = "src", extension: str = ".js") -> str:
    """
    Busca un patrón de texto en los archivos del proyecto.
    Muy útil para encontrar dónde está una función, flag o import específico.

    Args:
        pattern: texto a buscar (case-sensitive)
        directory: carpeta donde buscar (default: 'src')
        extension: extensión de archivos (default: '.js')
    """
    carpeta = _ruta(directory)
    err = _validar_ruta(carpeta)
    if err:
        return f"ERROR: {err}"

    resultados = []
    for archivo in sorted(carpeta.rglob(f"*{extension}")):
        if ".git" in str(archivo) or "__pycache__" in str(archivo):
            continue
        try:
            lineas = archivo.read_text(encoding="utf-8", errors="ignore").splitlines()
            for i, linea in enumerate(lineas, 1):
                if pattern in linea:
                    rel = archivo.relative_to(PROJECT_ROOT)
                    resultados.append(f"{rel}:{i}  {linea.strip()}")
        except Exception:
            continue

    if not resultados:
        return f"No se encontró '{pattern}' en {directory}/**/*{extension}"

    return f"=== {len(resultados)} ocurrencia(s) de '{pattern}' ===\n" + "\n".join(resultados[:50])


# ─────────────────────────────────────────────
# ESCRITURA
# ─────────────────────────────────────────────

@tool
def write_file(path: str, content: str) -> str:
    """
    Crea un archivo nuevo o sobreescribe uno existente con el contenido completo.
    Usá esto para crear archivos nuevos. Para modificar archivos existentes,
    preferí edit_file para cambios quirúrgicos.

    Args:
        path: ruta relativa del archivo a crear/sobreescribir
        content: contenido completo del archivo
    """
    ruta = _ruta(path)
    err = _validar_ruta(ruta)
    if err:
        return f"ERROR: {err}"

    accion = "Actualizado" if ruta.exists() else "Creado"
    try:
        ruta.parent.mkdir(parents=True, exist_ok=True)
        ruta.write_text(content, encoding="utf-8")
        lineas = content.count("\n") + 1
        return f"✅ {accion}: {path} ({lineas} líneas, {len(content):,} chars)"
    except Exception as e:
        return f"ERROR escribiendo {path}: {e}"


@tool
def edit_file(path: str, old_text: str, new_text: str) -> str:
    """
    Reemplaza una porción exacta de texto en un archivo existente.
    Ideal para modificar archivos sin reescribirlos completos.
    Leé el archivo primero con read_file para obtener el texto exacto.

    Args:
        path: ruta relativa del archivo
        old_text: texto EXACTO a reemplazar (incluyendo espacios e indentación)
        new_text: texto nuevo que reemplaza al anterior
    """
    ruta = _ruta(path)
    err = _validar_ruta(ruta)
    if err:
        return f"ERROR: {err}"
    if not ruta.exists():
        return f"ERROR: El archivo no existe: {path}"

    try:
        contenido = ruta.read_text(encoding="utf-8")
        if old_text not in contenido:
            # Ayuda al agente a diagnosticar
            primeras = old_text[:80].replace("\n", "\\n")
            return (
                f"ERROR: El texto a reemplazar no se encontró en {path}.\n"
                f"Buscado: '{primeras}...'\n"
                f"Revisá el archivo con read_file y copiá el texto exacto."
            )
        count = contenido.count(old_text)
        if count > 1:
            return (
                f"ERROR: El texto aparece {count} veces en {path}. "
                f"Hacé el fragmento más específico para que sea único."
            )
        nuevo = contenido.replace(old_text, new_text, 1)
        ruta.write_text(nuevo, encoding="utf-8")
        return f"✅ Editado: {path} — reemplazo aplicado correctamente"
    except Exception as e:
        return f"ERROR editando {path}: {e}"


@tool
def append_to_file(path: str, content: str) -> str:
    """
    Agrega contenido al final de un archivo existente.
    Útil para añadir entradas a dialogues.json, flags, etc.

    Args:
        path: ruta relativa del archivo
        content: texto a agregar al final
    """
    ruta = _ruta(path)
    err = _validar_ruta(ruta)
    if err:
        return f"ERROR: {err}"
    if not ruta.exists():
        return f"ERROR: El archivo no existe. Usá write_file para crearlo: {path}"

    try:
        with open(ruta, "a", encoding="utf-8") as f:
            f.write(content)
        return f"✅ Contenido agregado al final de: {path}"
    except Exception as e:
        return f"ERROR en append_to_file {path}: {e}"


@tool
def delete_file(path: str) -> str:
    """
    Elimina un archivo del proyecto.
    Usá con cuidado — el cambio queda registrado en git.

    Args:
        path: ruta relativa del archivo a eliminar
    """
    ruta = _ruta(path)
    err = _validar_ruta(ruta)
    if err:
        return f"ERROR: {err}"
    if not ruta.exists():
        return f"El archivo ya no existe: {path}"

    try:
        ruta.unlink()
        return f"✅ Eliminado: {path}"
    except Exception as e:
        return f"ERROR eliminando {path}: {e}"


# ─────────────────────────────────────────────
# GIT
# ─────────────────────────────────────────────

@tool
def run_git(command: str) -> str:
    """
    Ejecuta un comando git en el proyecto.
    Comandos seguros: status, diff, log, add, commit, checkout, branch.
    NO usar: push, pull, reset --hard, rebase (requieren confirmación manual).

    Args:
        command: comando git sin el prefijo 'git', ej: 'status', 'diff src/', 'add src/missions/'
    """
    COMANDOS_PELIGROSOS = ["push", "pull", "reset --hard", "rebase", "merge", "force"]
    if any(c in command for c in COMANDOS_PELIGROSOS):
        return f"ERROR: '{command}' requiere confirmación manual. Hacelo vos directamente."

    try:
        resultado = subprocess.run(
            ["git"] + command.split(),
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=15,
        )
        salida = resultado.stdout or resultado.stderr or "(sin salida)"
        if resultado.returncode != 0:
            return f"git {command} falló (código {resultado.returncode}):\n{salida}"
        return f"git {command}:\n{salida}"
    except subprocess.TimeoutExpired:
        return f"ERROR: git {command} tardó demasiado (timeout 15s)"
    except Exception as e:
        return f"ERROR ejecutando git {command}: {e}"


# ─────────────────────────────────────────────
# Lista exportable de todas las tools
# ─────────────────────────────────────────────
ALL_TOOLS = [
    read_file,
    list_files,
    search_in_files,
    write_file,
    edit_file,
    append_to_file,
    delete_file,
    run_git,
]
