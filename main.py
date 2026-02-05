from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uproot
import os
import shutil

app = FastAPI()

# Habilita comunicação entre o navegador e o Python (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RootReader:
    """Classe responsável unicamente pela leitura de parâmetros do arquivo .root"""
    def __init__(self, file_path):
        self.file_path = file_path
        self.file = uproot.open(file_path)

    def listar_estrutura_completa(self):
        """Mapeia todas as árvores e seus ramos (branches)"""
        estrutura = {}
        for obj_name in self.file.keys():
            # Limpa o nome (remove o ';1' do ROOT)
            clean_name = obj_name.split(';')[0]
            try:
                # Tenta acessar como TTree e listar as chaves
                estrutura[clean_name] = self.file[obj_name].keys()
            except:
                continue
        return estrutura

@app.post("/mapear")
async def mapear_arquivo(file: UploadFile = File(...)):
    # Salva temporariamente para leitura
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        reader = RootReader(temp_path)
        dados_arquivo = reader.listar_estrutura_completa()
        return {
            "status": "sucesso",
            "filename": file.filename,
            "estrutura": dados_arquivo
        }
    except Exception as e:
        return {"status": "erro", "detalhes": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Para rodar: uvicorn main:app --reload
