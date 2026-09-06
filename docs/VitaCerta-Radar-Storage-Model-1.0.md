# VitaCerta Radar — Modelo de Armazenamento 1.0

## Status

Implantado como base técnica da etapa 2 do Radar.

Este modelo transforma o Mapa de Dados Canônicos 1.0 em uma estrutura de arquivos utilizável pelo projeto atual em GitHub Pages, sem alterar o layout público do VitaCerta.

## 1. Objetivo

Criar uma base simples, auditável e evolutiva para armazenar:

- configuração do Radar e do Motor de Produção;
- artigos e metadados editoriais;
- fontes conectadas ou ainda não conectadas;
- registros canônicos de métricas;
- decisões administrativas e futuras recalibrações.

A estrutura inicial usa JSON porque o projeto atual é estático e está hospedado no GitHub Pages. A adoção futura de banco de dados ou API não deve alterar o significado dos campos canônicos definidos aqui.

## 2. Estrutura implantada

```text
data/
├── config.json
├── articles.json
├── sources.json
├── records.json
└── decisions.json
```

## 3. config.json

Guarda parâmetros globais do sistema.

Inclui:

- versão do schema;
- política de dado ausente;
- política de erro de coleta;
- peso inicial de inteligência externa: 75%;
- peso inicial de inteligência interna: 25%;
- níveis de evidência;
- status permitidos para fontes e qualidade.

Os pesos são parâmetros e não devem ser fixados em componentes futuros da interface.

## 4. articles.json

É a fonte canônica inicial para cadastro dos conteúdos VitaCerta.

Cada artigo poderá guardar:

- identificador estável;
- título e slug;
- URL atual;
- idioma;
- categoria;
- cluster;
- tipo de conteúdo;
- data de publicação e atualização;
- status editorial;
- metadados SEO;
- imagem destacada;
- origem;
- URL legada do Blogger;
- status de migração;
- última sincronização.

O `article_id` deve permanecer estável mesmo se título, slug ou URL mudarem.

## 5. sources.json

É o registro oficial das fontes.

Foram pré-cadastradas nesta versão:

1. Conteúdo VitaCerta — ATIVA;
2. Google Analytics 4 — NÃO CONECTADA;
3. Google Search Console — NÃO CONECTADA;
4. Google AdSense — NÃO CONECTADA.

Fontes externas e plataformas de afiliados serão incluídas na etapa seguinte, Registro e Validação de Fontes.

Nenhuma fonte deve ser considerada operacional apenas porque está cadastrada.

## 6. records.json

É o armazenamento canônico de métricas e observações coletadas.

Campos previstos:

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

O arquivo começa vazio por projeto. Dados não devem ser inventados para preencher a base.

## 7. decisions.json

Registra decisões administrativas relevantes para aprendizado posterior.

Pode registrar:

- mudança de pesos;
- escolha editorial;
- alteração de critérios;
- decisão de priorização;
- período de vigência;
- evidências utilizadas;
- resultado medido posteriormente.

Assim, o sistema poderá comparar decisão, execução e resultado sem depender da memória da IA.

## 8. Regras de integridade

### Identificadores

Todos os objetos devem possuir identificador estável e único dentro de sua coleção.

### Ausência de dados

Ausência real de informação não deve virar zero.

Quando uma camada visual precisar representar ausência, utilizar:

`DADO NÃO DISPONÍVEL`

Quando uma coleta falhar:

`ERRO DE COLETA`

### Nulos

Campos opcionais podem usar `null` até que exista informação canônica.

### Datas

Novas rotinas devem preferir padrão ISO 8601.

### Evidência

Dados calculados devem guardar fórmula.

Inferências devem guardar regra de inferência e referência da evidência utilizada.

### Duplicidade

O mesmo registro de métrica não deve ser inserido duas vezes para a mesma combinação de fonte, dimensão, identificador, métrica e período.

## 9. Evolução prevista

Nesta fase o JSON funciona como camada canônica simples.

Quando volume, frequência de coleta ou concorrência de escrita exigirem, a estrutura poderá migrar para banco de dados ou serviço de API mantendo os mesmos conceitos lógicos.

A interface pública não deve ler dados administrativos sensíveis diretamente. GitHub Pages é público, portanto apenas dados adequados para repositório público devem ser gravados nesta fase.

Nunca armazenar chaves de API, tokens, credenciais, identificadores secretos ou dados pessoais sensíveis nesses arquivos.

## 10. Critério de conclusão da etapa 2

A etapa Modelo de Armazenamento é considerada implantada quando existirem:

- configuração canônica;
- cadastro canônico de artigos;
- registro de fontes;
- armazenamento de métricas;
- registro de decisões;
- documentação das regras de integridade.

Com esses itens implantados, o próximo passo da ordem aprovada é:

**Etapa 3 — Registro e Validação das Fontes.**
