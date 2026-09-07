// VitaCerta — Motor de Produção Editorial 1.0
// Converte oportunidades priorizadas em briefs rastreáveis.
(function (global) {
  'use strict';

  const DEFAULT_WEIGHTS = { external: 0.75, internal: 0.25 };
  const MISSING = 'DADO NÃO DISPONÍVEL';

  function hasEvidence(value) {
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }

  function buildBrief(opportunity, config = {}) {
    if (!opportunity || !opportunity.topic) throw new Error('Oportunidade inválida: tópico obrigatório.');

    const weights = {
      external: config.external_weight ?? DEFAULT_WEIGHTS.external,
      internal: config.internal_weight ?? DEFAULT_WEIGHTS.internal
    };

    return {
      topic: opportunity.topic,
      language: opportunity.language || 'pt-BR',
      category: opportunity.category || null,
      cluster: opportunity.cluster || null,
      search_intent: opportunity.search_intent || MISSING,
      intelligence_mix: {
        external_weight: weights.external,
        internal_weight: weights.internal,
        external_evidence_status: hasEvidence(opportunity.external_evidence) ? 'DISPONÍVEL' : MISSING,
        internal_evidence_status: hasEvidence(opportunity.internal_evidence) ? 'DISPONÍVEL' : MISSING
      },
      recommended_angle: opportunity.recommended_angle || null,
      recommended_format: opportunity.recommended_format || 'artigo',
      editorial_requirements: {
        factual_claims_require_evidence: true,
        distinguish_fact_calculation_inference_hypothesis: true,
        no_fabricated_metrics: true,
        include_contextual_internal_link_when_available: true,
        seo_ready: true,
        adsense_ready: true,
        preserve_vitacerta_editorial_identity: true
      },
      publication_gate: {
        automatic_publication: false,
        requires_review: true,
        status: 'BRIEF_PRONTO'
      }
    };
  }

  function productionReadiness(opportunity) {
    const issues = [];
    if (!opportunity?.topic) issues.push('Tópico ausente');
    if (!opportunity?.category) issues.push('Categoria ausente');
    if (!hasEvidence(opportunity?.external_evidence)) issues.push('Evidência externa ausente');
    if (!hasEvidence(opportunity?.internal_evidence)) issues.push('Evidência interna ausente');

    return {
      ready: issues.length === 0,
      issues,
      status: issues.length === 0 ? 'PRONTO' : 'DADOS_INCOMPLETOS'
    };
  }

  function createProductionItem(opportunity, config = {}) {
    const now = new Date().toISOString();
    const brief = buildBrief(opportunity, config);
    const readiness = productionReadiness(opportunity);
    return {
      production_id: `prod-${Date.now()}`,
      opportunity_id: opportunity.opportunity_id || null,
      topic: opportunity.topic,
      language: opportunity.language || 'pt-BR',
      category: opportunity.category || null,
      cluster: opportunity.cluster || null,
      search_intent: opportunity.search_intent || null,
      external_weight: config.external_weight ?? DEFAULT_WEIGHTS.external,
      internal_weight: config.internal_weight ?? DEFAULT_WEIGHTS.internal,
      external_evidence: opportunity.external_evidence || [],
      internal_evidence: opportunity.internal_evidence || [],
      editorial_brief: brief,
      recommended_angle: opportunity.recommended_angle || null,
      recommended_format: opportunity.recommended_format || 'artigo',
      status: readiness.ready ? 'BRIEF_PRONTO' : 'AGUARDANDO_BRIEF',
      readiness,
      created_at: now,
      updated_at: now
    };
  }

  global.VitaCertaProductionEngine = {
    buildBrief,
    productionReadiness,
    createProductionItem
  };
})(typeof window !== 'undefined' ? window : globalThis);
