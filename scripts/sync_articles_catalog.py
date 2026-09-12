#!/usr/bin/env python3
import json
import re
from pathlib import Path
from html import unescape
from datetime import datetime, timezone

CATALOG = Path('conteudos/index.html')
OUT = Path('data/articles.json')

SECTION_TO_CATEGORY = {
    'Saúde': 'PREVENÇÃO',
    'Nutrição': 'NUTRIÇÃO',
    'Movimento': 'CORPO',
    'Mente': 'MENTE',
    'Longevidade': 'LONGEVIDADE',
}


def decode(value):
    return unescape(value or '').strip()


def main():
    if not CATALOG.exists():
        raise SystemExit('Catálogo conteudos/index.html não encontrado.')

    html = CATALOG.read_text(encoding='utf-8')
    pattern = re.compile(
        r'<article data-section="([^"]+)"><small>([^<]+)</small><h2><a href="([^"]+)">([^<]+)</a></h2></article>'
    )

    articles = []
    now = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')

    for match in pattern.finditer(html):
        section_id, meta, href, title = match.groups()
        meta_parts = [decode(x) for x in decode(meta).split('·')]
        section = meta_parts[0] if meta_parts else 'Saúde'
        published_at = meta_parts[1] if len(meta_parts) > 1 else None
        slug = href.strip('/').split('/')[-1]

        articles.append({
            'article_id': f'vc-{slug}',
            'title': decode(title),
            'slug': slug,
            'url': f'/conteudos/{slug}/',
            'language': 'pt-BR',
            'category': SECTION_TO_CATEGORY.get(section, section.upper()),
            'section': section,
            'content_type': 'ARTIGO',
            'published_at': published_at,
            'publication_status': 'PUBLICADO',
            'source_origin': 'Blogger',
            'legacy_url': None,
            'migration_status': 'MIGRADO',
            'last_synced_at': now,
        })

    if not articles:
        raise SystemExit('Nenhum artigo encontrado no catálogo gerado.')

    payload = {
        'schema_version': '2.0',
        'generated_from': 'conteudos/index.html',
        'total_articles': len(articles),
        'last_synced_at': now,
        'articles': articles,
        'allowed_publication_status': ['RASCUNHO', 'PUBLICADO', 'ARQUIVADO'],
        'allowed_migration_status': ['NAO_APLICAVEL', 'PENDENTE', 'MIGRADO', 'VALIDADO', 'ERRO'],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Catálogo interno sincronizado com {len(articles)} artigos migrados.')


if __name__ == '__main__':
    main()
