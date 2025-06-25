from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.consulta_service import procesar_pregunta

router = APIRouter()


class ConsultaRequest(BaseModel):
    cliente_id: str
    pregunta: str


@router.post("/consulta")
async def consulta(req: ConsultaRequest):
    try:
        respuesta = await procesar_pregunta(req.cliente_id, req.pregunta)
        return respuesta
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
