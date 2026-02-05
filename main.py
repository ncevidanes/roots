from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uproot
import os
import shutil
import numpy as np

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class RootReader:
    def __init__(self, file_path):
        self.file_path = file_path
        self.file = uproot.open(file_path)

    def listar_estrutura(self):
        """Mapeia todas as árvores e seus respectivos ramos (variáveis)."""
        estrutura = {}
        for tree_name in self.file.keys():
            # Remove o sufixo ';1' comum no ROOT
            clean_name = tree_name.split(';')[0]
            estrutura[clean_name] = self.file[tree_name].keys()
        return estrutura

    def extrair_tudo(self, tree_name, branches):
        """Extrai os dados brutos de ramos específicos."""
        tree = self.file[tree_name]
        # library='np' para garantir compatibilidade e performance
        dados = tree.arrays(branches, library="np")
        
        # Converte arrays para listas serializáveis em JSON
        resultado = {}
        for b in branches:
            # Tratamento para vetores aninhados (comum em arquivos .HIT)
            resultado[b] = [arr.tolist() if hasattr(arr, 'tolist') else arr for arr in dados[b]]
        return resultado

@app.post("/mapear")
async def mapear_arquivo(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        reader = RootReader(temp_path)
        return {"estrutura": reader.listar_estrutura()}
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

@app.post("/extrair")
async def extrair_dados(file: UploadFile = File(...), tree: str = "CollectionTree"):
    # Lógica similar para extração total de dados
    pass
