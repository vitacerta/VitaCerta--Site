# VitaCerta Radar — Radar de Oportunidade 1.0

## Objetivo
Identificar e priorizar temas antes da produção editorial, combinando sinais externos e internos sem transformar hipótese em fato.

## Regra inicial de priorização
- Inteligência externa: 75%
- Inteligência interna: 25%

Os pesos servem exclusivamente à decisão editorial e não alteram fatos, evidências ou resultados de pesquisa.

## Fluxo
Sinais externos + sinais internos → oportunidade candidata → validação → score → ranking → decisão editorial → produção.

## Dados externos esperados
Podem incluir demanda de busca, tendência, atualidade, relevância científica, concorrência observável, interesse de mercado e oportunidade comercial, sempre acompanhados de fonte/evidência.

## Dados internos esperados
Podem incluir desempenho histórico por artigo, categoria, cluster, consulta, CTR, audiência, engajamento e monetização. Na ausência desses dados, o sistema deve registrar `DADO NÃO DISPONÍVEL`.

## Armazenamento
As oportunidades ficam em `data/opportunities.json`.

## Motor
A lógica está em `radar/opportunity-radar.js`.

## Regra de score
O score combinado somente é calculado quando existem scores externos e internos válidos (0–100). Fórmula inicial:

`score = externo × 0,75 + interno × 0,25`

Se um componente estiver ausente, o Radar não inventa valor substituto: retorna `DADO NÃO DISPONÍVEL`.

## Estados
- CANDIDATA
- PRIORIZADA
- EM_PRODUCAO
- PUBLICADA
- DESCARTADA

## Próxima etapa
Conectar o Radar de Oportunidade ao Motor de Produção Editorial 75/25, preservando evidência, rastreabilidade e decisão administrativa.
