// VitaCerta Radar — Radar de Performance 1.0
// Camada de leitura pós-publicação. Trabalha apenas com métricas existentes.
(function (global) {
  'use strict';

  const DEFAULT_MISSING = 'DADO NÃO DISPONÍVEL';
  const SUPPORTED_METRICS = [
    'views',
    'users',
    'sessions',
    'engagement_time',
    'impressions',
    'clicks',
    'ctr',
    'position',
    'affiliate_clicks',
    'affiliate_conversions',
    'affiliate_revenue',
    'adsense_impressions',
    'adsense_clicks',
    'adsense_ctr',
    'rpm',
    'revenue'
  ];

  function getEngine() {
    if (!global.VitaCertaRadarAnalysis) {
      throw new Error('Motor Universal de Análise não carregado.');
    }
    return global.VitaCertaRadarAnalysis;
  }

  function availableMetrics(records) {
    const set = new Set();
    (records || []).forEach((record) => {
      if (record && record.metric && record.data_class !== 'D' && record.quality_status !== 'INVALIDO') {
        set.add(record.metric);
      }
    });
    return Array.from(set).sort();
  }

  function missingMetrics(records) {
    const available = new Set(availableMetrics(records));
    return SUPPORTED_METRICS.filter((metric) => !available.has(metric));
  }

  function buildRanking(articles, records, metric, options = {}) {
    const engine = getEngine();
    const direction = options.direction || (metric === 'position' ? 'asc' : 'desc');
    const limit = Number.isFinite(options.limit) ? options.limit : null;
    const filtered = engine.filterArticles(articles, options.filters || {});
    let ranking = engine.rankArticlesByMetric(filtered, records, metric, direction);
    if (limit && limit > 0) ranking = ranking.slice(0, limit);
    return ranking;
  }

  function articleScorecard(article, records) {
    const engine = getEngine();
    const scorecard = {
      article_id: article.article_id,
      title: article.title,
      category: article.category,
      cluster: article.cluster || null,
      publication_status: article.publication_status,
      migration_status: article.migration_status || null,
      metrics: {}
    };

    SUPPORTED_METRICS.forEach((metric) => {
      const ranked = engine.rankArticlesByMetric([article], records, metric, metric === 'position' ? 'asc' : 'desc');
      const item = ranked[0];
      scorecard.metrics[metric] = item && item.status === 'DISPONÍVEL'
        ? {
            value: item.value,
            unit: item.unit,
            evidence_level: item.evidence_level,
            status: 'DISPONÍVEL'
          }
        : {
            value: null,
            unit: null,
            evidence_level: null,
            status: DEFAULT_MISSING
          };
    });

    return scorecard;
  }

  function overview(articles, records) {
    const engine = getEngine();
    return {
      generated_at: new Date().toISOString(),
      summary: engine.summarize(articles, records),
      available_metrics: availableMetrics(records),
      missing_metrics: missingMetrics(records),
      readiness: {
        content_inventory: (articles || []).length > 0 ? 'PRONTO' : DEFAULT_MISSING,
        performance_metrics: (records || []).length > 0 ? 'PRONTO' : DEFAULT_MISSING
      }
    };
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
    return response.json();
  }

  async function loadPerformanceRadar(basePath = '.') {
    const [articleDoc, recordDoc] = await Promise.all([
      loadJson(`${basePath}/data/articles.json`),
      loadJson(`${basePath}/data/records.json`)
    ]);

    return {
      articles: articleDoc.articles || [],
      records: recordDoc.records || [],
      overview: overview(articleDoc.articles || [], recordDoc.records || [])
    };
  }

  global.VitaCertaPerformanceRadar = {
    SUPPORTED_METRICS,
    availableMetrics,
    missingMetrics,
    buildRanking,
    articleScorecard,
    overview,
    loadPerformanceRadar
  };
})(typeof window !== 'undefined' ? window : globalThis);
