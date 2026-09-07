# VitaCerta — Backend do Motor Editorial

Este diretório contém a camada de servidor usada pela Central de Produção do Radar.

## Objetivo

Receber uma solicitação editorial da página `admin/producao.html`, chamar a OpenAI de forma segura e devolver o rascunho para revisão humana.

A chave da API **não deve** ser colocada no GitHub Pages nem em qualquer arquivo público deste repositório.

## Configuração no Google Apps Script

1. Crie um novo projeto no Google Apps Script.
2. Substitua o conteúdo de `Código.gs` pelo conteúdo de `backend/apps-script/Code.gs`.
3. Em **Configurações do projeto > Propriedades do script**, crie:
   - `OPENAI_API_KEY` = sua chave da API OpenAI.
   - `OPENAI_MODEL` = modelo que deseja usar. Se omitido, o código tentará `gpt-5.6`.
4. Clique em **Implantar > Nova implantação > App da Web**.
5. Execute como a conta proprietária do script.
6. Defina a política de acesso compatível com a forma de autenticação escolhida para o Radar.
7. Copie a URL `/exec` da implantação.
8. Informe essa URL na Central de Produção do VitaCerta quando o campo de endpoint estiver habilitado.

## Segurança

O backend protege a chave da OpenAI porque ela permanece em `PropertiesService` do Apps Script. Entretanto, uma implantação pública do Apps Script sem autenticação pode sofrer uso indevido. Antes de colocar o Motor em produção contínua, aplique autenticação/restrição de acesso ao endpoint.

## Fluxo previsto

`SOLICITADO` → `GERANDO` → `RASCUNHO` → `APROVADO` → `PUBLICADO`

A geração automática nunca publica o conteúdo. A publicação exige aprovação humana explícita no Radar.
