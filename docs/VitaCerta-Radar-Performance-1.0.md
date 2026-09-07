# VitaCerta Radar — Performance 1.0

## Objetivo

O Radar de Performance é a camada de análise pós-publicação do VitaCerta. Ele organiza e compara o desempenho real dos conteúdos usando exclusivamente métricas disponíveis no armazenamento canônico.

## Dependências

- `data/articles.json`
- `data/records.json`
- `radar/analysis-engine.js`
- `radar/performance-radar.js`

## Princípio central

Ausência de dado não é zero.

Quando uma métrica ainda não foi coletada, o Radar retorna:

`DADO NÃO DISPONÍVEL`

O sistema não estima visualizações, cliques, CTR, posição ou receita.

## Métricas previstas

### Audiência
- views
- users
- sessions
- engagement_time

### Busca orgânica
- impressions
- clicks
- ctr
- position

### Afiliados
- affiliate_clicks
- affiliate_conversions
- affiliate_revenue

### AdSense
- adsense_impressions
- adsense_clicks
- adsense_ctr
- rpm
- revenue

## Funções principais

### Ranking
Permite ordenar artigos do maior para o menor ou do menor para o maior por qualquer métrica disponível.

Exemplos futuros:
- artigo com mais visualizações;
- artigo com mais cliques orgânicos;
- maior CTR;
- melhor posição média;
- maior receita;
- maior conversão de afiliado.

### Filtros
O ranking pode ser limitado por:
- categoria;
- cluster;
- tipo de conteúdo;
- status de publicação;
- status de migração;
- idioma;
- período.

### Scorecard por artigo
Cada artigo pode receber um quadro individual com todas as métricas previstas. Métricas sem coleta aparecem explicitamente como indisponíveis.

## Estado atual

O inventário de conteúdo já possui registros reais.

As métricas de performance ainda dependem das integrações com GA4, Google Search Console, AdSense e plataformas de afiliados.

Enquanto essas integrações não existirem, `data/records.json` permanece sem números inventados.

## Próxima etapa

Radar de Oportunidade 1.0 — camada pré-produção responsável por organizar sinais externos e internos para apoiar a escolha de novos temas e atualizações editoriais.
