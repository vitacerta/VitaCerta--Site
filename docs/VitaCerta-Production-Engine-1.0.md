# VitaCerta — Motor de Produção Editorial 1.0

## Função
Transformar oportunidades priorizadas pelo Radar em briefs editoriais rastreáveis para produção de conteúdo.

## Mistura inicial de inteligência
- 75% inteligência externa
- 25% inteligência interna

Essa proporção orienta decisões editoriais como tema, abordagem, estrutura, profundidade, público, formato, atualização e monetização. Ela nunca altera fatos.

## Entradas
O motor recebe uma oportunidade do `data/opportunities.json`, incluindo evidências externas e internas disponíveis.

## Saída
O motor produz um item para `data/production-queue.json` contendo tópico, categoria, cluster, intenção de busca, pesos, evidências, brief, abordagem, formato, estado de prontidão e status de produção.

## Portões de segurança editorial
- afirmações factuais exigem evidência;
- métricas ausentes não podem ser inventadas;
- fatos, cálculos, inferências e hipóteses devem permanecer distinguíveis;
- publicação automática fica desativada nesta versão;
- conteúdo exige revisão antes de publicação.

## Status da fila
AGUARDANDO_BRIEF → BRIEF_PRONTO → APROVADO → EM_REDACAO → EM_REVISAO → PRONTO_PARA_PUBLICAR → PUBLICADO.

## Estado atual
A infraestrutura do motor está implantada, mas a fila começa vazia por desenho. O primeiro conteúdo somente deve entrar quando existir uma oportunidade com evidências suficientes.

## Próxima etapa
Implementar a camada de Publicação e, em seguida, fechar o ciclo de Aprendizado usando os resultados reais do Radar de Performance.
