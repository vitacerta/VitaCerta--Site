// VitaCerta Radar — Radar de Oportunidade 1.0
// Pré-produção editorial. 75% sinais externos + 25% sinais internos.
(function (global) {
  'use strict';

  const MISSING = 'DADO NÃO DISPONÍVEL';
  const DEFAULT_WEIGHTS = { external: 0.75, internal: 0.25 };

  function validScore(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
  }

  function calculateCombinedScore(externalScore, internalScore, weights = DEFAULT_WEIGHTS) {
    if (!validScore(externalScore) || !validScore(internalScore)) return null;
    return Number((externalScore * weights.external + internalScore * weights.internal).toFixed(2));
  }

  function evaluateOpportunity(opportunity, weights = DEFAULT_WEIGHTS) {
    const external = opportunity.external_score;
    const internal = opportunity.internal_score;
    const combined = calculateCombinedScore(external, internal, weights);
    return {
      ...opportunity,
      combined_score: combined,
      score_status: combined === null ? MISSING : 'DISPONÍVEL',
      external_status: validScore(external) ? 'DISPONÍVEL' : MISSING,
      internal_status: validScore(internal) ? 'DISPONÍVEL' : MISSING
    };
  }

  function rankOpportunities(opportunities, weights = DEFAULT_WEIGHTS) {
    const evaluated = (opportunities || []).map((item) => evaluateOpportunity(item, weights));
    const scored = evaluated.filter((item) => item.combined_score !== null)
      .sort((a, b) => b.combined_score - a.combined_score);
    const missing = evaluated.filter((item) => item.combined_score === null);
    return [...scored, ...missing];
  }

  function filterOpportunities(opportunities, filters = {}) {
    return (opportunities || []).filter((item) => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.cluster && item.cluster !== filters.cluster) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.language && item.language !== filters.language) return false;
      if (filters.search_intent && item.search_intent !== filters.search_intent) return false;
      return true;
    });
  }

  function buildSummary(opportunities, weights = DEFAULT_WEIGHTS) {
    const ranked = rankOpportunities(opportunities, weights);
    const available = ranked.filter((item) => item.combined_score !== null);
    return {
      total_opportunities: ranked.length,
      scored_opportunities: available.length,
      opportunities_without_enough_data: ranked.length - available.length,
      weights: { external: weights.external, internal: weights.internal },
      top_opportunity: available.length ? available[0] : null,
      status: available.length ? 'DISPONÍVEL' : MISSING
    };
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
    return response.json();
  }

  async function analyzeRepository(basePath = '.') {
    const [opportunityDoc, configDoc] = await Promise.all([
      loadJson(`${basePath}/data/opportunities.json`),
      loadJson(`${basePath}/data/config.json`)
    ]);
    const weights = {
      external: configDoc.production_engine?.external_intelligence_weight ?? DEFAULT_WEIGHTS.external,
      internal: configDoc.production_engine?.internal_intelligence_weight ?? DEFAULT_WEIGHTS.internal
    };
    return {
      generated_at: new Date().toISOString(),
      summary: buildSummary(opportunityDoc.opportunities, weights),
      ranking: rankOpportunities(opportunityDoc.opportunities, weights)
    };
  }

  global.VitaCertaOpportunityRadar = {
    calculateCombinedScore,
    evaluateOpportunity,
    rankOpportunities,
    filterOpportunities,
    buildSummary,
    analyzeRepository
  };
})(typeof window !== 'undefined' ? window : globalThis);
