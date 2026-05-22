"""
GRIETAS — Sistema de 4 Agentes ReAct (Nivel 3 — filesystem completo)
=====================================================================
Cada agente es un ReAct agent con acceso a herramientas reales:
  read_file, write_file, edit_file, list_files,
  search_in_files, append_to_file, delete_file, run_git

El flujo de 4 agentes se orquesta con LangGraph.
Cada agente trabaja sobre el proyecto real antes de pasar al siguiente.

Archivos necesarios en la raíz del proyecto:
  grietas_tools.py        ← las 8 herramientas de filesystem
  grietas_react.py        ← este archivo

Uso:
  pip install langchain-openai langgraph python-dotenv
  python grietas_react.py
"""

import os
from typing import TypedDict, Annotated
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent

from grietas_tools import ALL_TOOLS, PROJECT_ROOT

load_dotenv()

# ─────────────────────────────────────────────
# LLM — DeepSeek V4 con thinking mode opcional
#
# Variables en .env:
#   DEEPSEEK_MODEL=deepseek-v4-flash       (o deepseek-v4-pro)
#   DEEPSEEK_THINKING_EFFORT=none          (none | high | max)
#
# V4 unifica chat y reasoning en un solo modelo — el thinking se activa
# con el parámetro reasoning_effort, ya no hace falta cambiar de modelo.
# deepseek-chat y deepseek-reasoner se retiran el 24 de julio de 2026.
# ─────────────────────────────────────────────

THINKING_EFFORT = os.getenv("DEEPSEEK_THINKING_EFFORT", "none").lower()  # none | high | max


class _DeepSeekThinkingChat(ChatOpenAI):
    """ChatOpenAI con soporte completo de multi-turn para el modo thinking de DeepSeek.

    DeepSeek exige que reasoning_content de cada turno de asistente se reenvíe
    en la siguiente llamada. LangChain no lo hace por defecto, así que lo
    inyectamos en dos puntos:
      1. _create_chat_result  → guarda reasoning_content en additional_kwargs
      2. _get_request_payload → lo serializa en el dict que va a la API
    """

    def _create_chat_result(self, response, generation_info=None) -> ChatResult:
        result = super()._create_chat_result(response, generation_info)
        # Guardar reasoning_content en additional_kwargs del AIMessage resultante
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
        # Inyectar reasoning_content en los dicts de mensajes de asistente
        # antes de que el SDK los envíe a la API de DeepSeek
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
    temperature=0.3,
)

if THINKING_EFFORT != "none":
    # llm_agente: modo thinking para los 4 agentes ReAct.
    # _DeepSeekThinkingChat maneja el reenvío de reasoning_content en multi-turno.
    llm_agente = _DeepSeekThinkingChat(
        **_llm_kwargs,
        model_kwargs={"reasoning_effort": THINKING_EFFORT},
    )
    # llm: sin thinking para llamadas de un solo turno (prompt_booster).
    llm = ChatOpenAI(**_llm_kwargs)
else:
    llm = ChatOpenAI(**_llm_kwargs)
    llm_agente = llm

# ─────────────────────────────────────────────
# Estado del grafo
# ─────────────────────────────────────────────
class GrietasState(TypedDict):
    solicitud:      str
    reporte_design: str   # output del Game Designer
    reporte_narr:   str   # output del Narrativo
    reporte_prog:   str   # output del Programador
    reporte_tester: str   # output del Tester
    aprobado:       bool
    iteracion:      int


# ─────────────────────────────────────────────
# Contexto base del proyecto (compacto)
# Se complementa con lo que cada agente lee en tiempo real
# ─────────────────────────────────────────────
CONTEXTO_BASE = f"""
Proyecto: GRIETAS — juego 2D web, HTML5/Canvas/JavaScript ES2022.
Raíz del proyecto: {PROJECT_ROOT}

Protagonistas: Mateo (niño 12 años, jugable) y Luna (gata con poderes dimensionales).
Mundo: pueblo Miraloma + El Vacío (dimensión paralela).
Misiones existentes: M01 (faro) M02 (escuela) M03 (jardín) M04 (playa) M05 (hermanos) M06 (biblioteca).

Sistemas clave: MissionManager, DialogueSystem, BondSystem, SaveSystem, VisionSystem, EventBus.
Arquitectura: Entity + Components, sin frameworks de juego.

Principios de diseño:
- Cada Grieta es una historia humana (no mecánica abstracta)
- Las decisiones del jugador dejan huella visible permanente
- Luna nunca es solo una mecánica — sus poderes tienen base narrativa
- El Vacío no es el enemigo — la empatía es la herramienta principal

ANTES de escribir cualquier archivo, SIEMPRE leé los archivos relevantes con read_file.
SIEMPRE verificá con search_in_files que no estés duplicando IDs de flags o diálogos.
"""


# ─────────────────────────────────────────────
# Helper: crear un agente ReAct con su system prompt
# ─────────────────────────────────────────────
def crear_agente(system_prompt: str):
    return create_react_agent(
        model=llm_agente,
        tools=ALL_TOOLS,
        prompt=SystemMessage(content=system_prompt),
    )


# ─────────────────────────────────────────────
# Agente 1 — Game Designer Senior
# ─────────────────────────────────────────────
SYSTEM_DESIGNER = f"""
{CONTEXTO_BASE}

Eres el Game Designer Senior de Grietas.

Tu trabajo en esta sesión:
1. Explorá el proyecto con list_files y read_file para entender el estado actual.
2. Analizá las misiones existentes (src/missions/data/) para no duplicar nada.
3. Diseñá UNA mecánica o misión nueva concreta que aumente la retención del jugador.
4. Documentá tu propuesta en un archivo NUEVO: docs/propuesta_design_[nombre].md
   usando write_file. Incluí: nombre, descripción funcional, sistemas involucrados,
   archivos que habrá que crear/modificar, duración estimada.
5. Corré git status para confirmar qué cambios hiciste.

Sé específico. Referenciá archivos y funciones reales que encontraste.
Cuando termines, resumí en 3 líneas qué propusiste y qué archivo creaste.
"""

# Agente 2 — Narrativo
SYSTEM_NARRATIVO = f"""
{CONTEXTO_BASE}

Eres el Escritor Narrativo de Grietas.

Tu trabajo en esta sesión:
1. Leé la propuesta del Game Designer en docs/propuesta_design_*.md con read_file.
2. Leé src/data/dialogues.json para ver los diálogos existentes y su formato exacto.
3. Leé los archivos de lore relevantes (*.md en raíz o docs/).
4. Verificá que la propuesta sea coherente con el lore. Si hay contradicciones, corregalas.
5. Añadí al archivo de propuesta una sección "## Narrativa" con:
   - Historia del Eco/NPC (máx 3 párrafos)
   - 5 nodos de diálogo nuevos en formato JSON exacto del juego
   - Consecuencia visible en el mundo al completar la misión
   - Flags necesarios (verificá que no existen ya en src/data/world_flags.json)
6. Usá edit_file para agregar la sección al archivo de propuesta existente.
7. Corré git status para confirmar qué cambios hiciste.

Escribí con la voz del juego: emocional, sutil, sin melodrama.
Cuando termines, resumí qué sección narrativa agregaste.
"""

# Agente 3 — Programador
SYSTEM_PROGRAMADOR = f"""
{CONTEXTO_BASE}

Eres el Programador principal de Grietas (JavaScript ES2022).

Tu trabajo en esta sesión:
1. Leé docs/propuesta_design_*.md para entender qué hay que implementar.
2. Leé los archivos de misiones existentes en src/missions/data/ para copiar el estilo exacto.
3. Leé src/core/SaveSystem.js, src/systems/EventBus.js y src/missions/MissionBase.js
   para entender los patrones que debés seguir.
4. Implementá TODO lo necesario, archivo por archivo:
   a) Archivo de misión nueva en src/missions/data/ con write_file
   b) Si necesitás una entidad nueva (Echo, NPC), creala en src/entities/ con write_file
   c) Agregá los flags nuevos a src/data/world_flags.json con edit_file
   d) Agregá los diálogos nuevos a src/data/dialogues.json con edit_file
   e) Si necesitás modificar un archivo existente (ej: registrar la misión en MissionManager),
      leelo primero con read_file y editá solo las líneas necesarias con edit_file
5. Verificá cada cambio con read_file después de escribir.
6. Corré git status y luego git add . para preparar los cambios.
7. Corré git commit -m "feat: [nombre de la misión/mecánica] — agente programador"

Seguí el estilo exacto del código existente. No inventes patrones nuevos.
Cuando termines, listá todos los archivos que creaste o modificaste.
"""

# Agente 4 — Tester
SYSTEM_TESTER = f"""
{CONTEXTO_BASE}

Eres el QA Tester Senior de Grietas.

Tu trabajo en esta sesión:
1. Revisá el git log para ver qué cambios hizo el Programador.
2. Leé todos los archivos nuevos o modificados con read_file.
3. Verificá:
   COHERENCIA:
   - ¿Los IDs de flags son únicos? (buscalos con search_in_files)
   - ¿Los IDs de diálogos son únicos? (buscalos con search_in_files)
   - ¿La clase de misión extiende MissionBase correctamente?
   - ¿Los eventos de EventBus coinciden entre emisor y receptor?
   CALIDAD:
   - ¿El código sigue el mismo estilo que las otras misiones?
   - ¿Hay edge cases sin cubrir? (interrupción a mitad, orden de misiones)
   - ¿Los diálogos tienen el formato correcto del DialogueSystem?
   NARRATIVA:
   - ¿La historia es emocionalmente coherente con el juego?
   - ¿Las consecuencias en el mundo están implementadas?

4. Si encontrás bugs o problemas:
   - Corregalos directamente con edit_file
   - Documentá cada corrección

5. Si todo está bien, dejá un archivo docs/tester_report_[fecha].md con el veredicto.
6. Corré git add . y git commit -m "fix: revisión QA — [resumen]" si hiciste correcciones.

Al final, emití un veredicto: APROBADO o REQUIERE_REVISION con lista de issues.
"""


# ─────────────────────────────────────────────
# Prompt Booster — mejora interactiva del prompt
# ─────────────────────────────────────────────

def prompt_booster(prompt_inicial: str) -> str:
    """Genera 3 versiones mejoradas del prompt y deja al usuario elegir."""
    system = SystemMessage(content=(
        "Eres un especialista en game design para el juego GRIETAS "
        "(2D, HTML5/Canvas, dimensiones real/vacío, misiones de duelo emocional).\n"
        "Dado un prompt de tarea, devuelve EXACTAMENTE 3 versiones mejoradas, numeradas 1-3.\n"
        "Cada versión debe ser una sola línea, más precisa y accionable que el original.\n"
        "No añadas explicaciones — solo la lista numerada."
    ))
    human = HumanMessage(content=f"Prompt original: {prompt_inicial}")

    print("\n🤖  Generando opciones...")
    respuesta = llm.invoke([system, human])
    texto = respuesta.content.strip()

    opciones = []
    for linea in texto.splitlines():
        linea = linea.strip()
        if linea and linea[0].isdigit() and ". " in linea:
            opciones.append(linea.split(". ", 1)[1].strip())

    if not opciones:
        print("⚠️  No se pudieron generar opciones. Usando prompt original.")
        return prompt_inicial

    print("\n" + "─" * 60)
    print(f"  0. (original) {prompt_inicial}")
    for i, op in enumerate(opciones, 1):
        print(f"  {i}. {op}")
    print("─" * 60)

    while True:
        try:
            eleccion = input(f"\nElige (0-{len(opciones)}): ").strip()
            idx = int(eleccion)
            if idx == 0:
                return prompt_inicial
            if 1 <= idx <= len(opciones):
                print(f"\n✅  Usando opción {idx}")
                return opciones[idx - 1]
        except (ValueError, EOFError):
            pass
        print(f"  → Ingresa un número entre 0 y {len(opciones)}")


# ─────────────────────────────────────────────
# Nodos del grafo — cada uno invoca su agente ReAct
# ─────────────────────────────────────────────

def nodo_designer(state: GrietasState) -> dict:
    print("\n" + "═"*60)
    print("🎮  GAME DESIGNER — trabajando en el proyecto...")
    print("═"*60)

    agente = crear_agente(SYSTEM_DESIGNER)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=f"Solicitud: {state['solicitud']}")]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    return {"reporte_design": respuesta}


def nodo_narrativo(state: GrietasState) -> dict:
    print("\n" + "═"*60)
    print("✍️   NARRATIVO — trabajando en el proyecto...")
    print("═"*60)

    agente = crear_agente(SYSTEM_NARRATIVO)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Solicitud original: {state['solicitud']}\n\n"
            f"El Game Designer reportó:\n{state['reporte_design']}"
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    return {"reporte_narr": respuesta}


def nodo_programador(state: GrietasState) -> dict:
    print("\n" + "═"*60)
    print("💻  PROGRAMADOR — trabajando en el proyecto...")
    print("═"*60)

    agente = crear_agente(SYSTEM_PROGRAMADOR)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Solicitud original: {state['solicitud']}\n\n"
            f"Game Designer:\n{state['reporte_design']}\n\n"
            f"Narrativo:\n{state['reporte_narr']}"
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)
    return {"reporte_prog": respuesta}


def nodo_tester(state: GrietasState) -> dict:
    print("\n" + "═"*60)
    print("🧪  TESTER — revisando el proyecto...")
    print("═"*60)

    agente = crear_agente(SYSTEM_TESTER)
    resultado = agente.invoke({
        "messages": [HumanMessage(content=(
            f"Solicitud original: {state['solicitud']}\n\n"
            f"El Programador reportó:\n{state['reporte_prog']}"
        ))]
    })
    respuesta = resultado["messages"][-1].content
    print(respuesta)

    aprobado = "APROBADO" in respuesta.upper() and "REQUIERE_REVISION" not in respuesta.upper()
    return {
        "reporte_tester": respuesta,
        "aprobado":       aprobado,
        "iteracion":      state.get("iteracion", 0) + 1,
    }


# ─────────────────────────────────────────────
# Router — después del Tester
# ─────────────────────────────────────────────
def router(state: GrietasState) -> str:
    MAX = 2  # máx iteraciones antes de detenerse

    if state.get("aprobado"):
        print("\n✅  PROPUESTA APROBADA — proyecto actualizado")
        return END

    if state.get("iteracion", 0) >= MAX:
        print(f"\n⚠️   Límite de {MAX} iteraciones. Revisá el reporte del Tester manualmente.")
        return END

    print(f"\n🔄  Problemas detectados — iteración {state['iteracion']}/{MAX}")
    print("    El Programador va a corregir los issues...")
    return "programador"


# ─────────────────────────────────────────────
# Construcción del grafo
# ─────────────────────────────────────────────
workflow = StateGraph(GrietasState)

workflow.add_node("designer",    nodo_designer)
workflow.add_node("narrativo",   nodo_narrativo)
workflow.add_node("programador", nodo_programador)
workflow.add_node("tester",      nodo_tester)

workflow.add_edge(START,         "designer")
workflow.add_edge("designer",    "narrativo")
workflow.add_edge("narrativo",   "programador")
workflow.add_edge("programador", "tester")

workflow.add_conditional_edges(
    "tester",
    router,
    {"programador": "programador", END: END}
)

app = workflow.compile()


# ─────────────────────────────────────────────
# Solicitudes disponibles
# ─────────────────────────────────────────────
SOLICITUDES = {
    "nueva_mision": (
        "Crear una 7ª misión secundaria (M07) en el Cementerio de Miraloma. "
        "Debe tener un Eco con historia emocionalmente poderosa, desbloquear "
        "una habilidad nueva para Mateo o Luna, y tener al menos 2 resoluciones "
        "posibles con consecuencias distintas y visibles en el mundo."
    ),
    "coleccionables": (
        "Diseñar e implementar un sistema de coleccionables que motive a explorar "
        "cada zona del mapa a fondo. Deben tener sentido narrativo dentro del lore "
        "de Grietas, revelar historia de Miraloma y recompensar al jugador con algo "
        "concreto. Integrarlo con el SaveSystem existente."
    ),
    "nueva_habilidad": (
        "Diseñar e implementar una habilidad nueva para Mateo que se active después "
        "de completar cierto número de misiones secundarias. Debe tener justificación "
        "narrativa y complementar las habilidades de Luna sin duplicarlas."
    ),
    "sistema_tiempo": (
        "Expandir el sistema de tiempo (game_day / time_of_day) para que tenga más "
        "impacto en el mundo: eventos nocturnos nuevos, diálogos alternativos según "
        "el día, y al menos 2 Ecos menores que solo aparezcan de noche."
    ),
}


# ─────────────────────────────────────────────
# Punto de entrada
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "█"*60)
    print("█  GRIETAS — AGENTES REACT CON FILESYSTEM COMPLETO")
    print(f"█  Proyecto: {PROJECT_ROOT}")
    print("█"*60)

    print("\n📝  Describe qué quieres crear (o Enter para usar ejemplo):")
    prompt_inicial = input("> ").strip()

    if not prompt_inicial:
        SOLICITUD_ACTIVA = "nueva_habilidad"
        prompt_inicial = SOLICITUDES[SOLICITUD_ACTIVA]
        print(f"  (usando ejemplo: {prompt_inicial[:70]}...)")

    solicitud_final = prompt_booster(prompt_inicial)

    # Checkpoint git antes de empezar
    import subprocess
    etiqueta = solicitud_final[:50].replace(" ", "_").replace("/", "-")
    subprocess.run(
        ["git", "commit", "--allow-empty", "-m",
         f"chore: checkpoint antes de sesión de agentes — {etiqueta}"],
        cwd=PROJECT_ROOT, capture_output=True
    )
    print(f"\n📌 Checkpoint git creado. Si algo sale mal: git revert HEAD\n")

    estado_inicial: GrietasState = {
        "solicitud":      solicitud_final,
        "reporte_design": "",
        "reporte_narr":   "",
        "reporte_prog":   "",
        "reporte_tester": "",
        "aprobado":       False,
        "iteracion":      0,
    }

    resultado = app.invoke(estado_inicial)

    print("\n\n" + "═"*60)
    print("═  SESIÓN COMPLETADA")
    print("═"*60)
    print(f"\n→ Iteraciones: {resultado['iteracion']}")
    print(f"→ Estado: {'✅ APROBADO' if resultado['aprobado'] else '⚠️ Revisar reporte del Tester'}")
    print(f"\nPara ver los cambios: git diff HEAD~1")
    print(f"Para revertir todo:   git revert HEAD")
