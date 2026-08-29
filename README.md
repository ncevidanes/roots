# Spy Root Universal 1.1

Aplicação web estática para auditar a estrutura de arquivos binários ROOT no
navegador. O conteúdo dos arquivos selecionados é processado localmente com
JSROOT 7.11.0.

## O que mudou nesta versão

- varredura recursiva de todos os `TDirectory`;
- descoberta de `TTree` e `TNtuple` em qualquer nível;
- catalogação de todas as chaves ROOT, inclusive classes desconhecidas;
- classificação de histogramas, perfis, gráficos, funções, eficiências,
  canvases, geometrias, coleções e metadados;
- visualização das classes com suporte de desenho conhecido no JSROOT;
- seleção e auditoria sequencial de até 20 arquivos;
- construção segura do relatório com DOM, sem inserir nomes ROOT em
  `innerHTML`;
- exportação CSV com escape de campos e proteção contra fórmulas;
- JSROOT fixado na versão 7.11.0;
- testes automatizados para classificação, caminhos, branches, recursão e CSV.

Classes não reconhecidas continuam aparecendo como **Outro objeto**. A aplicação
não tenta desenhá-las automaticamente, mas preserva classe, caminho, ciclo,
título e tamanho da chave no relatório.

## Estrutura

```text
index.html
styles.css
src/
  app.js
  application/
    audit-service.js
    root-structure-scanner.js
  domain/
    audit-entry.js
    branch-scanner.js
    root-object-classifier.js
    root-path.js
  infrastructure/
    audit-csv.js
    jsroot-adapter.js
  presentation/
    object-viewer.js
    report-view.js
    status-view.js
tests/
```

As responsabilidades e decisões de projeto estão detalhadas em
[`docs/architecture.md`](docs/architecture.md).

## Executar localmente

Os módulos ES6 devem ser servidos por HTTP. No diretório do projeto:

```bash
python3 -m http.server 8000
```

Abra:

```text
http://localhost:8000
```

Também é possível executar:

```bash
npm run serve
```

Não existem dependências npm de produção. Uma conexão com a internet é
necessária para carregar o módulo JSROOT 7.11.0 da infraestrutura do CERN.

## Testes

Requisito: Node.js 20 ou posterior.

```bash
npm test
```

Os testes usam adaptadores ROOT simulados e não enviam nem modificam arquivos
reais.

## Publicar no GitHub Pages

Copie o conteúdo desta pasta para a raiz do repositório ou para a branch
configurada como fonte do GitHub Pages. O `index.html` é o ponto de entrada e
usa apenas caminhos relativos.

## Limites deliberados

- `TTree` e `TNtuple` têm sua estrutura de branches catalogada, mas não são
  desenhados sem que o usuário forneça uma expressão;
- `RNTuple` é catalogado como estrutura colunar, mas sua árvore de campos ainda
  não é expandida nesta versão;
- objetos desconhecidos são catalogados, mas não desenhados;
- os arquivos são auditados sequencialmente para reduzir picos de memória;
- o limite padrão é de 20 arquivos por auditoria.

## Dados ROOT

Arquivos ROOT selecionados pelo usuário são dados locais e não fazem parte dos
requisitos de execução ou da suíte automatizada de testes. A política para
fixtures e dados binários está documentada em
[`docs/data-policy.md`](docs/data-policy.md).

## Referências

- [Manual do JSROOT](https://root.cern/manual/jsroot/)
- [JSROOT 7.11.0](https://root.cern/js/7.11.0/)
- [Classes suportadas pelo JSROOT](https://github.com/root-project/jsroot/blob/master/docs/JSROOT.md#supported-root-classes-by-jsroot)
