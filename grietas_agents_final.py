"""
GRIETAS — Sistema de 5 Agentes (versión final con lectura real del proyecto)
=============================================================================
Diferencia clave vs versiones anteriores:
  ANTES: CONTEXTO_GRIETAS era texto estático escrito a mano.
  AHORA: grietas_context_loader.py lee tus archivos .js, .json y .md reales
         y construye el contexto automáticamente cada vez que ejecutas el script.

Los agentes ven el estado ACTUAL de tu proyecto, no una descripción desactualizada.

Flujo completo:
  [Leer proyecto] → Designer → Narrativo → Programador → FileWriter → Tester
                       ↑____________________________________________↓ (si hay issues)

Archivos necesarios en la misma carpeta:
  grietas_context_loader.py   ← lee el proyecto
  grietas_file_writer.py      ← escribe archivos al terminar
  grietas_agents_final.py     ← este archivo (punto de entrada)
"""

import os
from typing import TypedDict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END

from grietas_context_loader import construir_contexto, diagnosticar
from grietas_file_writer import agente_file_writer

load_dotenv()

# ─────────────────────────────────────────────
# LLM
# ─────────────────────────────────────────────
llm = ChatOpenAI(
    model="deepseek-chat",
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com/v1",
    # Si usas OpenAI:
    # model="gpt-4o",
    # api_key=os.getenv("OPENAI_API_KEY"),
)

# ─────────────────────────────────────────────
# Estado
# ─────────────────────────────────────────────
class GrietasState(TypedDict):
    solicitud:            str
    contexto_proyecto:    str   # ← contenido real del proyecto leído del disco
    propuesta_designer:   str
    propuesta_narrativo:  str
    implementacion:       str
    archivos_escritos:    list[str]
    errores_escritura:    list[str]
    reporte_tester:       str
    iteracion:            int
    aprobado:             bool


# ─────────────────────────────────────────────
# Agente 1 — Game Designer Senior
# ─────────────────────────────────────────────
def agente_game_designer(state: GrietasState) -> dict:
    print("\n" + "═" * 60)
    print("🎮  GAME DESIGNER SENIOR")
    print("═" * 60)

    iteracion = state.get("iteracion", 0)
    feedback = state.get("reporte_tester", "")

    feedback_bloque = ""
    if iteracion > 0 and feedback:
        feedback_bloque = f"""
--- ITERACIÓN #{iteracion} — Feedback del Tester ---
{feedback}
Revisa y mejora la propuesta teniendo en cuenta estos issues.
"""

    prompt = f"""
Eres el Game Designer Senior del juego GRIETAS.

A continuación tienes el contenido REAL Y ACTUAL del proyecto — 
código fuente, misiones existentes, flags, diálogos y documentación:

{state['contexto_proyecto']}

---

SOLICITUD DEL EQUIPO:
{state['solicitud']}

{feedback_bloque}

Con base en el proyecto real que acabas de leer, propón UNA mecánica
o contenido nuevo que:
1. Aumente la duración y retención del jugador
2. Sea coherente con lo que YA EXISTE en el código y el lore
3. No duplique ninguna misión o sistema existente
4. Se integre con los sistemas reales que viste en el código
5. Respete el tono emocional — empatía, no combate

Sé específico: referencia archivos, funciones y flags que viste en el código real.

Entrega:
- Nombre de la mecánica/misión propuesta
- Descripción funcional paso a paso
- Qué archivos existentes modifica o extiende (con nombres reales)
- Qué sistemas existentes involucra
- Duración estimada de contenido añadido
"""
    respuesta = llm.invoke(prompt)
    print(respuesta.content)
    return {"propuesta_designer": respuesta.content}


# ─────────────────────────────────────────────
# Agente 2 — Narrativo
# ─────────────────────────────────────────────
def agente_narrativo(state: GrietasState) -> dict:
    print("\n" + "═" * 60)
    print("✍️   NARRATIVO")
    print("═" * 60)

    prompt = f"""
Eres el Escritor Narrativo del juego GRIETAS.

Este es el contenido REAL Y ACTUAL del proyecto:

{state['contexto_proyecto']}

---

PROPUESTA DEL GAME DESIGNER:
{state['propuesta_designer']}

Con base en el lore y diálogos reales que leíste, valida y enriquece
la propuesta narrativamente:

1. ¿Es coherente con los personajes y lore existentes? (cita ejemplos del código)
2. Historia del Eco/NPC involucrado (máx 3 párrafos)
3. 3–5 líneas de diálogo en el estilo del juego (compara con dialogues.json real)
4. Consecuencia visible en el mundo al completarlo
5. Flags nuevos necesarios (verifica que NO colisionen con los existentes en world_flags.json)
6. En qué Acto (1–5) encaja y por qué
7. ⚠️ Alerta si algo contradice el lore o duplica contenido existente

Escribe con la voz del juego: emocional, sutil, sin melodrama.
"""
    respuesta = llm.invoke(prompt)
    print(respuesta.content)
    return {"propuesta_narrativo": respuesta.content}


# ─────────────────────────────────────────────
# Agente 3 — Programador
# ─────────────────────────────────────────────
def agente_programador(state: GrietasState) -> dict:
    print("\n" + "═" * 60)
    print("💻  PROGRAMADOR")
    print("═" * 60)

    prompt = f"""
Eres el Programador principal del juego GRIETAS (JavaScript ES2022, HTML5 Canvas).

Este es el contenido REAL Y ACTUAL del proyecto — estudia el estilo,
las clases existentes y los patrones usados antes de escribir código nuevo:

{state['contexto_proyecto']}

---

PROPUESTA DEL GAME DESIGNER:
{state['propuesta_designer']}

CONTEXTO NARRATIVO:
{state['propuesta_narrativo']}

Implementa la propuesta siguiendo EXACTAMENTE el mismo estilo y patrones
que viste en el código real del proyecto.

FORMATO OBLIGATORIO (el sistema lo parsea automáticamente):

  Cada archivo JS:
  ```javascript NombreExacto.js
  // código aquí
  ```

  Flags nuevos (verifica que no existen ya en world_flags.json):
  ```json flags_nuevos.json
  {{ "nombre_flag": {{ "type": "bool", "default": false, "description": "..." }} }}
  ```

  Diálogos nuevos (se mergean en dialogues.json):
  ```json
  {{ "id_nodo": {{ "speaker": "Nombre", "portrait": "id", "text": "...", "next": null }} }}
  ```

Entrega:
1. Clase de la misión (extiende MissionBase como en el código real)
2. Flags sin colisiones con los existentes
3. Árbol de diálogo completo siguiendo el formato de dialogues.json real
4. Si crea entidades nuevas, también como archivo separado
5. Comentarios indicando qué archivos existentes necesitan modificarse
   (sin reescribir los archivos completos — solo indicar qué línea cambiar)
"""
    respuesta = llm.invoke(prompt)
    print(respuesta.content)
    return {"implementacion": respuesta.content}


# ─────────────────────────────────────────────
# Agente 5 — Tester
# ─────────────────────────────────────────────
def agente_tester(state: GrietasState) -> dict:
    print("\n" + "═" * 60)
    print("🧪  TESTER")
    print("═" * 60)

    archivos = state.get("archivos_escritos", [])
    errores = state.get("errores_escritura", [])

    prompt = f"""
Eres el QA Tester Senior del juego GRIETAS. Iteración #{state.get('iteracion', 0) + 1}.

Este es el contenido REAL Y ACTUAL del proyecto para que puedas verificar
que la propuesta no rompe nada existente:

{state['contexto_proyecto']}

---

[MECÁNICA — Game Designer]:
{state['propuesta_designer']}

[NARRATIVA — Narrativo]:
{state['propuesta_narrativo']}

[IMPLEMENTACIÓN — Programador]:
{state['implementacion']}

ARCHIVOS ESCRITOS EN DISCO:
{archivos if archivos else "⚠️ Ninguno (el Programador no usó el formato correcto)"}

ERRORES DE ESCRITURA:
{errores if errores else "Ninguno"}

Evalúa cruzando contra el código real:

JUGABILIDAD:
□ ¿Tiene sentido en el contexto del juego real que leíste?
□ ¿Cuánto tiempo añade realmente?
□ ¿Tiene rejugabilidad?

COHERENCIA CON EL PROYECTO REAL:
□ ¿El código nuevo sigue el mismo estilo que src/missions/data/*.js existentes?
□ ¿Los flags no colisionan con los de world_flags.json?
□ ¿Los IDs de diálogos no duplican los de dialogues.json?
□ ¿El Eco/NPC nuevo no duplica personajes existentes?

TÉCNICO:
□ ¿El código tiene bugs visibles?
□ ¿Edge cases cubiertos? (interrumpir misión a mitad, orden de misiones, etc.)
□ ¿Los archivos se escribieron correctamente en disco?

Si todo está correcto: APROBADO
Si hay problemas: REQUIERE_REVISION: [lista numerada]
"""
    respuesta = llm.invoke(prompt)
    reporte = respuesta.content
    print(reporte)

    aprobado = "APROBADO" in reporte.upper() and "REQUIERE_REVISION" not in reporte.upper()
    iteracion = state.get("iteracion", 0)

    return {
        "reporte_tester": reporte,
        "aprobado":       aprobado,
        "iteracion":      iteracion + 1,
    }


# ─────────────────────────────────────────────
# Router
# ─────────────────────────────────────────────
def decidir_siguiente_paso(state: GrietasState) -> str:
    MAX_ITERACIONES = 3

    if state.get("aprobado"):
        print("\n✅ PROPUESTA APROBADA — archivos escritos en el proyecto")
        return END

    if state.get("iteracion", 0) >= MAX_ITERACIONES:
        print(f"\n⚠️  Límite de {MAX_ITERACIONES} iteraciones. Revisar manualmente.")
        return END

    print(f"\n🔄 Revisión #{state['iteracion']}/{MAX_ITERACIONES}")
    return "game_designer"


# ─────────────────────────────────────────────
# Construcción del grafo
# ─────────────────────────────────────────────
workflow = StateGraph(GrietasState)

workflow.add_node("game_designer", agente_game_designer)
workflow.add_node("narrativo",     agente_narrativo)
workflow.add_node("programador",   agente_programador)
workflow.add_node("file_writer",   agente_file_writer)
workflow.add_node("tester",        agente_tester)

workflow.add_edge(START,           "game_designer")
workflow.add_edge("game_designer", "narrativo")
workflow.add_edge("narrativo",     "programador")
workflow.add_edge("programador",   "file_writer")
workflow.add_edge("file_writer",   "tester")

workflow.add_conditional_edges(
    "tester",
    decidir_siguiente_paso,
    {"game_designer": "game_designer", END: END}
)

app = workflow.compile()


# ─────────────────────────────────────────────
# Solicitudes disponibles
# ─────────────────────────────────────────────
SOLICITUDES = {
    "nueva_mision": """
    Necesitamos una 7ª misión secundaria (M07) ubicada en el Cementerio de Miraloma.
    Debe tener un Eco con historia emocionalmente poderosa, desbloquear una habilidad
    nueva, y tener al menos 2 resoluciones posibles con consecuencias distintas.
    Analiza las misiones existentes y asegúrate de que no dupliques nada.
    """,
    "coleccionables": """
    Diseña un sistema de coleccionables que motive a explorar cada zona a fondo.
    Debe integrarse con el SaveSystem existente y tener sentido narrativo.
    Revisa qué flags y sistemas ya existen antes de proponer nuevos.
    """,
    "contenido_extra": """
    El juego se siente corto (menos de 2 horas). Propón contenido que añada
    al menos 1 hora, aprovechando las zonas y sistemas existentes.
    Analiza qué está implementado y qué falta todavía.
    """,
    "nueva_habilidad": """
    Diseña una habilidad nueva para Mateo o Luna que se integre con los sistemas
    existentes (BondSystem, VisionSystem, AudioSystem). Debe tener justificación
    narrativa y un momento de unlock dentro del juego. Revisa las habilidades
    actuales para no duplicar.
    """,
}


# ─────────────────────────────────────────────
# Punto de entrada
# ─────────────────────────────────────────────
if __name__ == "__main__":
    SOLICITUD_ACTIVA = "nueva_mision"  # ← cambia aquí

    print("\n" + "█" * 60)
    print("█  GRIETAS — AGENTES CON LECTURA REAL DEL PROYECTO")
    print(f"█  Solicitud: {SOLICITUD_ACTIVA}")
    print("█" * 60)

    # Diagnóstico opcional antes de ejecutar
    diagnosticar()
    print()

    # Leer el proyecto real
    print("📦 Cargando archivos del proyecto...\n")
    contexto = construir_contexto(verbose=True)
    print(f"\n✅ Contexto listo: {len(contexto):,} chars\n")

    estado_inicial: GrietasState = {
        "solicitud":           SOLICITUDES[SOLICITUD_ACTIVA],
        "contexto_proyecto":   contexto,       # ← el proyecto real
        "propuesta_designer":  "",
        "propuesta_narrativo": "",
        "implementacion":      "",
        "archivos_escritos":   [],
        "errores_escritura":   [],
        "reporte_tester":      "",
        "iteracion":           0,
        "aprobado":            False,
    }

    resultado = app.invoke(estado_inicial)

    print("\n\n" + "═" * 60)
    print("═  RESULTADO FINAL")
    print("═" * 60)
    print(f"\n→ Iteraciones: {resultado['iteracion']}")
    print(f"→ Estado: {'✅ APROBADO' if resultado['aprobado'] else '⚠️ Con observaciones'}")
    print(f"\nArchivos escritos:")
    for f in resultado.get("archivos_escritos", []):
        print(f"  ✅ {f}")
    if resultado.get("errores_escritura"):
        print(f"\nErrores:")
        for e in resultado["errores_escritura"]:
            print(f"  ❌ {e}")