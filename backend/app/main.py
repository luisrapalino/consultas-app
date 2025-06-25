from fastapi import FastAPI
from app.adapters.incoming.consulta_controller import router as consulta_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Servicio de Consulta Multicliente")

app.include_router(consulta_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Servicio de consulta disponible"}
