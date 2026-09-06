// VitaCerta Radar — Validador de Dados 1.0
// Camada independente de interface. Pode ser usada pelo futuro Admin/Radar.
(function (global) {
  'use strict';

  const SOURCE_STATUS = ['ATIVA', 'PAUSADA', 'ERRO', 'NÃO CONECTADA'];
  const DATA_CLASSES = ['A', 'B', 'C', 'D'];

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function required(obj, fields) {
    return fields.filter((field) => obj[field] === undefined || obj[field] === null || obj[field] === '');
  }

  function validateSource(source) {
    const errors = [];
    const missing = required(source, [
      'source_id', 'source_name', 'source_type', 'provider',
      'api_or_manual', 'collection_frequency', 'coverage',
      'status', 'quality_status'
    ]);

    if (missing.length) errors.push(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    if (source.status && !SOURCE_STATUS.includes(source.status)) {
      errors.push(`Status inválido: ${source.status}`);
    }
    if (source.source_type && !['interno', 'externo'].includes(source.source_type)) {
      errors.push(`source_type inválido: ${source.source_type}`);
    }

    return {
      valid: errors.length === 0,
      source_id: source.source_id || null,
      status: source.status || null,
      errors
    };
  }

  function validateSourcesDocument(doc) {
    if (!isObject(doc)) return { valid: false, errors: ['Documento de fontes inválido.'], results: [] };
    if (!Array.isArray(doc.sources)) return { valid: false, errors: ['Campo sources deve ser uma lista.'], results: [] };

    const ids = new Set();
    const duplicateIds = new Set();
    doc.sources.forEach((source) => {
      if (source && source.source_id) {
        if (ids.has(source.source_id)) duplicateIds.add(source.source_id);
        ids.add(source.source_id);
      }
    });

    const results = doc.sources.map(validateSource);
    const errors = [];
    if (duplicateIds.size) errors.push(`source_id duplicado: ${Array.from(duplicateIds).join(', ')}`);
    if (results.some((r) => !r.valid)) errors.push('Uma ou mais fontes possuem erro de validação.');

    return { valid: errors.length === 0, errors, results };
  }

  function validateArticle(article) {
    const errors = [];
    const missing = required(article, [
      'article_id', 'title', 'url', 'category',
      'content_type', 'publication_status'
    ]);
    if (missing.length) errors.push(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    return { valid: errors.length === 0, article_id: article.article_id || null, errors };
  }

  function validateArticlesDocument(doc) {
    if (!isObject(doc)) return { valid: false, errors: ['Documento de artigos inválido.'], results: [] };
    if (!Array.isArray(doc.articles)) return { valid: false, errors: ['Campo articles deve ser uma lista.'], results: [] };
    const results = doc.articles.map(validateArticle);
    return {
      valid: results.every((r) => r.valid),
      errors: results.some((r) => !r.valid) ? ['Um ou mais artigos possuem erro de validação.'] : [],
      results
    };
  }

  function validateRecord(record) {
    const errors = [];
    const missing = required(record, [
      'id', 'source_type', 'source_id', 'source_name', 'metric',
      'dimension', 'period_start', 'period_end', 'collected_at',
      'value', 'unit', 'data_class', 'quality_status', 'last_updated'
    ]);

    if (missing.length) errors.push(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    if (record.data_class && !DATA_CLASSES.includes(record.data_class)) {
      errors.push(`data_class inválida: ${record.data_class}`);
    }
    if (record.data_class === 'B' && !record.formula) {
      errors.push('Registro calculado (classe B) exige fórmula.');
    }
    if (record.data_class === 'C' && !record.inference_rule) {
      errors.push('Inferência (classe C) exige inference_rule.');
    }
    if (record.data_class === 'D') {
      errors.push('Hipótese classe D não pode entrar no conjunto canônico de métricas.');
    }

    return { valid: errors.length === 0, id: record.id || null, errors };
  }

  function validateRecordsDocument(doc) {
    if (!isObject(doc)) return { valid: false, errors: ['Documento de métricas inválido.'], results: [] };
    if (!Array.isArray(doc.records)) return { valid: false, errors: ['Campo records deve ser uma lista.'], results: [] };
    const results = doc.records.map(validateRecord);
    return {
      valid: results.every((r) => r.valid),
      errors: results.some((r) => !r.valid) ? ['Um ou mais registros possuem erro de validação.'] : [],
      results
    };
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
    return response.json();
  }

  async function validateRepositoryData(basePath = '.') {
    const paths = {
      sources: `${basePath}/data/sources.json`,
      articles: `${basePath}/data/articles.json`,
      records: `${basePath}/data/records.json`
    };

    const output = {
      checked_at: new Date().toISOString(),
      valid: true,
      sources: null,
      articles: null,
      records: null,
      errors: []
    };

    for (const [key, path] of Object.entries(paths)) {
      try {
        const doc = await loadJson(path);
        const result = key === 'sources'
          ? validateSourcesDocument(doc)
          : key === 'articles'
            ? validateArticlesDocument(doc)
            : validateRecordsDocument(doc);
        output[key] = result;
        if (!result.valid) output.valid = false;
      } catch (error) {
        output.valid = false;
        output[key] = { valid: false, errors: [error.message], results: [] };
        output.errors.push(error.message);
      }
    }

    return output;
  }

  global.VitaCertaRadarValidator = {
    validateSource,
    validateSourcesDocument,
    validateArticle,
    validateArticlesDocument,
    validateRecord,
    validateRecordsDocument,
    validateRepositoryData
  };
})(typeof window !== 'undefined' ? window : globalThis);
