# VitaCerta Radar — MVP 1.0

## Status
Especificação inicial aprovada para orientar a construção do Radar e do Motor de Produção. A identidade visual atual do site é preservada e não deve ser alterada por esta especificação.

## 1. Princípios

1. Dados antes da IA.
2. Toda informação deve possuir origem rastreável.
3. Dado ausente deve aparecer como `DADO NÃO DISPONÍVEL`.
4. A IA não pode transformar hipótese em fato.
5. O administrador continua responsável pelas decisões estratégicas e táticas.
6. O Radar apresenta evidências; recomendações, quando existirem, devem ser claramente separadas dos dados.
7. O Motor de Produção começa com **75% de inteligência externa e 25% de inteligência interna**.
8. Os pesos 75/25 são configuráveis e poderão ser recalibrados conforme o histórico real do VitaCerta amadurecer.
9. O peso da fonte nunca pode alterar a veracidade de um fato.
10. O layout e a identidade visual atuais do VitaCerta são tratados como referência oficial.

## 2. Tipos de informação

### DADO APURADO
Valor coletado diretamente de uma fonte canônica.

### DADO CALCULADO
Valor matematicamente derivado de dados apurados, com fórmula registrada.

### INFERÊNCIA IDENTIFICADA
Interpretação derivada de dados, sempre acompanhada da regra utilizada e da evidência que a sustenta.

### DECISÃO
Ação escolhida pelo administrador, registrada com data, responsável, base de dados e resultado posterior.

## 3. Famílias de dados

### 3.1 Internos — VitaCerta

- artigos publicados;
- categoria, cluster e tipo de conteúdo;
- data de publicação e atualização;
- usuários;
- novos usuários;
- sessões;
- visualizações;
- páginas por sessão;
- tempo de engajamento;
- páginas de entrada e saída;
- recorrência;
- origem/canal;
- dispositivo;
- país/região;
- consultas, impressões, cliques, CTR e posição média de busca;
- indexação quando houver fonte confiável;
- AdSense: impressões, cliques, CTR, RPM e receita;
- afiliados: cliques, pedidos, vendas, comissão e conversão;
- desempenho por artigo, categoria e cluster.

### 3.2 Externos

- tendências e sazonalidade;
- comportamento de busca;
- temas emergentes;
- concorrentes e cobertura temática;
- frequência pública de publicação;
- mercado e categorias de produtos;
- ciência e pesquisas relevantes;
- diretrizes e posicionamentos de organizações oficiais;
- notícias relevantes;
- mudanças regulatórias;
- sinais públicos de comportamento do consumidor.

## 4. Registro canônico mínimo

Cada registro de dado deve permitir armazenar:

- `id`
- `source_type` — interno ou externo
- `source_name`
- `source_url` ou identificador da API/fonte
- `metric`
- `dimension`
- `period_start`
- `period_end`
- `collected_at`
- `value`
- `unit`
- `data_class` — apurado, calculado ou inferência
- `formula` — quando aplicável
- `inference_rule` — quando aplicável
- `evidence_level`
- `quality_status`
- `raw_reference`
- `last_updated`

## 5. Níveis de evidência

- **A — Apurado:** diretamente obtido de fonte canônica.
- **B — Calculado:** cálculo reproduzível a partir de dados A.
- **C — Inferência identificada:** interpretação explícita e auditável.
- **D — Hipótese não sustentada:** não pode ser usada como fato ou base automática de decisão.

## 6. Motor Universal de Análise

O Admin não deve possuir uma tela diferente para cada pergunta. Deve existir um componente reutilizável com:

- **Dimensão:** artigo, categoria, cluster, produto, consulta, concorrente, origem etc.
- **Métrica:** visualizações, tempo de engajamento, cliques, receita, comissão etc.
- **Período:** hoje, 7 dias, 30 dias, 90 dias ou personalizado.
- **Filtros:** categoria, tipo, origem, dispositivo, país etc.
- **Ordenação:** maior → menor ou menor → maior.
- **Limite:** quantidade de resultados.
- **Comparação:** período anterior, quando houver dados compatíveis.
- **Drill-down:** abrir o registro e visualizar sua origem/evidência.
- **Exportação:** quando implementada.

Exemplos de perguntas que o mesmo componente deve responder:

- Qual artigo teve mais visualizações?
- Qual artigo teve maior tempo de engajamento?
- Qual categoria cresceu mais?
- Qual review recebeu mais cliques de afiliado?
- Qual produto gerou mais comissão?
- Qual origem trouxe mais usuários?

## 7. Radar de Oportunidade — pré-produção

Objetivo: apresentar sinais e dados que permitam ao administrador decidir o que produzir, atualizar, quanto produzir, quando produzir e qual abordagem considerar.

O Radar deve organizar:

1. demanda e tendências;
2. lacunas temáticas;
3. concorrência;
4. ciência e atualizações relevantes;
5. sazonalidade;
6. oportunidade comercial;
7. histórico interno disponível.

A tela deve separar claramente **sinal observado** de **recomendação**.

## 8. Radar de Performance — pós-produção

Objetivo: mostrar o que aconteceu depois da publicação.

Principais dimensões:

- aquisição;
- comportamento;
- conteúdo;
- SEO;
- monetização;
- recorrência;
- evolução temporal.

O Radar deve permitir cruzamentos e ordenações pelo Motor Universal de Análise.

## 9. Motor de Produção

### Peso inicial

| Base | Peso |
|---|---:|
| Inteligência externa | 75% |
| Inteligência interna | 25% |

### Uso do peso

Os pesos orientam principalmente:

- escolha e priorização de temas;
- abordagem editorial;
- estrutura;
- profundidade;
- público;
- formato;
- atualização de conteúdo;
- oportunidades de monetização.

Os pesos **não** autorizam alteração de fatos científicos, números ou informações verificáveis.

### Recalibração

Os pesos devem ser parâmetros de configuração, e não valores fixos no código. Toda alteração deve registrar:

- valor anterior;
- novo valor;
- data;
- responsável;
- motivo;
- período de vigência.

## 10. Ciclo de aprendizado

`Dados externos + dados internos → Radar → decisão → produção → publicação → medição → aprendizado → Radar`

O desempenho de conteúdos publicados passa a alimentar a inteligência interna, aumentando progressivamente a capacidade do VitaCerta de aprender com seu próprio público.

## 11. Política de ausência de dados

Quando uma fonte não estiver conectada, indisponível ou não fornecer determinado indicador:

`DADO NÃO DISPONÍVEL`

Não utilizar estimativa silenciosa, preenchimento inventado ou informação produzida pela IA como substituto de dado ausente.

## 12. Identidade visual

O Radar/Admin poderá ter uma interface própria de operação, mas qualquer área voltada ao público deverá respeitar a identidade visual vigente do VitaCerta. O desenvolvimento desta especificação não autoriza alteração do layout público atual.

## 13. Ordem de implementação

1. Mapa de dados canônicos.
2. Modelo de armazenamento.
3. Registro e validação das fontes.
4. Coleta dos primeiros dados.
5. Motor Universal de Análise.
6. Radar de Performance.
7. Radar de Oportunidade.
8. Motor de Produção 75/25.
9. Integrações de publicação.
10. Ciclo de aprendizado e recalibração.
