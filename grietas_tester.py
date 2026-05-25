"""
GRIETAS — Sistema de 4 Agentes Tester (QA automatizado)
=========================================================
Audita el proyecto completo en búsqueda de inconsistencias y las corrige.

Pipeline:
  datos → zonas → misiones → coherencia

Cada agente lee archivos reales, detecta issues y los corrige con edit_file.
Al final emite un veredicto: APROBADO o REQUIERE_REVISION con lista de issues.

Uso:
  python grietas_tester.py
  → Ingresá el scope (all | datos | zonas | misiones | coherencia | <zone_id>)
"""

import os
import re
import datetime
from typing import TypedDict

from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.outputs import ChatResult
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent

from grietas_tools import ALL_TOOLS, PROJECT_ROOT

load_dotenv()

# ─────────────────────────────────────────────
# LLM — idéntico a grietas_react.py
# ─────────────────────────────────────────────

THINKING_EFFORT = os.getenv("DEEPSEEK_THINKING_EFFORT", "none").lower()


class _DeepSeekThinkingChat(ChatOpenAI):
    """ChatOpenAI con soporte completo de multi-turn para el modo thinking de DeepSeek."""

    def _create_chat_result(self, response, generation_info=None) -> ChatResult:
        result = super()._create_chat_result(response, generation_info)
        for i, choice in enumerate(response.choices):
            rc = getattr(choice.message, "reasoning_content", None)
            if not rc:
                rc = (getattr(choice.message, "model_extra", None) or {}).get("reasoning_content")
            if rc and i < len(result.generations):
                msg = result.generations[i].message
                if hasattr(msg, "additional_kwargs"):
                    msg.additional_kwargs.setdefault("reasoning_content", rc)
        return result

    def _get_request_payload(self, input_messages, *, stop=None, **kwargs):
        payload = super()._get_request_payload(input_messages, stop=stop, **kwargs)
        msg_dicts = payload.get("messages", [])
        for i, msg_dict in enumerate(msg_dicts):
            if (isinstance(msg_dict, dict)
                    and msg_dict.get("role") == "assistant"
                    and "reasoning_content" not in msg_dict
                    and i < len(input_messages)):
                rc = getattr(input_messages[i], "additional_kwargs", {}).get("reasoning_content")
                if rc:
                    msg_dict["reasoning_content"] = rc
        return payload


_llm_kwargs = dict(
    model=os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com/v1",
    temperature=0.2,  # más bajo para análisis determinista
)

if THINKING_EFFORT != "none":
    llm_agente = _DeepSeekThinkingChat(
        **_llm_kwargs,
        model_kwargs={"reasoning_effort": THINKING_EFFORT},
    )
else:
    llm_agente = ChatOpenAI(**_llm_kwargs)


# ─────────────────────────────────────────────
# Estado del grafo
# ─────────────────────────────────────────────

class TestState(TypedDict):
    scope:              str   # "all" | "datos" | "zonas" | "misiones" | "coherencia" | "bug" | zone_id
    bug_description:    str   # descripción libre del bug (solo cuando scope="bug")
    reporte_datos:      str
    reporte_zonas:      str
    reporte_misiones:   str
    reporte_coherencia: str
    reporte_bug:        str
    issues_total:       int
    aprobado:           bool


# ─────────────────────────────────────────────
# Constantes del proyecto
# ─────────────────────────────────────────────

ZONE_IDS = [
    "R_HOME", "R_HOME_ATTIC", "R_HUB", "R_LIGHTHOUSE", "R_SCHOOL",
    "R_BEACH", "R_CEMETERY", "R_LIBRARY", "R_CHAPTER0_HOUSE", "R_CHAPTER0_GARDEN",
    "V_HOME", "V_HUB", "V_LIGHTHOUSE", "V_SCHOOL", "V_BEACH",
    "V_CEMETERY", "V_LIBRARY", "V_UMBRAL",
]

MISSION_IDS = [
    "lighthouse", "melody", "garden", "dogs",
    "brothers", "library", "cemetery_child", "umbral_espejo",
]

EVENTBUS_EVENTS = [
    "dimension:changed", "rift:sealed", "dialogue:node_exit", "dialogue:node_enter",
    "echo:separated", "item:picked", "item:combined",
    "mission:completed", "mission:activated", "mission:step", "mission:failed",
    "zone:loaded", "zone:exited", "zone:transition",
    "piano:melody_complete", "heart_anchor:unlocked",
    "ending:triggered", "ending:show_screen", "luna:called",
]

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _parse_issues(report: str) -> int:
    """Extrae el N de la línea 'ISSUES ENCONTRADOS: N'."""
    match = re.search(r'ISSUES ENCONTRADOS:\s*(\d+)', report, re.IGNORECASE)
    return int(match.group(1)) if match else 0


def _scope_applies(scope: str, agent_name: str) -> bool:
    """Determina si un agente debe ejecutarse según el scope elegido."""
    if scope in ("all", agent_name):
        return True
    # zona específica → solo agentes de zonas + coherencia
    if scope in ZONE_IDS:
        return agent_name in ("zonas", "coherencia")
    return False


def crear_agente(system_prompt: str):
    return create_react_agent(
        model=llm_agente,
        tools=ALL_TOOLS,
        prompt=SystemMessage(content=system_prompt),
    )


# ─────────────────────────────────────────────
# Contexto base compartido por todos los agentes
# ─────────────────────────────────────────────

CONTEXTO_BASE = f"""
Proyecto: GRIETAS — juego 2D web, HTML5/Canvas/JavaScript ES2022.
Raíz del proyecto: {PROJECT_ROOT}

Eres un agente QA con acceso completo al filesystem del proyecto.
Tu misión: leer archivos reales, detectar inconsistencias, y corregirlas con edit_file.

ZONAS REGISTRADAS ({len(ZONE_IDS)}):
  {', '.join(ZONE_IDS)}

IDs DE MISIÓN ({len(MISSION_IDS)}):
  {', '.join(MISSION_IDS)}

EVENTOS CONOCIDOS DE EVENTBUS:
  {', '.join(EVENTBUS_EVENTS)}

PATRÓN AUTO-FLAGS DE MISSIONBASE:
  Al activarse una misión con id='lighthouse' → setea flag: mission_lighthouse_active
  Al completarse → setea flag: mission_lighthouse_done
  Aplica a todos los IDs de misión listados arriba.

ARCHIVOS CLAVE:
  assets/data/dialogues.json        — nodos de diálogo (id, text, next, choices, actions)
  src/missions/MissionBase.js       — clase base de misiones
  src/missions/MissionManager.js    — registro y despacho
  src/missions/data/mission_*.js    — 8 archivos de misión
  src/world/zones/Zone*.js          — 18 archivos de definición de zona
  src/main.js                       — wiring de EventBus, registro de zonas y misiones

REGLAS DE REPORTE (OBLIGATORIAS):
  - Cada issue en formato: [ISSUE-NN] TIPO: descripción
    Tipos válidos: BUG (error real), WARNING (posible problema), INFO (observación)
  - Las correcciones que hagas: [FIX-NN] descripción de lo que corregiste
  - Última línea de tu respuesta SIEMPRE: "ISSUES ENCONTRADOS: N"
    donde N es el total de BUGs (no incluir WARNINGs ni INFOs en el conteo)

ANTES de editar cualquier archivo, SIEMPRE leelo con read_file primero.
SIEMPRE verificá con search_in_files antes de asumir que un ID no existe.
"""

# ─────────────────────────────────────────────
# System prompts de cada agente
# ─────────────────────────────────────────────

SYSTEM_DATOS = f"""
{CONTEXTO_BASE}

Eres el Auditor de Datos de GRIETAS. Tu foco: assets/data/dialogues.json

PASOS:
1. Lee assets/data/dialogues.json completo con read_file.
2. Verifica CADA nodo del JSON:
   a) Tiene campo "id" no vacío y campo "text" no vacío.
   b) Si tiene "next" (no null), ese ID existe como otro nodo en el archivo.
   c) Si tiene "choices", cada choice.next existe como nodo en el archivo.
   d) Si tiene "condition", usa el formato "flag:nombre_del_flag" (snake_case).
   e) Ningún nodo tiene acciones inválidas (campos desconocidos en "actions").
3. Detecta IDs duplicados (el último gana en JSON, pero es un bug latente).
4. Detecta nodos huérfanos: nodos que ningún otro nodo referencia como next/choices.next.
   → Reportar como [ISSUE-NN] WARNING (no son BUG, pero son ruido).
5. Si encontrás referencias rotas (next apunta a un ID inexistente):
   → Si el ID parece un typo obvio, corrígelo con edit_file.
   → Si no está claro, reportalo como BUG y dejalo marcado.
6. Al finalizar: escribe exactamente "ISSUES ENCONTRADOS: N" donde N = total de BUGs.
"""

SYSTEM_ZONAS = f"""
{CONTEXTO_BASE}

Eres el Auditor de Zonas de GRIETAS. Tu foco: los 18 archivos en src/world/zones/

PASOS:
1. Lista los archivos con list_files("src/world/zones", ".js").
2. Para CADA archivo de zona (o solo el del scope si es un zone_id específico):
   a) Lee el archivo con read_file.
   b) Verifica cada EXIT:
      - exit.targetZone está en la lista de ZONAS REGISTRADAS.
      - exit.targetSpawn existe en el spawns dict de la targetZone
        (para verificar: lee el archivo de la targetZone).
   c) Verifica cada NPC:
      - npc.dialogueId existe en assets/data/dialogues.json
        (usa search_in_files para buscar el ID).
   d) Verifica cada ECHO:
      - echo.dialogueId (si existe) está en dialogues.json.
      - echo.spawnFlag sigue el patrón mission_{{id}}_active (donde id es un mission ID conocido).
      - echo.doneFlag sigue el patrón mission_{{id}}_done.
   e) Verifica cada RIFT:
      - No hay dos rifts con el mismo id dentro de la misma zona.
      - Si el comentario del rift dice "no visible en mundo real" o "forceHidden",
        verifica que tenga forceHiddenInReal: true (no false).
   f) Verifica OBJECTS/ITEMS:
      - object.dialogueId existe en dialogues.json si está definido.
3. Corrige con edit_file:
   - Spawns faltantes (agrega el spawn con coordenadas razonables al archivo destino).
   - forceHiddenInReal: false → true cuando el comentario indica que debería ser hidden.
   - Propiedades duplicadas (solidChars definido dos veces, etc.).
4. Lee assets/data/dialogues.json una vez al inicio para tener todos los IDs en memoria.
5. Al finalizar: "ISSUES ENCONTRADOS: N"
"""

SYSTEM_MISIONES = f"""
{CONTEXTO_BASE}

Eres el Auditor de Misiones de GRIETAS. Tu foco: src/missions/data/

PASOS:
1. Lee src/missions/MissionBase.js para entender la clase base y sus métodos.
2. Lista los archivos con list_files("src/missions/data", ".js").
3. Para CADA archivo de misión:
   a) Lee el archivo con read_file.
   b) Verifica que la clase extiende MissionBase con el import correcto.
   c) Verifica que el constructor llama a super({{id, title, steps: [{{description}}...]}}).
      - Todos los steps tienen campo "description" no vacío.
   d) Verifica el método onEvent (o equivalente):
      - Todos los eventos en switch/if pertenecen a EVENTOS CONOCIDOS DE EVENTBUS.
      - Para "dialogue:node_exit": data.nodeId existe en assets/data/dialogues.json
        (usa search_in_files para verificar).
      - Para "rift:sealed": data.riftId existe en algún archivo de zona
        (usa search_in_files en src/world/zones).
      - Para "zone:loaded": data.zoneId está en la lista de ZONAS REGISTRADAS.
      - Para "item:picked": data.itemId referencia un item que existe en alguna zona.
   e) Verifica flags:
      - setFlag y getFlag usan snake_case (sin camelCase, sin mayúsculas, sin espacios).
      - Los flags de la misión no colisionan con los de otras misiones.
4. Lee assets/data/dialogues.json una vez para verificar nodeIds.
5. Usa search_in_files para detectar flags duplicados entre misiones.
6. Corrige typos en nodeIds, riftIds, zoneIds si el error es obvio.
7. Al finalizar: "ISSUES ENCONTRADOS: N"

Reportes anteriores de contexto:
  Datos: {{reporte_datos_resumen}}
  Zonas: {{reporte_zonas_resumen}}
"""

SYSTEM_BUG = f"""
{CONTEXTO_BASE}

Eres el Investigador de Bugs de GRIETAS. Se te ha proporcionado una descripción de un bug
o comportamiento inesperado reportado por el desarrollador.

Tu misión: investigar la causa raíz del bug en el código fuente y, si es posible, corregirlo.

PASOS:
1. Lee con atención la descripción del bug.
2. Identificá qué sistemas, zonas o archivos podrían estar involucrados.
3. Leé los archivos relevantes con read_file. Empezá por los más probables según el síntoma:
   - Bug visual o de movimiento → src/entities/, src/systems/, src/main.js
   - Bug de diálogo             → assets/data/dialogues.json, src/ui/DialogueSystem.js
   - Bug de misión              → src/missions/data/, src/missions/MissionBase.js
   - Bug de zona o transición   → src/world/zones/, src/world/SceneManager.js
   - Bug de EchoBound/ecos      → src/entities/EchoBound.js, src/systems/EchoBoundAI.js
   - Bug de sprite o render     → src/entities/NPC.js, src/entities/Player.js, src/main.js
4. Usá search_in_files para localizar código sospechoso (flags, IDs, nombres de función).
5. Analizá el flujo de datos y eventos que reproduce el bug.
6. Si encontrás el problema:
   - Corregilo con edit_file si la corrección es segura y acotada.
   - Reportalo como [ISSUE-01] BUG con causa raíz y solución propuesta si no podés corregirlo.
7. Si no encontrás el problema:
   - Reportá qué investigaste, qué descartaste, y qué queda pendiente de verificar.
8. Al finalizar: "ISSUES ENCONTRADOS: N" donde N = BUGs confirmados (0 si se corrigió todo).

IMPORTANTE: Siempre leé el archivo COMPLETO antes de sugerir o aplicar una corrección.
No editás sin leer primero. No asumás — verificá con search_in_files.
"""

SYSTEM_COHERENCIA = f"""
{CONTEXTO_BASE}

Eres el Auditor de Coherencia de GRIETAS. Tu foco: src/main.js y coherencia cruzada.

PASOS:
1. Lee src/main.js completo con read_file (puede ser largo — leelo entero).
2. Verifica REGISTRO DE ZONAS:
   - Cada ZoneXxx importada en main.js está registrada con scenes.register(...).
   - Cada scenes.register(...) tiene un archivo Zone*.js correspondiente.
3. Verifica REGISTRO DE MISIONES:
   - Cada misión importada está registrada con missions.register(...).
   - El número de importaciones coincide con el de registros.
4. Verifica SPAWNFLAGS/DONEFLAGS cruzados:
   - Para cada echo en zonas con spawnFlag=mission_X_active:
     la misión con id=X existe en src/missions/data/.
   - Para cada echo con doneFlag=mission_X_done: idem.
   (Usa search_in_files para encontrar todos los spawnFlag/doneFlag en zonas.)
5. Verifica RIFT SEALED FLAGS:
   - Las misiones que usan data.riftId al sellar usan el flag rift_{{riftId}}_sealed.
   - Verifica que ese patrón coincide con lo que SceneManager / RiftSystem espera.
   (Busca con search_in_files "rift_" en src/missions/ y src/world/.)
6. Verifica DIALOGUE.START en main.js:
   - Cada dialogue.start('node_id') referencia un nodo que existe en dialogues.json.
   (Usa search_in_files "dialogue.start" en main.js, luego verifica cada nodeId.)
7. Verifica EVENTBUS WIRING:
   - Eventos emitidos por misiones (events.emit) tienen al menos un listener (events.on)
     en main.js u otro sistema.
8. Corrige lo que puedas con edit_file.
9. Emite veredicto final:
   - Si issues_total_acumulado == 0: "VEREDICTO: APROBADO"
   - Si no: "VEREDICTO: REQUIERE_REVISION" seguido de lista de issues sin corregir.
10. Al finalizar: "ISSUES ENCONTRADOS: N" (solo los de este agente, no acumulado)

Reportes anteriores:
  Datos: {{reporte_datos_resumen}}
  Zonas: {{reporte_zonas_resumen}}
  Misiones: {{reporte_misiones_resumen}}
"""


# ─────────────────────────────────────────────
# Nodos del grafo
# ─────────────────────────────────────────────

def _omitido() -> dict:
    return {"issues_total": 0}  # placeholder, no suma nada


def nodo_datos(state: TestState) -> dict:
    if not _scope_applies(state["scope"], "datos"):
        return {"reporte_datos": "(omitido por scope)"}

    print("\n" + "═" * 60)
    print("📊  AUDITOR DE DATOS — revisando dialogues.json...")
    print("═" * 60)

    agente = crear_agente(SYSTEM_DATOS)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Scope: {state['scope']}\n"
            "Ejecuta la auditoría completa de assets/data/dialogues.json. "
            "Lee el archivo, verifica todos los nodos, corrige lo que puedas, "
            "y termina con 'ISSUES ENCONTRADOS: N'."
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    issues = _parse_issues(respuesta)
    return {
        "reporte_datos":  respuesta,
        "issues_total":   state.get("issues_total", 0) + issues,
    }


def nodo_zonas(state: TestState) -> dict:
    if not _scope_applies(state["scope"], "zonas"):
        return {"reporte_zonas": "(omitido por scope)"}

    print("\n" + "═" * 60)
    print("🗺️   AUDITOR DE ZONAS — revisando Zone*.js...")
    print("═" * 60)

    scope_hint = (
        f"Foco específico en zona: {state['scope']}"
        if state["scope"] in ZONE_IDS
        else "Auditoría completa de todas las zonas."
    )

    agente = crear_agente(SYSTEM_ZONAS)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Scope: {state['scope']}\n"
            f"{scope_hint}\n"
            "Ejecuta la auditoría de zonas, verifica exits/spawns/dialogueIds/rifts/flags, "
            "corrige lo que puedas, y termina con 'ISSUES ENCONTRADOS: N'.\n\n"
            f"Contexto del agente anterior (datos):\n"
            f"{state.get('reporte_datos', '')[:500]}"
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    issues = _parse_issues(respuesta)
    return {
        "reporte_zonas": respuesta,
        "issues_total":  state.get("issues_total", 0) + issues,
    }


def nodo_misiones(state: TestState) -> dict:
    if not _scope_applies(state["scope"], "misiones"):
        return {"reporte_misiones": "(omitido por scope)"}

    print("\n" + "═" * 60)
    print("🎯  AUDITOR DE MISIONES — revisando mission_*.js...")
    print("═" * 60)

    system_misiones_final = SYSTEM_MISIONES.replace(
        "{reporte_datos_resumen}",
        state.get("reporte_datos", "")[:300] or "no ejecutado",
    ).replace(
        "{reporte_zonas_resumen}",
        state.get("reporte_zonas", "")[:300] or "no ejecutado",
    )

    agente = crear_agente(system_misiones_final)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Scope: {state['scope']}\n"
            "Audita los 8 archivos de misión. Verifica herencia, eventos, nodeIds, "
            "riftIds, zoneIds, flags en snake_case y sin duplicados. "
            "Corrige lo que puedas y termina con 'ISSUES ENCONTRADOS: N'."
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    issues = _parse_issues(respuesta)
    return {
        "reporte_misiones": respuesta,
        "issues_total":     state.get("issues_total", 0) + issues,
    }


def nodo_coherencia(state: TestState) -> dict:
    if not _scope_applies(state["scope"], "coherencia"):
        return {
            "reporte_coherencia": "(omitido por scope)",
            "aprobado": True,
        }

    print("\n" + "═" * 60)
    print("🔗  AUDITOR DE COHERENCIA — revisando main.js y cross-refs...")
    print("═" * 60)

    system_coh_final = SYSTEM_COHERENCIA.replace(
        "{reporte_datos_resumen}",
        state.get("reporte_datos", "")[:200] or "no ejecutado",
    ).replace(
        "{reporte_zonas_resumen}",
        state.get("reporte_zonas", "")[:200] or "no ejecutado",
    ).replace(
        "{reporte_misiones_resumen}",
        state.get("reporte_misiones", "")[:200] or "no ejecutado",
    )

    acumulado = state.get("issues_total", 0)

    agente = crear_agente(system_coh_final)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Scope: {state['scope']}\n"
            f"Issues acumulados de agentes anteriores: {acumulado}\n"
            "Audita src/main.js: registro de zonas/misiones, spawnFlags/doneFlags, "
            "rift sealed flags, dialogue.start nodeIds, EventBus wiring. "
            "Corrige lo que puedas. "
            "Termina con el veredicto APROBADO o REQUIERE_REVISION "
            "y 'ISSUES ENCONTRADOS: N' (solo los de este agente)."
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    issues = _parse_issues(respuesta)
    total = acumulado + issues
    aprobado = total == 0 and "REQUIERE_REVISION" not in respuesta.upper()

    return {
        "reporte_coherencia": respuesta,
        "issues_total":       total,
        "aprobado":           aprobado,
    }


def nodo_bug(state: TestState) -> dict:
    if not _scope_applies(state["scope"], "bug"):
        return {"reporte_bug": "(omitido por scope)"}

    print("\n" + "═" * 60)
    print("🐛  INVESTIGADOR DE BUGS — analizando bug reportado...")
    print("═" * 60)

    bug_desc = state.get("bug_description", "").strip()
    if not bug_desc:
        return {
            "reporte_bug": "No se proporcionó descripción del bug.",
            "aprobado":    False,
        }

    agente = crear_agente(SYSTEM_BUG)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"BUG REPORTADO:\n{bug_desc}\n\n"
            "Investigá la causa raíz en el código fuente. Leé los archivos relevantes, "
            "corregí si es posible, y terminá con 'ISSUES ENCONTRADOS: N'."
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    issues = _parse_issues(respuesta)
    aprobado = issues == 0 and "REQUIERE_REVISION" not in respuesta.upper()

    return {
        "reporte_bug":  respuesta,
        "issues_total": state.get("issues_total", 0) + issues,
        "aprobado":     aprobado,
    }


# ─────────────────────────────────────────────
# Construcción del grafo
# ─────────────────────────────────────────────

workflow = StateGraph(TestState)

workflow.add_node("datos",      nodo_datos)
workflow.add_node("zonas",      nodo_zonas)
workflow.add_node("misiones",   nodo_misiones)
workflow.add_node("coherencia", nodo_coherencia)
workflow.add_node("bug",        nodo_bug)

workflow.add_edge(START,        "datos")
workflow.add_edge("datos",      "zonas")
workflow.add_edge("zonas",      "misiones")
workflow.add_edge("misiones",   "coherencia")
workflow.add_edge("coherencia", "bug")
workflow.add_edge("bug",        END)

app = workflow.compile()


# ─────────────────────────────────────────────
# Punto de entrada
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "█" * 60)
    print("█  GRIETAS — TESTER AUTOMATICO (4 AGENTES QA)")
    print(f"█  Proyecto: {PROJECT_ROOT}")
    print("█" * 60)

    print("\nScope del análisis:")
    print("  all          — auditoría completa (por defecto)")
    print("  datos        — solo assets/data/dialogues.json")
    print("  zonas        — solo archivos Zone*.js")
    print("  misiones     — solo archivos mission_*.js")
    print("  coherencia   — solo coherencia cruzada + main.js")
    print("  bug          — investigar un bug específico (describís el error)")
    print("  <zone_id>    — zona específica, ej: R_CEMETERY")
    print(f"  Zonas válidas: {', '.join(ZONE_IDS)}")

    print("\nIngresá el scope (Enter = all): ", end="", flush=True)
    scope_input = input().strip() or "all"

    VALID_SCOPES = {"all", "datos", "zonas", "misiones", "coherencia", "bug"} | set(ZONE_IDS)
    if scope_input not in VALID_SCOPES:
        print(f"\n⚠️  Scope inválido '{scope_input}'. Usando 'all'.")
        scope_input = "all"

    bug_description = ""
    if scope_input == "bug":
        print("\nDescribí el bug o comportamiento inesperado: ", end="", flush=True)
        bug_description = input().strip()
        if not bug_description:
            print("⚠️  No ingresaste descripción. Saliendo.")
            exit(1)

    hoy = datetime.date.today().isoformat()
    etiqueta = f"tester_{scope_input}_{hoy}"

    import subprocess
    subprocess.run(
        ["git", "commit", "--allow-empty", "-m",
         f"chore: checkpoint antes de tester — {etiqueta}"],
        cwd=PROJECT_ROOT, capture_output=True
    )
    print(f"\n📌  Checkpoint git creado — para revertir: git revert HEAD\n")

    estado_inicial: TestState = {
        "scope":              scope_input,
        "bug_description":    bug_description,
        "reporte_datos":      "",
        "reporte_zonas":      "",
        "reporte_misiones":   "",
        "reporte_coherencia": "",
        "reporte_bug":        "",
        "issues_total":       0,
        "aprobado":           False,
    }

    resultado = app.invoke(estado_inicial)

    # ─── Reporte final ───
    print("\n\n" + "═" * 60)
    print("═  REPORTE FINAL DEL TESTER")
    print("═" * 60)
    print(f"\nScope:          {scope_input}")
    print(f"Issues totales: {resultado['issues_total']}")
    print(f"Estado:         {'✅  APROBADO' if resultado['aprobado'] else '⚠️   REQUIERE REVISION'}")

    print("\n--- Issues por agente ---")
    for campo, nombre in [
        ("reporte_datos",      "Datos      "),
        ("reporte_zonas",      "Zonas      "),
        ("reporte_misiones",   "Misiones   "),
        ("reporte_coherencia", "Coherencia "),
        ("reporte_bug",        "Bug        "),
    ]:
        rep = resultado.get(campo, "")
        if rep and rep != "(omitido por scope)":
            n = _parse_issues(rep)
            estado_agente = "✅" if n == 0 else f"⚠️  {n} issues"
            print(f"  {nombre}: {estado_agente}")
        else:
            print(f"  {nombre}: — (omitido)")

    print(f"\nPara ver los cambios realizados: git diff HEAD~1")
    print(f"Para revertir todo:              git revert HEAD")
