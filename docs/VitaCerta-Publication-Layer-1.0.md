# VitaCerta — Camada de Publicação 1.0

## Objetivo
Transformar itens aprovados da fila de produção em publicações rastreáveis, preservando revisão humana e impedindo publicação automática nesta fase.

## Entradas
Itens de `data/production-queue.json` com status compatível com publicação.

## Saída
Registros em `data/publications.json` contendo título, slug, idioma, categoria, cluster, SEO, imagem, referências, links internos, monetização, status de revisão, responsável pela aprovação, caminho HTML, URL pública e datas.

## Regras
- publicação automática: desativada;
- revisão humana: obrigatória;
- slug: obrigatório e único;
- URL pública: obrigatória após publicação;
- referências de fonte: exigidas para prontidão editorial;
- meta description: exigida para prontidão editorial;
- um item só pode ser marcado como PUBLICADO depois de APROVADO.

## Fluxo
Produção aprovada → rascunho de publicação → revisão → aprovação → criação/implantação do artefato → URL pública → status PUBLICADO.

## Implementação
- `data/publications.json`
- `radar/publication-engine.js`

## Estado atual
A infraestrutura está implantada, mas não há publicação automática. Nenhum conteúdo é publicado sem evidência, revisão e aprovação.

## Próxima etapa
Fechar o ciclo de Aprendizado: relacionar publicação, métricas reais, performance, decisão editorial e futura recalibração dos pesos do motor.
