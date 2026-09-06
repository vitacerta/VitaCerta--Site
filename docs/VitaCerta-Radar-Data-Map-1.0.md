# VitaCerta Radar — Mapa de Dados Canônicos 1.0

## Objetivo

Definir, antes da programação do Radar, quais dados serão coletados, de onde vêm, como serão classificados e para que poderão ser usados.

Regra central:

`COLETAR → VALIDAR → ORGANIZAR → COMPARAR → VISUALIZAR → REGISTRAR DECISÕES`

A IA não substitui uma fonte de dados ausente.

## 1. Classes de dados

| Classe | Definição | Uso em decisão |
|---|---|---|
| A — APURADO | Coletado diretamente da fonte canônica | Sim |
| B — CALCULADO | Derivado matematicamente de dados apurados | Sim |
| C — INFERÊNCIA IDENTIFICADA | Interpretação explícita baseada em evidências A/B | Sim, como interpretação |
| D — HIPÓTESE | Não sustentada por evidência suficiente | Não |

## 2. Fontes internas prioritárias

### 2.1 Conteúdo VitaCerta

| Dado | Dimensão | Fonte canônica esperada | Classe |
|---|---|---|---|
| ID do artigo | artigo | banco/repositório do VitaCerta | A |
| título | artigo | banco/repositório do VitaCerta | A |
| URL | artigo | banco/repositório do VitaCerta | A |
| categoria | artigo | banco/repositório do VitaCerta | A |
| cluster | artigo | banco/repositório do VitaCerta | A |
| tipo de conteúdo | artigo | banco/repositório do VitaCerta | A |
| publicação | artigo | banco/repositório do VitaCerta | A |
| atualização | artigo | banco/repositório do VitaCerta | A |
| status editorial | artigo | banco/repositório do VitaCerta | A |

### 2.2 Analytics

| Dado | Dimensão | Fonte canônica esperada | Classe |
|---|---|---|---|
| usuários | período/artigo/origem | Google Analytics 4 | A |
| novos usuários | período/artigo/origem | Google Analytics 4 | A |
| sessões | período/artigo/origem | Google Analytics 4 | A |
| visualizações | período/artigo | Google Analytics 4 | A |
| tempo de engajamento | período/artigo | Google Analytics 4 | A |
| páginas por sessão | período/artigo | GA4 ou cálculo documentado | A/B |
| página de entrada | artigo | Google Analytics 4 | A |
| página de saída | artigo | Google Analytics 4 | A |
| recorrência | período/usuário agregado | Google Analytics 4 | A/B |
| dispositivo | período/artigo | Google Analytics 4 | A |
| país/região | período/artigo | Google Analytics 4 | A |
| origem/canal | período/artigo | Google Analytics 4 | A |

### 2.3 Search Console

| Dado | Dimensão | Fonte canônica esperada | Classe |
|---|---|---|---|
| impressões | consulta/página/período | Google Search Console | A |
| cliques | consulta/página/período | Google Search Console | A |
| CTR | consulta/página/período | Search Console ou cálculo | A/B |
| posição média | consulta/página/período | Google Search Console | A |
| consulta | busca/página | Google Search Console | A |
| página | URL | Google Search Console | A |

### 2.4 Monetização

| Dado | Dimensão | Fonte canônica esperada | Classe |
|---|---|---|---|
| impressões de anúncio | período/página | AdSense | A |
| cliques em anúncio | período/página | AdSense | A |
| CTR de anúncio | período/página | AdSense ou cálculo | A/B |
| RPM | período/página | AdSense ou cálculo | A/B |
| receita | período/página | AdSense | A |
| cliques de afiliado | artigo/produto | plataforma de afiliado | A |
| pedidos | artigo/produto | plataforma de afiliado | A |
| vendas | artigo/produto | plataforma de afiliado | A |
| comissão | artigo/produto | plataforma de afiliado | A |
| conversão | artigo/produto | cálculo documentado | B |

## 3. Fontes externas prioritárias

As fontes externas serão cadastradas individualmente no registro de fontes. A prioridade inicial é:

1. órgãos oficiais e organizações científicas;
2. bases e publicações científicas confiáveis;
3. fontes de mercado com metodologia identificável;
4. mecanismos e sinais públicos de busca;
5. concorrentes e publishers, somente para fatos públicos observáveis;
6. fontes comerciais, quando necessárias para dados de produto/mercado.

Nenhuma fonte externa deve ser tratada como equivalente a outra sem registrar sua natureza e qualidade.

## 4. Registro de fonte

Cada fonte conectada deverá possuir, no mínimo:

- `source_id`
- `source_name`
- `source_type`
- `provider`
- `url`
- `api_or_manual`
- `collection_frequency`
- `coverage`
- `last_successful_collection`
- `status`
- `quality_status`
- `notes`

Status possíveis:

- `ATIVA`
- `PAUSADA`
- `ERRO`
- `NÃO CONECTADA`

## 5. Registro canônico de dado

Estrutura mínima:

```text
id
source_type
source_id
source_name
source_url
metric
dimension
dimension_id
period_start
period_end
collected_at
value
unit
data_class
formula
inference_rule
evidence_level
quality_status
raw_reference
last_updated
```

## 6. Validação

Antes de entrar nos indicadores do Radar, cada lote deve passar por:

1. existência da fonte;
2. período válido;
3. unidade identificada;
4. dimensão identificada;
5. valor compatível com o tipo de métrica;
6. ausência de duplicidade;
7. identificação da coleta;
8. registro de erro, quando houver.

Falha de validação não deve ser silenciosamente corrigida pela IA.

## 7. Métricas calculadas iniciais

### Crescimento percentual

`((valor_atual - valor_anterior) / valor_anterior) × 100`

Só calcular quando houver base anterior válida e diferente de zero.

### CTR de busca

`(cliques / impressões) × 100`

### Conversão de afiliado

`(pedidos ou vendas / cliques de afiliado) × 100`

A definição exata de conversão deverá ser configurável conforme a plataforma.

### Receita por mil visualizações

Quando a fonte permitir comparação compatível:

`(receita / visualizações) × 1000`

Toda métrica calculada deve guardar a fórmula utilizada.

## 8. Regras de ausência

Se uma fonte ainda não estiver conectada:

`DADO NÃO DISPONÍVEL`

Se a fonte estiver conectada, mas não retornar o indicador:

`DADO NÃO DISPONÍVEL`

Se houver erro de coleta:

`ERRO DE COLETA`

Não usar estimativa automática para preencher qualquer desses casos.

## 9. Ordem de conexão

### Fase 1 — núcleo interno

1. Conteúdo/artigos.
2. Status de publicação.
3. Categorias e clusters.

### Fase 2 — comportamento

4. Google Analytics 4.

### Fase 3 — SEO

5. Google Search Console.

### Fase 4 — monetização

6. Google AdSense.
7. Plataforma(s) de afiliados.

### Fase 5 — inteligência externa

8. Fontes científicas/oficiais.
9. Tendências e sinais de busca.
10. Mercado, produtos e concorrência.

A ordem poderá mudar somente mediante decisão registrada.

## 10. Primeiro painel técnico do Admin

Antes do Radar visual, o Admin deverá conseguir responder:

- quais fontes estão conectadas;
- quais estão funcionando;
- quando ocorreu a última coleta;
- quais métricas cada fonte fornece;
- quais dados estão ausentes;
- quais registros falharam na validação.

Esse painel é a base de confiança do Radar.

## 11. Critério para avançar

Não iniciar o Motor de Produção automático antes de existir:

- mapa de dados;
- registro de fontes;
- validação;
- primeiros dados internos;
- Motor Universal de Análise;
- Radar de Performance mínimo.
