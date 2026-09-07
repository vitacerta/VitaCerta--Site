# VitaCerta Radar — Ciclo de Aprendizado 1.0

## Objetivo
Fechar o ciclo entre decisão editorial, publicação e resultado real, permitindo que o VitaCerta aprenda com o próprio desempenho sem transformar correlação ou hipótese em fato.

## Ciclo completo
Dados → Validação → Coleta → Análise → Radar Performance → Radar Oportunidade → Produção 75/25 → Publicação → Aprendizado → nova decisão.

## Entradas
- artigo publicado;
- registro de publicação;
- oportunidade que originou o conteúdo, quando houver;
- métricas canônicas de `data/records.json`;
- baseline comparável, quando disponível.

## Métricas inicialmente observadas
Visualizações, impressões, cliques, CTR, posição, conversões de afiliado, RPM e receita.

## Regras
1. Dados ausentes permanecem `DADO NÃO DISPONÍVEL`.
2. Registros inválidos e hipóteses classe D não entram como desempenho factual.
3. Observações, achados validados e hipóteses ficam separados.
4. Recomendações não alteram automaticamente o motor editorial.
5. A proporção 75/25 não é recalibrada automaticamente.
6. Qualquer proposta de mudança de pesos exige evidência interna suficiente e decisão administrativa.

## Armazenamento
`data/learning.json`

## Motor
`radar/learning-engine.js`

## Situação inicial
Como GA4, Search Console e monetização ainda não estão conectados ao repositório canônico, os primeiros registros de aprendizado permanecerão em `AGUARDANDO_DADOS` até existirem métricas reais.

## Marco alcançado
Com esta camada, a arquitetura lógica do VitaCerta Radar 1.0 fecha seu primeiro ciclo completo. A próxima fase deixa de ser criação de arquitetura e passa a ser operacionalização: interface Admin/Radar, conexão das fontes reais e execução do ciclo com conteúdo real.
