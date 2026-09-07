// VitaCerta Radar — Motor Universal de Análise 1.0
// Analisa artigos e métricas canônicas sem inventar dados ausentes.
(function (global) {
  'use strict';

  const DEFAULT_MISSING = 'DADO NÃO DISPONÍVEL';

  const normalize = (value) => String(value ?? '').trim().toLowerCase();
  const asDate = (value) => value ? new Date(value) : null;

  function filterArticles(articles, filters = {}) {
    return (articles || []).filter((article) => {
      if (filters.category && normalize(article.category) !== normalize(filters.category)) return false;
      if (filters.cluster && normalize(article.cluster) !== normalize(filters.cluster)) return false;
      if (filters.content_type && normalize(article.content_type) !== normalize(filters.content_type)) return false;
      if (filters.publication_status && normalize(article.publication_status) !== normalize(filters.publication_status)) return false;
      if (filters.migration_status && normalize(article.migration_status) !== normalize(filters.migration_status)) return false;
      if (filters.language && normalize(article.language) !== normalize(filters.language)) return false;
      if (filters.from && asDate(article.published_at) && asDate(article.published_at) < asDate(filters.from)) return false;
      if (filters.to && asDate(article.published_at) && asDate(article.published_at) > asDate(filters.to)) return false;
      return true;
    });
  }

  function groupArticles(articles, field) {
    return (articles || []).reduce((acc, article) => {
      const key = article[field] || DEFAULT_MISSING;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function sortArticles(articles, field = 'published_at', direction = 'desc') {
    const factor = direction === 'asc' ? 1 : -1;
    return [...(articles || [])].sort((a, b) => {
      const av = field.includes('date') || field.endsWith('_at') ? (asDate(a[field])?.getTime() || 0) : a[field];
      const bv = field.includes('date') || field.endsWith('_at') ? (asDate(b[field])?.getTime() || 0) : b[field];
      if (av === bv) return 0;
      return av > bv ? factor : -factor;
    });
  }

  function metricIndex(records) {
    const index = new Map();
    (records || []).forEach((record) => {
      if (record.data_class === 'D' || record.quality_status === 'INVALIDO') return;
      const key = `${record.dimension}:${record.dimension_id}:${record.metric}`;
      const current = index.get(key);
      if (!current || new Date(record.last_updated) > new Date(current.last_updated)) index.set(key, record);
    });
    return index;
  }

  function rankArticlesByMetric(articles, records, metric, direction = 'desc') {
    const index = metricIndex(records);
    const ranked = (articles || []).map((article) => {
      const record = index.get(`article:${article.article_id}:${metric}`);
      return {
        article_id: article.article_id,
        title: article.title,
        category: article.category,
        cluster: article.cluster || null,
        metric,
        value: record ? record.value : null,
        unit: record ? record.unit || null : null,
        evidence_level: record ? record.evidence_level || null : null,
        status: record ? 'DISPONÍVEL' : DEFAULT_MISSING
      };
    });

    const available = ranked.filter((item) => item.value !== null && item.value !== undefined);
    const missing = ranked.filter((item) => item.value === null || item.value === undefined);
    const factor = direction === 'asc' ? 1 : -1;
    available.sort((a, b) => (Number(a.value) - Number(b.value)) * factor);
    return [...available, ...missing];
  }

  function summarize(articles, records) {
    const list = articles || [];
    const metrics = records || [];
    return {
      total_articles: list.length,
      by_category: groupArticles(list, 'category'),
      by_cluster: groupArticles(list, 'cluster'),
      by_migration_status: groupArticles(list, 'migration_status'),
      metric_records: metrics.length,
      metric_data_available: metrics.length > 0,
      metric_status: metrics.length > 0 ? 'DISPONÍVEL' : DEFAULT_MISSING
    };
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
    return response.json();
  }

  async function analyzeRepository(basePath = '.') {
    const [articleDoc, recordDoc] = await Promise.all([
      loadJson(`${basePath}/data/articles.json`),
      loadJson(`${basePath}/data/records.json`)
    ]);
    return {
      generated_at: new Date().toISOString(),
      summary: summarize(articleDoc.articles, recordDoc.records),
      articles: articleDoc.articles,
      records: recordDoc.records
    };
  }

  global.VitaCertaRadarAnalysis = {
    filterArticles,
    groupArticles,
    sortArticles,
    rankArticlesByMetric,
    summarize,
    analyzeRepository
  };
})(typeof window !== 'undefined' ? window : globalThis);
