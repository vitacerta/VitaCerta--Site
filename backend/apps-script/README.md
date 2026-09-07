# VitaCerta — Backend do Motor Editorial

Este diretório contém a camada de servidor usada pela Central de Produção do Radar.

## Arquitetura

`Radar no GitHub Pages` → `Apps Script` → `OpenAI Responses API` → `rascunho no Radar` → `aprovação manual` → `publicação`

A chave da API **nunca deve** ser colocada no GitHub Pages nem em qualquer arquivo público deste repositório. Ela fica em `PropertiesService` do Google Apps Script.

O arquivo `Index.html` não é uma segunda interface de produção. Ele funciona como uma ponte entre a página `admin/producao.html` e o Apps Script, usando `postMessage` + `google.script.run`, evitando expor a chave no navegador.

## Configuração no Google Apps Script

1. Crie um novo projeto no Google Apps Script.
2. Substitua o conteúdo de `Código.gs` pelo conteúdo de `backend/apps-script/Code.gs`.
3. Crie um arquivo HTML chamado `Index` e cole o conteúdo de `backend/apps-script/Index.html`.
4. Em **Configurações do projeto > Propriedades do script**, crie:
   - `OPENAI_API_KEY` = sua chave da API OpenAI.
   - `OPENAI_MODEL` = opcional. Se omitido, o backend usa `gpt-5.6-terra`.
5. Clique em **Implantar > Nova implantação > App da Web**.
6. Execute como a conta proprietária do script.
7. Sempre que a opção estiver disponível e funcionar no navegador usado pelo administrador, prefira restringir o acesso ao próprio administrador em vez de deixar a implantação pública.
8. Copie a URL `/exec` da implantação.
9. Essa URL será cadastrada na Central de Produção do VitaCerta. A URL do Apps Script não é uma chave secreta; a `OPENAI_API_KEY` continua somente nas Propriedades do script.

## Segurança

O backend protege a chave da OpenAI porque ela permanece no Apps Script. O `Index.html` aceita comandos do parent apenas quando a origem é `https://vitacerta.github.io`.

Isso reduz exposição acidental, mas não substitui o controle de acesso do próprio Apps Script. Evite implantação pública irrestrita sempre que for possível usar uma implantação acessível somente pela conta administradora.

## Fluxo editorial 1.0

A especificação funcional do VitaCerta segue aprovação humana obrigatória:

`Solicitação` → `Briefing` → `aprovação do briefing` → `Geração` → `revisão/reescrita` → `aprovação do texto` → `Capa` → `aprovação da capa` → `Revisão final` → `Publicação` → `Aprendizado`

Nenhuma geração publica automaticamente. Nenhum aprendizado altera o padrão editorial sem aprovação manual do administrador.

## Estado atual deste backend

O backend já possui:

- `healthCheck()` para validar configuração;
- `generateArticle(request)` para gerar o pacote editorial;
- pesquisa web via ferramenta da Responses API;
- Prompt Mestre VitaCerta em Modo Externo Provisório;
- retorno estruturado com artigo, SEO, slug, seção, cluster, palavras-chave, referências, links internos sugeridos e oportunidade de monetização;
- ponte por `postMessage` preparada para a Central de Produção.

A geração de capa, revisão/re-escrita e publicação no GitHub serão conectadas nas próximas camadas.
