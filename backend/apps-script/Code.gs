const VITACERTA_CONFIG = {
  defaultModel: 'gpt-5.6-terra',
  apiUrl: 'https://api.openai.com/v1/responses',
  allowedParentOrigin: 'https://vitacerta.github.io'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('VitaCerta — Motor Editorial')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function healthCheck() {
  const props = PropertiesService.getScriptProperties();
  return {
    ok: true,
    service: 'vitacerta-editorial',
    has_openai_key: Boolean(props.getProperty('OPENAI_API_KEY')),
    model: props.getProperty('OPENAI_MODEL') || VITACERTA_CONFIG.defaultModel,
    checked_at: new Date().toISOString()
  };
}

function generateArticle(request) {
  try {
    validateRequest_(request);

    const props = PropertiesService.getScriptProperties();
    const apiKey = props.getProperty('OPENAI_API_KEY');
    const model = props.getProperty('OPENAI_MODEL') || VITACERTA_CONFIG.defaultModel;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada nas Propriedades do script.');
    }

    const payload = {
      model: model,
      tools: [{ type: 'web_search' }],
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: buildSystemPrompt_() }]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: buildUserPrompt_(request) }]
        }
      ]
    };

    const response = UrlFetchApp.fetch(VITACERTA_CONFIG.apiUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const status = response.getResponseCode();
    const raw = response.getContentText();
    let data;

    try {
      data = JSON.parse(raw);
    } catch (e) {
      throw new Error('Resposta inválida da API OpenAI. HTTP ' + status + '.');
    }

    if (status < 200 || status >= 300) {
      const apiMessage = data && data.error && data.error.message ? data.error.message : raw;
      throw new Error('OpenAI HTTP ' + status + ': ' + apiMessage);
    }

    const outputText = extractOutputText_(data);
    if (!outputText) {
      throw new Error('A API respondeu sem conteúdo de texto utilizável.');
    }

    const editorial = parseEditorialPackage_(outputText, request);

    return {
      ok: true,
      model: model,
      response_id: data.id || '',
      generated_at: new Date().toISOString(),
      editorial: editorial,
      article: editorial.article_html || editorial.article || outputText,
      raw_output: outputText
    };
  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
      generated_at: new Date().toISOString()
    };
  }
}

function validateRequest_(request) {
  if (!request || typeof request !== 'object') {
    throw new Error('Solicitação editorial inválida.');
  }

  const topic = String(request.topic || '').trim();
  const section = String(request.section || '').trim();
  const format = String(request.format || '').trim();

  if (!topic) throw new Error('Informe o tema do conteúdo.');
  if (!section) throw new Error('Informe a seção do conteúdo.');
  if (!format) throw new Error('Informe o formato do conteúdo.');

  const allowedSections = ['Saúde', 'Nutrição', 'Movimento', 'Mente', 'Longevidade'];
  if (allowedSections.indexOf(section) === -1) {
    throw new Error('Seção editorial inválida.');
  }
}

function buildSystemPrompt_() {
  return [
    'Você é o Motor Editorial do VitaCerta, publicação brasileira de saúde, nutrição, movimento, mente e longevidade.',
    'Escreva em português do Brasil, com linguagem humana, clara, interessante e acessível.',
    'MODO ATUAL: Externo Provisório. Use pesquisa externa real e atual. Não invente dados internos do VitaCerta.',
    'Antes de redigir, pesquise fontes atuais e confiáveis. Para afirmações médicas relevantes, priorize órgãos oficiais, sociedades médicas, universidades e literatura científica revisada por pares.',
    'Não transforme associação em causalidade, hipótese em fato ou evidência limitada em consenso.',
    'Não faça diagnóstico individual nem prescrição médica personalizada.',
    'Evite texto genérico, enchimento, clickbait enganoso e exageros científicos.',
    'A estrutura deve ter H1 forte, introdução, desenvolvimento com H2/H3 quando útil, bloco de destaque sem ícones, conclusão útil e referências.',
    'Inclua links internos somente quando forem genuinamente relevantes. Não invente URLs internas.',
    'Monetização só deve aparecer quando fizer sentido editorial. Não force produto ou afiliado.',
    'Para Ciência Vital, use somente quando o formato solicitado for ciencia-vital a introdução editorial obrigatória: “Uma série editorial que aproxima a ciência da vida real. Partimos de pesquisas científicas para transformar descobertas em conhecimento, porque acreditamos que conhecimento nos ajuda a fazer escolhas mais conscientes.”',
    'Retorne APENAS um objeto JSON válido, sem markdown e sem cercas de código, usando exatamente as chaves pedidas no prompt do usuário.'
  ].join('\n');
}

function buildUserPrompt_(request) {
  const notes = String(request.notes || '').trim();
  const briefing = request.briefing ? JSON.stringify(request.briefing) : '';

  return [
    'Crie um pacote editorial VitaCerta para a solicitação abaixo.',
    '',
    'TEMA: ' + String(request.topic || '').trim(),
    'SEÇÃO: ' + String(request.section || '').trim(),
    'FORMATO: ' + String(request.format || '').trim(),
    'ORIENTAÇÃO DO ADMINISTRADOR: ' + (notes || 'Nenhuma orientação adicional.'),
    'BRIEFING APROVADO: ' + (briefing || 'Não fornecido nesta chamada.'),
    '',
    'O JSON deve conter exatamente estas chaves:',
    'title_public, seo_title, meta_description, slug, section, cluster, primary_keyword, secondary_keywords, highlighted_block, article_html, internal_links_suggested, references, monetization_opportunity, research_notes.',
    '',
    'Regras de formato:',
    '- secondary_keywords: array de strings.',
    '- internal_links_suggested: array de objetos com title, url e reason. Se não houver link real confirmado, use array vazio.',
    '- references: array de objetos com title, source, url e relevance.',
    '- monetization_opportunity: string curta; use string vazia se não houver oportunidade natural.',
    '- research_notes: string curta explicando limites, divergências ou cuidados de evidência relevantes.',
    '- article_html: HTML pronto para publicação, começando pelo <h1>, sem <html>, <head> ou <body>.',
    '- highlighted_block deve também aparecer integrado naturalmente dentro de article_html em um <blockquote>.',
    '- Não inclua texto fora do JSON.'
  ].join('\n');
}

function extractOutputText_(data) {
  if (data && typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  const output = data && Array.isArray(data.output) ? data.output : [];

  output.forEach(function(item) {
    if (!item || !Array.isArray(item.content)) return;
    item.content.forEach(function(content) {
      if (!content) return;
      if (content.type === 'output_text' && typeof content.text === 'string') {
        parts.push(content.text);
      }
    });
  });

  return parts.join('\n').trim();
}

function parseEditorialPackage_(text, request) {
  let cleaned = String(text || '').trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    const parsed = JSON.parse(cleaned);
    return normalizeEditorialPackage_(parsed, request);
  } catch (e) {
    return normalizeEditorialPackage_({ article_html: cleaned }, request);
  }
}

function normalizeEditorialPackage_(data, request) {
  const packageData = data && typeof data === 'object' ? data : {};

  return {
    title_public: String(packageData.title_public || request.topic || '').trim(),
    seo_title: String(packageData.seo_title || packageData.title_public || request.topic || '').trim(),
    meta_description: String(packageData.meta_description || '').trim(),
    slug: String(packageData.slug || '').trim(),
    section: String(packageData.section || request.section || '').trim(),
    cluster: String(packageData.cluster || '').trim(),
    primary_keyword: String(packageData.primary_keyword || '').trim(),
    secondary_keywords: Array.isArray(packageData.secondary_keywords) ? packageData.secondary_keywords : [],
    highlighted_block: String(packageData.highlighted_block || '').trim(),
    article_html: String(packageData.article_html || packageData.article || '').trim(),
    internal_links_suggested: Array.isArray(packageData.internal_links_suggested) ? packageData.internal_links_suggested : [],
    references: Array.isArray(packageData.references) ? packageData.references : [],
    monetization_opportunity: String(packageData.monetization_opportunity || '').trim(),
    research_notes: String(packageData.research_notes || '').trim()
  };
}
