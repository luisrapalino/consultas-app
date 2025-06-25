import os

BASE_DIR = os.path.join(os.path.dirname(__file__), "../../../clientes")


def obtener_documentos_cliente(cliente_id: str) -> list:
    cliente_path = os.path.abspath(os.path.join(BASE_DIR, cliente_id))
    documentos = []

    if not os.path.exists(cliente_path):
        return []

    for archivo in os.listdir(cliente_path):
        if archivo.endswith(".txt"):
            with open(os.path.join(cliente_path, archivo), encoding="utf-8") as f:
                documentos.append({
                    "nombre": archivo,
                    "contenido": f.read()
                })

    return documentos
