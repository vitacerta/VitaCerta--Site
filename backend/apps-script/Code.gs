const OPENAI_URL = 'https://api.openai.com/v1/responses';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('VitaCerta — Motor Editorial')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generateArticle(request) {
  try {
    const body = request || {};
    const section = clean_(body.section, 40);
    const topic = clean_(body.topic, 300);
    const format = clean_(body.format || 'artigo', 40);
    const notes = clean_(body.notes || '', 1500);

    if (!section || !topic) {
      return { ok: false, error: 'Seção e tema são obrigatórios.' };
    }

    const allowedSections = ['Saúde', 'Nutrição', 'Movimento', 'Mente', 'Longevidade'];
    if (!allowedSections.includes(section)) {
      return { ok: false, error: 'Seção editorial inválida.' };
    }

    const props = PropertiesService.getScriptProperties();
    const apiKey = props.getProperty('OPENAI_API_KEY');
    const model = props.getProperty('OPENAI_MODEL');

    if (!apiKey) {
      return { ok: false, error: 'OPENAI_API_KEY não configurada nas Propriedades do script.' };
    }
    if (!model) {
      return { ok: false, error: 'OPENAI_MODEL não configurado nas Propriedades do script.' };
    }

    const payload = {
      model: model,
      input: buildPrompt_(section, topic, format, notes),
      reasoning: { effort: 'medium' },
      tools: [{ type: 'web_search_preview' }]
    };

    const response = UrlFetchApp.fetch(OPENAI_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const status = response.getResponseCode();
    const raw = response.getContentText();
    let data;
    try { data = JSON.parse(raw); } catch (_) { data = null; }

    if (status < 200 || status >= 300 || !data) {
      return {
        ok: false,
        error: 'Falha na geração pela API.',
        status: status,
        detail: raw.slice(0, 1200)
      };
    }

    const text = extractOutputText_(data);
    if (!text) {
      return { ok: false, error: 'A API respondeu sem texto utilizável.' };
    }

    return {
      ok: true,
      article: text,
      model: data.model || model,
      response_id: data.id || null,
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'generate_article') {
      return json_({ ok: false, error: 'Ação inválida.' });
    }
    return json_(generateArticle(body));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function buildPrompt_(section, topic, format, notes) {
  return [
    'Você é o Motor Editorial do VitaCerta, um site brasileiro de saúde e bem-estar.',
    '',
    'MISSÃO',
    'Produzir um rascunho editorial completo, publicável somente após revisão humana, em português do Brasil.',
    '',
    'SEÇÃO PRINCIPAL: ' + section,
    'TEMA: ' + topic,
    'FORMATO: ' + format,
    notes ? 'ORIENTAÇÕES ADICIONAIS: ' + notes : '',
    '',
    'REGRAS EDITORIAIS OBRIGATÓRIAS',
    '- Pesquise fontes atuais e confiáveis antes de escrever.',
    '- Para alegações de saúde, priorize órgãos oficiais, sociedades médicas e literatura científica revisada por pares.',
    '- Não transforme associação em causalidade e não exagere conclusões.',
    '- Escreva em linguagem humana, clara, interessante e acessível, sem texto genérico de IA.',
    '- Não faça diagnóstico individual e não substitua orientação profissional.',
    '- Não invente dados, estudos, números, URLs ou referências.',
    '- Use monetização somente quando houver encaixe natural com o tema.',
    '- O conteúdo deve pertencer a apenas uma seção principal: Saúde, Nutrição, Movimento, Mente ou Longevidade.',
    '- Se o formato for Ciência Vital, inclua no início exatamente: “Uma série editorial que aproxima a ciência da vida real. Partimos de pesquisas científicas para transformar descobertas em conhecimento, porque acreditamos que conhecimento nos ajuda a fazer escolhas mais conscientes.”',
    '',
    'ENTREGUE NESTA ORDEM',
    '1. Título SEO',
    '2. Meta description',
    '3. Slug sugerido',
    '4. Seção',
    '5. Cluster sugerido',
    '6. Palavra-chave principal e palavras-chave secundárias',
    '7. Artigo completo em HTML simples pronto para publicação, com H1/H2/H3, parágrafos e um blockquote de destaque sem ícones',
    '8. Sugestões de links internos apenas quando houver encaixe real',
    '9. Referências utilizadas, com nome da fonte e URL',
    '10. Oportunidade de monetização, somente se pertinente',
    '',
    'IMPORTANTE: este resultado é um RASCUNHO. Não declare o conteúdo como publicado.'
  ].filter(Boolean).join('\n');
}

function extractOutputText_(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const out = data.output || [];
  const parts = [];
  out.forEach(item => {
    if (item && item.type === 'message' && Array.isArray(item.content)) {
      item.content.forEach(c => {
        if (c && c.type === 'output_text' && typeof c.text === 'string') parts.push(c.text);
      });
    }
  });
  return parts.join('\n').trim();
}

function clean_(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
