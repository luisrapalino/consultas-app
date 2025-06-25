import httpx
import re
import difflib
from app.adapters.outgoing.document_adapter import obtener_documentos_cliente


def limpiar_respuesta(respuesta: str) -> str:
    return re.sub(r"<\|.*?\|>", "", respuesta).strip()


def normalizar(texto: str) -> str:
    return re.sub(r"[^\w\s]", "", texto.lower())


SINONIMOS = {
    "productos financieros": ["cuentas de ahorro"],
    "contacto": ["correo", "teléfono", "email"],
    "oficinas": ["Contamos con oficinas"],
    "tasa de interés": ["intereses", "costos financieros"],
    "certificaciones": ["normas", "estándares", "acreditaciones"],
    "servicios": ["soluciones", "ofertas", "productos"],
    "cursos": ["programación", "ciencia de datos", "marketing digital", "habilidades blandas"],
    "programas": ["academias internas", "entrenamientos intensivos"],
    "plataforma": ["aprendizaje autodirigido", "videos", "retos prácticos", "quizzes", "seguimiento del progreso"],
}


def expandir_pregunta(pregunta: str) -> list:
    pregunta = pregunta.lower()
    variantes = [pregunta]

    for clave, sinonimos in SINONIMOS.items():
        if clave in pregunta:
            variantes.extend(sinonimos)

    return variantes


def encontrar_mejor_respuesta(pregunta: str, documentos: list) -> dict:
    variantes = expandir_pregunta(pregunta)
    mejor_match = None
    mejor_score = 0
    fuente = None

    for doc in documentos:
        secciones = [s.strip()
                     for s in doc["contenido"].split("\n") if s.strip()]
        for seccion in secciones:
            for variante in variantes:
                score = difflib.SequenceMatcher(
                    None, variante.lower(), seccion.lower()).ratio()
                if score > mejor_score:
                    mejor_score = score
                    mejor_match = seccion
                    fuente = doc["nombre"]

    if mejor_score > 0.25:
        return {
            "respuesta": mejor_match,
            "documento_fuente": fuente
        }

    return {
        "respuesta": "No se encontró una respuesta en los documentos disponibles.",
        "documento_fuente": None
    }


async def procesar_pregunta(cliente_id: str, pregunta: str) -> dict:
    if cliente_id == "cliente_llm":
        prompt = f"Pregunta: {pregunta}"

        payload = {
            "model": "Meta-Llama-3-8B-Instruct.Q4_0",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Eres un asistente útil. Responde SIEMPRE en español, "
                        "de forma corta y directa y sin razonamientos internos."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 300,
            "temperature": 0.7,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:4891/v1/chat/completions",
                    json=payload,
                    timeout=60
                )
                data = response.json()

                print("Respuesta completa:", data)

                respuesta_txt = data["choices"][0]["message"]["content"]
                respuesta_txt = limpiar_respuesta(respuesta_txt)

                return {
                    "respuesta": respuesta_txt.strip(),
                    "documento_fuente": None
                }

        except Exception as e:
            print("Error al llamar a GPT4All:", str(e))
            raise

    else:
        documentos = obtener_documentos_cliente(cliente_id)
        return encontrar_mejor_respuesta(pregunta, documentos)
