// VitaCerta — Camada de Publicação 1.0
// Converte itens aprovados da fila em registros publicáveis, sem publicar automaticamente.
(function (global) {
  'use strict';

  const MISSING = 'DADO NÃO DISPONÍVEL';

  function slugify(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function validateForPublication(item) {
    const errors = [];
    if (!item?.production_id) errors.push('production_id ausente');
    if (!item?.topic) errors.push('título/tópico ausente');
    if (!item?.language) errors.push('idioma ausente');
    if (!['APROVADO', 'EM_REVISAO', 'PRONTO_PARA_PUBLICAR'].includes(item?.status)) {
      errors.push(`status de produção não publicável: ${item?.status || MISSING}`);
    }
    return { valid: errors.length === 0, errors };
  }

  function buildPublicationDraft(item, options = {}) {
    const validation = validateForPublication(item);
    if (!validation.valid) {
      const error = new Error(`Item não está pronto para publicação: ${validation.errors.join('; ')}`);
      error.validation = validation;
      throw error;
    }

    const now = new Date().toISOString();
    const slug = options.slug || slugify(item.topic);

    return {
      publication_id: options.publication_id || `pub-${Date.now()}`,
      production_id: item.production_id,
      opportunity_id: item.opportunity_id || null,
      article_id: options.article_id || null,
      title: options.title || item.topic,
      slug,
      language: item.language,
      category: item.category || null,
      cluster: item.cluster || null,
      seo_title: options.seo_title || null,
      meta_description: options.meta_description || null,
      featured_image: options.featured_image || null,
      html_path: options.html_path || null,
      public_url: null,
      source_references: options.source_references || item.external_evidence || [],
      internal_links: options.internal_links || [],
      monetization_links: options.monetization_links || [],
      review_status: 'PENDENTE',
      approved_by: null,
      published_at: null,
      status: 'RASCUNHO',
      created_at: now,
      updated_at: now
    };
  }

  function approvePublication(draft, approvedBy) {
    if (!draft) throw new Error('Rascunho de publicação ausente.');
    if (!approvedBy) throw new Error('Responsável pela aprovação é obrigatório.');
    return {
      ...draft,
      review_status: 'APROVADO',
      approved_by: approvedBy,
      status: 'APROVADO',
      updated_at: new Date().toISOString()
    };
  }

  function markPublished(draft, publicUrl) {
    if (!draft) throw new Error('Publicação ausente.');
    if (draft.review_status !== 'APROVADO') throw new Error('Publicação precisa estar aprovada.');
    if (!publicUrl) throw new Error('URL pública obrigatória após publicação.');
    const now = new Date().toISOString();
    return {
      ...draft,
      public_url: publicUrl,
      published_at: now,
      status: 'PUBLICADO',
      updated_at: now
    };
  }

  function publicationReadiness(draft) {
    const issues = [];
    if (!draft?.title) issues.push('Título ausente');
    if (!draft?.slug) issues.push('Slug ausente');
    if (!draft?.language) issues.push('Idioma ausente');
    if (!draft?.source_references?.length) issues.push('Referências de fonte ausentes');
    if (!draft?.meta_description) issues.push('Meta description ausente');

    return {
      ready: issues.length === 0,
      issues,
      status: issues.length ? 'DADOS_INCOMPLETOS' : 'PRONTO_PARA_REVISAO'
    };
  }

  global.VitaCertaPublicationEngine = {
    slugify,
    validateForPublication,
    buildPublicationDraft,
    approvePublication,
    markPublished,
    publicationReadiness
  };
})(typeof window !== 'undefined' ? window : globalThis);
