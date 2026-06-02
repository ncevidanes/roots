# Spy Root Universal 🔬

[![DOI](https://zenodo.org/badge/1150950905.svg)](https://doi.org/10.5281/zenodo.20507908)

Uma ferramenta de auditoria e inspeção visual para arquivos binários `.root` (CERN), executada **100% no lado do cliente (Client-Side)** diretamente através do navegador. 

**🌐 Demonstração Online:** [ncevidanes.github.io/roots/](https://ncevidanes.github.io/roots/)

---

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido para resolver uma demanda clássica em ambientes de Física de Altas Energias: a necessidade de inspecionar a estrutura de um arquivo `.root` sem precisar abrir um terminal Linux, carregar ambientes virtuais complexos ou compilar macros em C++. 

O **Spy Root Universal** atua como um auditor leve e agnóstico, focado estritamente na inspeção de metadados, mapeamento de hierarquias de `TTrees` e renderização de histogramas nativos pré-existentes no arquivo.

---

## ✨ Funcionalidades Principais

* **Auditoria de Hierarquia Bruta (Deep Scan):** A ferramenta realiza a varredura acessando o array binário interno de chaves (`fBranches.arr`) do arquivo ROOT. Isso garante o mapeamento de branches complexas e estruturadas, comuns em ambientes de dados do ATLAS/CERN.
* **Mapeamento de Objetos:** Varredura recursiva de diretórios (`TDirectory`) dentro do arquivo binário para catalogação de chaves e histogramas.
* **Visualização Interativa:** Renderização instantânea de histogramas (`TH1D`, `TH2D`, etc.) gravados no arquivo através de cliques diretos na árvore de metadados.
* **Exportação de Auditoria (CSV):** Geração automática de relatórios textuais da estrutura mapeada para fins de documentação, validação e governança de repositórios de dados.
* **Privacidade e Zero Servidor:** O processamento ocorre inteiramente na memória RAM local do seu navegador. Nenhum dado ou arquivo é enviado para servidores externos.

---

## 🛠️ Arquitetura Técnica

A implementação é **100% contida em um único arquivo HTML (`index.html`)**, eliminando a necessidade de servidores backend, ambientes Node.js ou gerenciadores de pacotes pesados.

* **Interface:** Desenvolvida em HTML5 e CSS3 nativos com um layout escuro de alta legibilidade para terminais técnicos.
* **Motor de Leitura Binária:** Utilização dos módulos nativos ES6 do **JSROOT (CERN)** carregados via CDN.
* **Gerenciamento de Memória:** Rotinas explícitas de `cleanup()` disparadas a cada nova plotagem ou troca de arquivo, mitigando o vazamento de memória (*memory leaks*) ao manipular arquivos binários volumosos.

---

## 🚀 Como Executar Localmente

Por se basear exclusivamente em tecnologias web padrão, a execução local não exige instalação:

1. Baixe o arquivo `index.html` deste repositório.
2. Abra o arquivo diretamente em qualquer navegador moderno (Chrome, Firefox, Edge, Safari).
3. Selecione seu arquivo `.root` local para iniciar a investigação técnica.

*Nota: É necessária uma conexão ativa com a internet para que o navegador carregue os módulos do JSROOT diretamente da infraestrutura do CERN.*

---

## 📊 Estrutura de Saída do Relatório

Ao processar um arquivo, a ferramenta renderiza a estrutura técnica no painel do console integrado da seguinte forma:

```text
INVESTIGANDO: dado_analise.root
============================================================

🌳 ÁRVORE ENCONTRADA: NomeDaTree (X eventos)
Branch                                             | Tipo
------------------------------------------------------------
  - NomeDaBranch_A                                 | TBranch
  - NomeDaBranch_B                                 | TBranch

--- [ ESTRUTURA DE HISTOGRAMAS (CLIQUE PARA PLOTAR) ] ---
[HIST] nome_do_histograma                          | TH1D
============================================================
AUDITORIA CONCLUÍDA.
