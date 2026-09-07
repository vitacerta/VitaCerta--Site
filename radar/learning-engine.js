// VitaCerta Radar — Motor de Aprendizado 1.0
// Fecha o ciclo: publicação -> desempenho -> evidência -> recomendação.
(function (global) {
  'use strict';

  const MISSING = 'DADO NÃO DISPONÍVEL';

  function latestMetric(records, articleId, metric) {
    const candidates = (records || []).filter((r) =>
      r.dimension === 'article' &&
      r.dimension_id === articleId &&
      r.metric === metric &&
      r.data_class !== 'D' &&
      r.quality_status !== 'INVALIDO'
    );
    if (!candidates.length) return null;
    return candidates.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))[0];
  }

  function collectPerformance(records, articleId) {
    const metrics = ['views', 'impressions', 'clicks', 'ctr', 'position', 'affiliate_conversions', 'rpm', 'revenue'];
    return metrics.reduce((acc, metric) => {
      const record = latestMetric(records, articleId, metric);
      acc[metric] = record ? {
        value: record.value,
        unit: record.unit || null,
        evidence_level: record.evidence_level || record.data_class || null,
        quality_status: record.quality_status,
        status: 'DISPONÍVEL'
      } : { value: null, status: MISSING };
      return acc;
    }, {});
  }

  function compare(current, baseline) {
    if (typeof current !== 'number' || typeof baseline !== 'number') return null;
    if (baseline === 0) return { absolute: current, percentage: null };
    return {
      absolute: Number((current - baseline).toFixed(4)),
      percentage: Number((((current - baseline) / baseline) * 100).toFixed(2))
    };
  }

  function buildLearningRecord({ article, publication, opportunity, records, baseline = {}, periodStart, periodEnd }) {
    if (!article?.article_id) throw new Error('article_id obrigatório para aprendizado.');
    const performance = collectPerformance(records, article.article_id);
    const comparisons = {};
    Object.keys(performance).forEach((metric) => {
      const current = performance[metric].value;
      comparisons[metric] = compare(current, baseline[metric]);
    });

    const availableCount = Object.values(performance).filter((item) => item.status === 'DISPONÍVEL').length;
    const now = new Date().toISOString();

    return {
      learning_id: `learn-${article.article_id}-${Date.now()}`,
      article_id: article.article_id,
      publication_id: publication?.publication_id || null,
      opportunity_id: opportunity?.opportunity_id || null,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      performance_metrics: performance,
      baseline_metrics: baseline,
      comparisons,
      observations: [],
      validated_findings: [],
      hypotheses: [],
      recommended_actions: [],
      weight_adjustment_proposal: null,
      status: availableCount > 0 ? 'EM_ANALISE' : 'AGUARDANDO_DADOS',
      created_at: now,
      updated_at: now
    };
  }

  function proposeWeightAdjustment(learningRecords, currentWeights = { external: 0.75, internal: 0.25 }) {
    const analyzed = (learningRecords || []).filter((r) => r.status === 'ANALISADO' && r.validated_findings?.length);
    if (!analyzed.length) {
      return {
        proposed: false,
        reason: 'Evidência interna insuficiente para recalibrar os pesos.',
        current_weights: currentWeights
      };
    }
    return {
      proposed: false,
      reason: 'Recalibração automática desativada. Evidências devem ser revisadas pelo administrador.',
      current_weights: currentWeights,
      analyzed_records: analyzed.length
    };
  }

  global.VitaCertaLearningEngine = {
    collectPerformance,
    compare,
    buildLearningRecord,
    proposeWeightAdjustment
  };
})(typeof window !== 'undefined' ? window : globalThis);
