# Spy Root Universal 🔬

Uma ferramenta de auditoria e inspeção visual para arquivos binários `.root` (CERN), executada **100% no lado do cliente (Client-Side)** diretamente através do navegador. 

**🌐 Demonstração Online:** [ncevidanes.github.io/roots/](https://ncevidanes.github.io/roots/)

---

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido para resolver uma dor clássica em ambientes de Física de Altas Energias: a necessidade de inspecionar a estrutura de um arquivo `.root` sem precisar abrir um terminal Linux, carregar ambientes virtuais complexos ou compilar macros em C++. 

O **Spy Root Universal** atua como um auditor leve e agnóstico, permitindo o mapeamento profundo de metadados de `TTrees` e a renderização instantânea de histogramas pré-existentes.

---

## ✨ Funcionalidades Principais

* **Auditoria de Hierarquia Bruta (Deep Scan):** Diferente de leitores de superfície, a ferramenta acessa o array binário interno de chaves (`fBranches.arr`) do arquivo ROOT. Isso garante o mapeamento de branches complexas e estruturadas (típicas de ambientes xAOD do ATLAS/CERN).
* **Mapeamento de Objetos:** Varredura recursiva de diretórios (`TDirectory`) dentro do arquivo binário para catalogação de chaves.
* **Visualização Estática e Dinâmica:** Renderização interativa de histogramas (`TH1D`, `TH2D`, etc.) através de cliques na árvore de metadados, utilizando aceleração gráfica no canvas.
* **Exportação de Auditoria (CSV):** Geração automática de relatórios textuais da estrutura do arquivo para validação e documentação de repositórios de dados.
* **Zero Dependência de Servidor:** Segurança total dos dados. O processamento ocorre inteiramente na memória RAM do seu navegador, sem upload do arquivo para servidores externos.

---

## 🛠️ Arquitetura Técnica

A implementação do projeto é **100% contida em um único arquivo HTML (`index.html`)**, eliminando barreiras de implantação (*deployment*), configuração de servidores Node.js ou gerenciadores de pacotes pesados.

* **Frontend:** HTML5, CSS3 (Variações de layout baseadas em Cyberpunk/Neon Green de alta legibilidade para terminais).
* **Motor de Leitura Binária:** Módulos nativos ES6 do **JSROOT (CERN)** carregados via CDN (Content Delivery Network).
* **Gerenciamento de Memória:** Rotinas explícitas de `cleanup()` acionadas a cada troca de arquivo ou plotagem, mitigando vazamentos de memória (Memory Leaks) ao manipular arquivos volumosos.

---

## 🚀 Como Executar Localmente

Por ser uma aplicação baseada inteiramente em tecnologias web padrão, você não precisa instalar nada.

1. Baixe o arquivo `index.html` deste repositório.
2. Abra-o em qualquer navegador moderno (Chrome, Firefox, Edge, Safari).
3. Selecione seu arquivo `.root` local e inicie a investigação técnica.

*Nota: Para carregar os módulos do JSROOT diretamente do servidor do CERN, o seu computador precisa estar conectado à internet durante a execução.*

---

## 📊 Estrutura de Saída do Relatório

Ao auditar um arquivo, a ferramenta estrutura os dados no painel do console da seguinte forma:

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
